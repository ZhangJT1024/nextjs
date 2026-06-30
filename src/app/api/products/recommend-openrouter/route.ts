import { NextRequest, NextResponse } from 'next/server'
import { OpenRouterClient } from '@/lib/ai-sdk'

// 创建 OpenRouter API 客户端（零依赖，原生 fetch）
const openRouter = new OpenRouterClient(process.env.OPENROUTER_API_KEY || '')

interface Product {
  id: number
  name: string
  category: string
  price: number
  description?: string
}

export async function POST (request: Request) {
  try {
    const { userId, history, context } = await request.json()

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message:
            'OpenRouter API Key 未配置，请先设置 OPENROUTER_API_KEY 环境变量'
        },
        { status: 403 }
      )
    }

    // 1. 准备推荐请求内容
    const userProfile =
      userId && history
        ? `用户最近浏览了${history
            .slice(-5)
            .map(p => p.name)
            .join(', ')}，类别偏好：${context?.categoryPreference || '未设定'}`
        : '暂无用户画像信息'

    const systemPrompt = `你是一个专业的电商商品推荐专家。
请根据以下信息和用户需求，生成个性化的商品推荐文案。

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

    // 2. 调用 OpenRouter API（零依赖，原生 fetch）
    const response = await openRouter.chat(
      [
        { role: 'system', content: '你是一个电商商品推荐专家' },
        { role: 'user', content: systemPrompt }
      ],
      'mistralai/mistral-7b-instruct:free', // 模型名称（必填）
      {
        // 选项对象
        temperature: 0.7,
        max_tokens: 512
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        userId,
        context: context || {},
        timestamp: new Date().toISOString(),
        description: response
      }
    })
  } catch (error) {
    console.error('推荐 API 错误:', error)

    // OpenRouter API Key 错误或模型请求失败
    const errorMessage = error instanceof Error ? error.message : 'API 调用失败'

    return NextResponse.json(
      {
        success: false,
        message: errorMessage
      },
      { status: 500 }
    )
  }
}

export async function GET (request: Request) {
  const url = new URL(request.url)
  const productId = url.searchParams.get('productId') as string

  if (!productId) {
    return NextResponse.json({ error: '缺少 productId 参数' }, { status: 400 })
  }

  try {
    // 使用 OpenRouter API 生成商品推荐文案（零依赖）
    const response = await openRouter.chat(
      [
        {
          role: 'system',
          content:
            '你是一个电商商品推荐专家，请为以下商品生成有吸引力的推荐文案'
        },
        {
          role: 'user',
          content: `为 ID 为${productId}的商品生成简短有力的推荐描述`
        }
      ],
      'mistralai/mistral-7b-instruct:free', // 模型名称（必填）
      {} // options（可选）
    )

    return NextResponse.json({
      success: true,
      data: {
        productId,
        recommendation: response
      }
    })
  } catch (error) {
    return NextResponse.json({ error: '推荐服务出错' }, { status: 500 })
  }
}
