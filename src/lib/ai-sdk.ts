/**
 * AI SDK 统一封装 - 支持多种大模型 API（零依赖，原生实现）
 */

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  temperature?: number
  top_p?: number
  top_k?: number
  max_tokens?: number
}

/**
 * OpenRouter API 客户端（核心，零依赖）⭐推荐默认方案
 */
export class OpenRouterClient {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1'

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * 文本生成
   */
  async generate (
    prompt: string,
    model: string = 'mistralai/mistral-7b-instruct',
    options?: ChatOptions
  ): Promise<string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
      'X-Title': 'Next.js AI Recommend'
    }

    // OpenRouter 要求 HTTP-Referer（仅在浏览器环境）
    if (typeof window !== 'undefined') {
      headers['HTTP-Referer'] = window.location.origin
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              '你是一个电商商品推荐专家，专业、友好地为用户提供商品推荐建议'
          },
          { role: 'user', content: prompt }
        ],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 512
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `API 错误：${error.error?.message || response.statusText}`
      )
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }

  /**
   * 多轮对话
   */
  async chat (
    messages: Message[],
    model?: string,
    options?: ChatOptions
  ): Promise<string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
      'X-Title': 'Next.js AI Recommend'
    }

    // OpenRouter 要求 HTTP-Referer（仅在浏览器环境）
    if (typeof window !== 'undefined') {
      headers['HTTP-Referer'] = window.location.origin
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || 'mistralai/mistral-7b-instruct',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 512
      })
    })

    if (!response.ok) {
      throw new Error(`API 错误：${response.statusText}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }

  /**
   * 获取支持的模型列表
   */
  async listModels (): Promise<any[]> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'X-Title': 'Next.js AI Recommend'
    }

    // OpenRouter 要求 HTTP-Referer（仅在浏览器环境）
    if (typeof window !== 'undefined') {
      headers['HTTP-Referer'] = window.location.origin
    }

    const response = await fetch(`${this.baseUrl}/models`, {
      headers
    })

    if (!response.ok) {
      throw new Error(`获取模型列表失败：${response.statusText}`)
    }

    return await response.json()
  }
}

/**
 * 阿里云 DashScope（通义千问）客户端（可选）
 */
export class QwenClient {
  private apiKey: string
  private baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1'

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * 文本生成
   */
  async generate (prompt: string, options?: ChatOptions): Promise<string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`
    }

    // 仅浏览器环境添加 Referer（可选）
    if (typeof window !== 'undefined') {
      headers['HTTP-Referer'] = window.location.origin
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个专业的商品推荐专家' },
          { role: 'user', content: prompt }
        ],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 512
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`API 错误：${error.message || response.statusText}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }

  /**
   * 多轮对话
   */
  async chat (messages: Message[], options?: ChatOptions): Promise<string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`
    }

    // 仅浏览器环境添加 Referer（可选）
    if (typeof window !== 'undefined') {
      headers['HTTP-Referer'] = window.location.origin
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 512
      })
    })

    if (!response.ok) {
      throw new Error(`API 错误：${response.statusText}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }
}

/**
 * 创建 OpenRouter 客户端（推荐默认方案）
 */
export function createOpenRouterClient (): OpenRouterClient {
  const apiKey = process.env.OPENROUTER_API_KEY || ''
  return new OpenRouterClient(apiKey)
}
