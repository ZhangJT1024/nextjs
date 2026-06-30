/**
 * AI 智能推荐服务 - 完整的工具链技术方案
 *
 * 支持：OpenRouter API（主方案）、阿里云 DashScope、百度文心一言等
 */

import { OpenRouterClient } from './ai-sdk'
import type { Message } from './ai-sdk'

export interface UserContext {
  userId: string | number
  history: any[] // 历史行为数据
  categoryPreference?: string
  budgetRange?: string
  interests?: string
}

/**
 * AI 智能推荐服务类
 */
export class AIPromotionService {
  private apiClient: OpenRouterClient
  private defaultModel = 'mistralai/mistral-7b-instruct:free' // 免费模型，适合测试

  constructor(apiKey?: string) {
    this.apiClient = new OpenRouterClient(apiKey || process.env.OPENROUTER_API_KEY || '')
  }

  /**
   * 个性化推荐（核心接口）
   */
  async generateRecommendation(
    context: UserContext,
    options?: { model?: string; temperature?: number }
  ): Promise<string> {
    const userProfile = context.userId && context.history
      ? `用户画像：最近浏览了${context.history.slice(-3).map(p => p.name).join(', ')}，\n偏好类别：${context.categoryPreference || '不限'}，预算：${context.budgetRange || '不限'}`
      : '暂无详细用户画像'

    const prompt = `请基于以下信息生成商品个性化推荐文案：

【用户需求】
- 用户背景：${userProfile}
- 偏好：${JSON.stringify(context, null, 2)}

【任务要求】
1. 分析用户潜在需求
2. 推荐 3-5 个可能匹配的商品
3. 每个推荐说明推荐理由（如：性价比高、符合兴趣等）
4. 总字数控制在 200-300 字，语气友好专业

请开始生成：`

    return await this.apiClient.chat([
      { role: 'system', content: '你是一个专业的电商商品推荐专家' },
      { role: 'user', content: prompt }
    ], options?.model, {
      temperature: options?.temperature || 0.7,
      max_tokens: 512
    })
  }

  /**
   * 多轮对话推荐（进阶功能）
   */
  async multiTurnConversation(
    context: UserContext,
    conversationHistory: Message[]
  ): Promise<string> {
    const messages = [...conversationHistory]

    return await this.apiClient.chat(messages, 'mistralai/mistral-7b-instruct', {
      temperature: 0.6
    })
  }

  /**
   * 基于用户行为的协同过滤推荐（结合行为数据）
   */
  async collaborativeFilteringRecommendation(
    userId: string | number,
    targetCategories: string[] = ['electronics']
  ): Promise<string> {
    const prompt = `根据用户的浏览/购买历史，进行协同过滤推荐。

用户 ID：${userId}
目标类别：${targetCategories.join(', ')}

请分析相似用户群体的偏好，并生成推荐建议（重点突出"发现与您品味相似的用户也喜欢..."）`

    return await this.generateRecommendation({ userId }, { prompt })
  }
}

/**
 * 智能路由 - 根据环境自动选择 API 方案
 */
export class SmartRoutingService {
  private static instances = new Map<string, AIPromotionService>()

  /**
   * 获取服务实例（自动检测配置）
   */
  static getService(type: 'ollama' | 'openrouter' | 'auto'): AIPromotionService {
    if (!SmartRoutingService.instances.has(type)) {
      const apiKey = process.env.OPENROUTER_API_KEY
      let service

      if (type === 'ollama') {
        // Ollama 方案（保留）
        const { createOllamaClient } = require('./ollama-client')
        service = new AIPromotionService(undefined) // 使用封装的客户端
      } else if (type === 'openrouter' || apiKey) {
        // OpenRouter API（推荐）
        service = new AIPromotionService(apiKey)
      } else {
        throw new Error('请先配置 OPENROUTER_API_KEY 环境变量')
      }

      SmartRoutingService.instances.set(type, service)
    }

    return SmartRoutingService.instances.get(type)!
  }

  /**
   * 自动选择最优 API（优先 OpenRouter，降级 Ollama）
   */
  static async autoGenerateRecommendation(
    context: UserContext
  ): Promise<string> {
    try {
      // 尝试 OpenRouter（有配额，更快）
      const service = SmartRoutingService.getService('auto')
      return await service.generateRecommendation(context)
    } catch (error) {
      console.warn('OpenRouter API 不可用，降级到 Ollama', error)

      // 降级到 Ollama
      const ollamaService = SmartRoutingService.getService('ollama')
      // TODO: 实现降级逻辑
      throw error
    }
  }
}

/**
 * 提示词工程（Prompt Engineering）- 提升推荐质量
 */
export class PromptEngineering {
  /**
   * 商品推荐系统 Prompt 模板
   */
  static RECOMMENDATION_TEMPLATE = `你是一个专业的电商商品推荐专家。请根据用户信息生成个性化推荐：

【用户画像】{user_profile}
【可用商品池】{available_products}
【推荐理由维度】{reasoning_dimensions}

请生成 3-5 个个性化商品推荐，每个推荐包含：
1. 商品名称
2. 推荐理由（结合用户偏好）
3. 预估价格区间
4. 是否匹配度说明

总字数控制在 200-300 字。`

  /**
   * 多任务 Prompt（内容 + 协同过滤混合推荐）
   */
  static MIXED_RECOMMENDATION_PROMPT = `请结合以下两个维度生成推荐：

【内容基础推荐】
分析用户兴趣标签、浏览历史中的商品特征，推荐相似属性商品。

【协同过滤推荐】
基于"看过该商品的用户也买了..."的模式，推荐互补性商品。

【AI 个性化文案】
用自然语言组织推荐理由，加入情感化表达。`

}
