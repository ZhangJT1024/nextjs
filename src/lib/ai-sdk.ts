/**
 * AI SDK 统一封装 - 支持多种大模型 API
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
 * 阿里云 DashScope（通义千问）客户端
 */
export class QwenClient {
  private apiKey: string
  private baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * 文本生成
   */
  async generate(prompt: string, options?: ChatOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
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
  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
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
 * LangChain 工具链封装（推荐！）
 */
import { ChatOpenAI, OpenAIStream } from '@langchain/openai'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { BaseChatModel } from 'langchain/agents'

export interface LangChainConfig {
  modelName: string
  temperature?: number
}

/**
 * LangChain ChatOpenAI 客户端
 */
export class LangChainClient {
  private client: ChatOpenAI
  private config: LangChainConfig

  constructor(apiKey: string, config: LangChainConfig) {
    this.config = config
    this.client = new ChatOpenAI({
      openAIApiKey: apiKey, // OpenRouter API Key
      modelName: config.modelName,
      temperature: config.temperature || 0.7
    })
  }

  /**
   * 单轮对话（推荐 API）
   */
  async invoke(messages: Message[]): Promise<string> {
    const response = await this.client.invoke(messages)
    return response.content as string
  }

  /**
   * 多轮对话流式输出
   */
  streamChat(messages: Message[]) {
    return this.client.stream(messages).then((stream) => {
      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      return new Promise<string>((resolve, reject) => {
        const read = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              resolve(fullResponse)
            } else {
              fullResponse += decoder.decode(value)
              read()
            }
          }).catch(reject)
        }
        read()
      })
    })
  }

  /**
   * 结合 LangChain 工具链（Agent 模式）
   */
  async withTools(tools: any[], messages: Message[]): Promise<any> {
    const agent = this.client.withStructuredToolArray(tools)
    return agent.invoke(messages)
  }
}

/**
 * OpenRouter 通用 API 客户端（最推荐！支持所有大模型）
 */
export class OpenRouterClient {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * 文本生成
   */
  async generate(prompt: string, model: string = 'mistralai/mistral-7b-instruct', options?: ChatOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': window.location.origin, // OpenRouter 要求
        'X-Title': 'Next.js AI Recommend'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: '你是一个电商商品推荐专家，专业、友好地为用户提供商品推荐建议' },
          { role: 'user', content: prompt }
        ],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 512
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`API 错误：${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }

  /**
   * 多轮对话
   */
  async chat(messages: Message[], model?: string, options?: ChatOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Next.js AI Recommend'
      },
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
  async listModels(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Next.js AI Recommend'
      }
    })

    if (!response.ok) {
      throw new Error(`获取模型列表失败：${response.statusText}`)
    }

    return await response.json()
  }
}

/**
 * 创建 OpenRouter 客户端（推荐默认方案）
 */
export function createOpenRouterClient(): OpenRouterClient {
  const apiKey = process.env.OPENROUTER_API_KEY || ''
  return new OpenRouterClient(apiKey)
}
