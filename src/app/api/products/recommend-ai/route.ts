import { NextRequest, NextResponse } from 'next/server'
import { OpenRouterClient } from '@/lib/ai-sdk'

// AI 代理转发层 - 支持多种模型源
interface AIConfig {
  model: string
  baseURL?: string
  authToken?: string

}

export async function POST(request: Request) {
  try {
    const { userId, history, context, messages } = await request.json()

    // 1. 读取配置
    const config: AIConfig = {
      model: process.env.ANTHROPIC_MODEL || 'qwen/qwen3.5-9b',
      baseURL: process.env.ANTHROPIC_BASE_URL || 'http://localhost:1234/v1',
      authToken: process.env.ANTHROPIC_AUTH_TOKEN || 'lmstudio'
    }

    // 2. 准备请求内容
    const userProfile = userId && history
      ? `用户最近浏览了${history.slice(-5).map(p => p.name).join(', ')}，类别偏好：${context?.categoryPreference || '未设定'}`
      : '暂无用户画像信息'

    const systemPrompt = `你是一个专业的电商商品推荐专家。请根据以下信息和用户需求，生成个性化的商品推荐文案。

【用户背景】
${userProfile}

【上下文信息】
- 类别偏好：${context?.categoryPreference || '不限'}
- 预算范围：${context?.budgetRange || '不限'}
- 兴趣标签：${context?.interests || '未设定'}

【任务要求】
1. 基于用户的历史行为和当前场景，生成个性化推荐建议
2. 推荐理由要充分，解释为什么推荐这些商品
3. 推荐数量控制在 3-5 个商品
4. 用友好、专业的语气，字数约 200-300 字

请生成推荐文案：`

    const userMessages = [
      { role: 'system', content: '你是一个电商商品推荐专家' },
      { role: 'user', content: systemPrompt + (messages?.[0]?.content || '') }
    ]

    // 3. 调用本地 AI API（通过 LM Studio）
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.authToken}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      'X-Title': 'Next.js AI Recommend'
    }

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        messages: userMessages,
        temperature: 0.7,
        max_tokens: 512
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { success: false, message: `AI API 请求失败：${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    // 4. 返回推荐结果
    return NextResponse.json({
      success: true,
      data: {
        userId,
        context: context || {},
        timestamp: new Date().toISOString(),
        description: data.choices?.[0]?.message?.content || '生成成功'
      }
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'AI 代理服务出错'
    console.error('AI 代理错误:', errorMessage)

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const productId = url.searchParams.get('productId')

  if (!productId) {
    return NextResponse.json({ error: '缺少 productId 参数' }, { status: 400 })
  }

  try {
    // 单商品推荐模式
    const config: AIConfig = {
      model: process.env.ANTHROPIC_MODEL || 'qwen/qwen3.5-9b',
      baseURL: process.env.ANTHROPIC_BASE_URL || 'http://localhost:1234/v1',
      authToken: process.env.ANTHROPIC_AUTH_TOKEN || 'lmstudio'
    }

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.authToken}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'Next.js AI Recommend'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: '你是一个电商商品推荐专家，请为以下商品生成有吸引力的推荐文案' },
          { role: 'user', content: `为 ID 为${productId}的商品生成简短有力的推荐描述` }
        ],
        temperature: 0.7,
        max_tokens: 256
      })
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'AI API 请求失败' }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: {
        productId,
        recommendation: data.choices?.[0]?.message?.content || ''
      }
    })

  } catch (error) {
    return NextResponse.json({ error: '推荐服务出错' }, { status: 500 })
  }
}
