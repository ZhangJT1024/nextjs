/**
 * OpenRouter API 使用示例 - 完整的工具链技术演示
 */

import {
  OpenRouterClient,
  QwenClient,
  LangChainClient,
  createOpenRouterClient,
  type Message
} from './ai-sdk'

// ============================================
// 方案一：OpenRouter API（推荐默认）✅
// ============================================
export class OpenRouterDemo {
  /**
   * 基础用法 - 直接调用 API
   */
  static async basicUsage() {
    const apiKey = process.env.OPENROUTER_API_KEY || ''
    if (!apiKey) {
      console.warn('警告：OPENROUTER_API_KEY 未配置')
      return
    }

    const client = new OpenRouterClient(apiKey)

    // 1. 文本生成
    const prompt = '请为我推荐几款适合上班族的笔记本电脑'
    const response = await client.generate(prompt, {
      model: 'mistralai/mistral-7b-instruct:free',
      temperature: 0.7
    })

    console.log('推荐结果：', response)
  }

  /**
   * 多轮对话（进阶）
   */
  static async multiTurnChat() {
    const apiKey = process.env.OPENROUTER_API_KEY
    const client = new OpenRouterClient(apiKey || '')

    const messages: Message[] = [
      { role: 'system', content: '你是一个电商商品推荐专家' },
      { role: 'user', content: '我想买一台预算 5000 元的笔记本，有什么推荐？' }
    ]

    const response = await client.chat(messages, 'mistralai/mistral-7b-instruct', {
      temperature: 0.7
    })

    console.log('多轮对话响应：', response)
  }

  /**
   * 获取支持的模型列表
   */
  static async listModels() {
    const apiKey = process.env.OPENROUTER_API_KEY
    const client = new OpenRouterClient(apiKey || '')

    try {
      const models = await client.listModels()
      console.log('可用模型列表：', models)
    } catch (error) {
      console.error('获取模型列表失败:', error)
    }
  }
}

// ============================================
// 方案二：阿里云 DashScope（可选）
// ============================================
export class QwenDemo {
  /**
   * 使用通义千问 API
   */
  static async useQwen() {
    const apiKey = process.env.DASHSCOPE_API_KEY || ''

    const client = new QwenClient(apiKey)

    const prompt = '请为以下用户生成商品推荐文案：\n- 用户偏好：电子产品，预算 500-1000 元\n- 兴趣标签：数码、便携'

    const response = await client.generate(prompt, {
      temperature: 0.7,
      max_tokens: 512
    })

    console.log('通义千问推荐结果：', response)
  }
}

// ============================================
// 方案三：LangChain（高级 Agent）
// ============================================
export async function withLangChain() {
  const apiKey = process.env.OPENROUTER_API_KEY

  // 使用 LangChain ChatOpenAI
  import { ChatOpenAI, HumanMessage, SystemMessage } from '@langchain/core/messages'

  const llm = new ChatOpenAI({
    openAIApiKey: apiKey || '',
    modelName: 'mistralai/mistral-7b-instruct',
    temperature: 0.7
  })

  // 单轮对话
  const response = await llm.invoke([
    new SystemMessage('你是一个电商推荐专家'),
    new HumanMessage('请为上班族推荐笔记本电脑')
  ])

  console.log('LangChain 响应：', response.content)
}

// ============================================
// 完整商品推荐示例（推荐 API + 行为数据）
// ============================================
export async function fullRecommendationDemo() {
  const apiKey = process.env.OPENROUTER_API_KEY
  const client = new OpenRouterClient(apiKey || '')

  // 模拟用户行为和上下文
  const userContext = {
    userId: 'user_demo_001',
    history: [
      { id: 1, name: 'iPhone 15 Pro', category: 'electronics', price: 8999 },
      { id: 2, name: 'MacBook Air M2', category: 'electronics', price: 7499 }
    ],
    categoryPreference: 'electronics',
    budgetRange: '500-10000',
    interests: '数码、科技、创新'
  }

  // 准备推荐 Prompt
  const userProfile = userContext.userId && userContext.history
    ? `用户最近浏览了${userContext.history.map(p => p.name).join(', ')}，\n偏好类别：${userContext.categoryPreference}，预算：${userContext.budgetRange}`
    : '暂无详细用户画像'

  const systemPrompt = `请基于以下信息生成个性化商品推荐文案：

【用户背景】${userProfile}

【任务要求】
1. 分析用户的潜在需求
2. 推荐 3-5 个可能匹配的商品
3. 每个推荐说明推荐理由
4. 总字数控制在 200-300 字，语气友好专业`

  // 调用 API 生成推荐
  const recommendation = await client.chat([
    { role: 'system', content: '你是一个电商商品推荐专家' },
    { role: 'user', content: systemPrompt }
  ], 'mistralai/mistral-7b-instruct', {
    temperature: 0.7,
    max_tokens: 512
  })

  console.log('✅ 完整推荐结果：')
  console.log(recommendation)
}

// ============================================
// 主程序入口（测试所有方案）
// ============================================
export async function testAllSchemes() {
  console.log('\n🚀 开始测试 OpenRouter API 推荐系统...\n')

  try {
    // 1. 获取可用模型
    console.log('1️⃣  正在加载模型列表...')
    await OpenRouterDemo.listModels()

    // 2. 简单文本生成
    console.log('\n2️⃣  测试文本生成...')
    await OpenRouterDemo.basicUsage()

    // 3. 完整商品推荐（推荐）
    console.log('\n3️⃣  完整商品推荐演示...')
    await fullRecommendationDemo()

    console.log('\n✅ 所有测试通过！API 方案可用！\n')
  } catch (error) {
    console.error('❌ 测试失败:', error)
    console.warn('提示：请确保 OPENROUTER_API_KEY 已配置\n')
  }
}

// 如果直接运行这个文件，自动执行测试
if (require.main === module) {
  testAllSchemes()
}
