import { NextRequest, NextResponse } from 'next/server'
import createOllamaClient from '@/lib/ollama-client'

// 创建 Ollama 客户端实例
const ollama = createOllamaClient()

interface Product {
  id: number
  name: string
  category: string
  price: number
  description?: string
}

export async function POST(request: Request) {
  try {
    const { userId, history, context } = await request.json()

    // 1. 准备推荐请求内容
    const systemPrompt = `你是一个商品推荐专家。根据用户的浏览历史、上下文和商品信息，
提供个性化的商品推荐。

当前时间：${new Date().toLocaleDateString()}
用户类别偏好：${context?.categoryPreference || '未设定'}
用户预算范围：${context?.budgetRange || '不限'}
`

    // 2. 构建用户画像描述
    let userProfile = ''
    if (userId && history) {
      const recentProducts = history.slice(-5)
      const categories = [...new Set(recentProducts.map(p => p.category))]
      userProfile = `用户最近浏览了${categories.length}类商品：${Array.from(categories).join(', ')}`
    }

    // 3. 获取推荐描述（调用本地大模型）
    const recommendations = await callLocalLLM(systemPrompt, userProfile)

    return NextResponse.json({
      success: true,
      data: {
        userId,
        context: context || {},
        timestamp: new Date().toISOString(),
        description: recommendations
      }
    })
  } catch (error) {
    console.error('推荐 API 错误:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '推荐服务不可用'
      },
      { status: 500 }
    )
  }
}

// 调用本地大模型 API
async function callLocalLLM(systemPrompt: string, userProfile: string): Promise<string> {
  try {
    // 使用封装好的 OllamaClient
    const response = await ollama.generate(
      `请基于以下用户画像和场景，生成商品推荐描述：\n\n${systemPrompt}\n用户背景：${userProfile}`,
      {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 512
      }
    )

    return response || ''
  } catch (error) {
    console.error('调用本地 LLM 错误:', error)
    throw new Error('本地大模型服务不可用')
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const productId = url.searchParams.get('productId') as string

  if (!productId) {
    return NextResponse.json(
      { error: '缺少 productId 参数' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: `生成商品推荐文案，用于推荐 ID 为${productId}的商品。`,
        stream: false,
        options: { temperature: 0.7 }
      })
    })

    const result = await response.json()

    return NextResponse.json({
      success: true,
      data: {
        productId,
        recommendation: result.response
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: '推荐服务出错' },
      { status: 500 }
    )
  }
}
