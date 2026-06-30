/**
 * Ollama 本地大模型客户端封装
 */

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  temperature?: number // 0-2，默认 0.7
  top_p?: number // nucleus sampling，默认 0.9
  num_predict?: number // 生成 token 数量
  stop?: string[] // 停止序列
}

/**
 * Ollama API 配置
 */
export interface OllamaConfig {
  apiUrl: string // 例如：http://localhost:11434
  modelName: string // 模型名称，例如：llama3.2
  defaultOptions?: ChatOptions
}

/**
 * Ollama 客户端类
 */
export class OllamaClient {
  private config: OllamaConfig
  private baseUrl: URL

  constructor(config: OllamaConfig) {
    this.config = config
    this.baseUrl = new URL(`${config.apiUrl}/api`)
  }

  /**
   * 生成文本（适用于简单推荐场景）
   */
  async generate(prompt: string, options?: ChatOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl.origin}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.modelName,
        prompt,
        stream: false,
        options: {
          ...this.config.defaultOptions,
          ...options
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API 错误：${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.response || ''
  }

  /**
   * 多轮对话（适用于复杂推荐场景）
   */
  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl.origin}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.modelName,
        messages,
        stream: false,
        options: {
          ...this.config.defaultOptions,
          ...options
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API 错误：${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.message?.content || ''
  }

  /**
   * 获取模型列表
   */
  async listModels(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl.origin}/tags`, {
      method: 'GET'
    })

    if (!response.ok) {
      throw new Error(`获取模型列表失败：${response.status}`)
    }

    const data = await response.json()
    return (data.models || []).map(m => m.name)
  }

  /**
   * 拉取模型
   */
  async pullModel(model: string): Promise<void> {
    console.log(`正在拉取模型：${model} ...`)
    const response = await fetch(`${this.baseUrl.origin}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model })
    })

    if (!response.ok) {
      throw new Error(`拉取模型失败：${response.status}`)
    }
  }

  /**
   * 运行模型
   */
  async run(model: string): Promise<void> {
    console.log(`正在运行模型：${model} ...`)
    const response = await fetch(`${this.baseUrl.origin}/api/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, name: model }) // Ollama 会自动拉取模型
    })

    if (!response.ok) {
      throw new Error(`运行模型失败：${response.status}`)
    }
  }

  /**
   * 检查模型是否存在
   */
  async checkModelExists(model: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.origin}/api/tags`)
      const data = await response.json()
      return (data.models || []).some(m => m.name === model)
    } catch {
      return false
    }
  }

  /**
   * 构建推荐请求的 prompt
   */
  buildRecommendationPrompt(userProfile: string, products: any[]): string {
    const productSummary = products.length > 0
      ? `可供推荐的商品（${products.length}个）：\n- ${products.map(p => `${p.name} - ¥${p.price}`).join('\n')}`
      : '系统中有多个商品可供选择'

    return `你是一个专业的电商商品推荐专家。

【用户画像】
${userProfile || '暂无'}

【可用商品】
${productSummary}

【任务要求】
1. 根据用户的偏好和特征，从可用商品中进行智能推荐
2. 推荐理由要充分，解释为什么推荐这些商品
3. 如果用户有特定预算或类别偏好，请优先满足
4. 推荐数量控制在 3-5 个商品
5. 用友好、专业的语气，字数约 200-300 字

请生成个性化推荐文案：`
  }
}

/**
 * 创建默认客户端实例（单例模式）
 */
export function createOllamaClient(): OllamaClient {
  const apiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434'
  const modelName = process.env.MODEL_NAME || 'llama3.2'

  return new OllamaClient({
    apiUrl,
    modelName,
    defaultOptions: {
      temperature: 0.7,
      top_p: 0.9,
      num_predict: 512
    }
  })
}

// 默认导出
export default createOllamaClient
