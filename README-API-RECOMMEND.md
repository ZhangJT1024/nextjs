# Next.js + 大模型 API AI 推荐系统 - 完整技术文档

## 📊 **两套方案对比**

### **方案一：Ollama（本地部署，已保留）**
```bash
ollama run llama3.2
# ✅ 隐私性好、无需成本、硬件要求高
```

### **方案二：OpenRouter API（推荐！）✅**
```
无需 Ollama，直接调用云端大模型 API
- 开箱即用
- 每日免费额度充足
- 支持主流大模型（Claude/Gemini/Llama/Mistral 等）
```

---

## 🚀 **快速开始（OpenRouter API 方案）**

### 1️⃣ **获取 OpenRouter API Key**

访问：https://openrouter.ai/api-keys

注册账号 → 创建 API Key（免费版即可，每日约$5 免费额度）

### 2️⃣ **配置环境变量**

编辑 `.env.local`：

```bash
OPENROUTER_API_KEY=sk-your_api_key_here
```

### 3️⃣ **启动项目**

```bash
npm run dev
```

访问推荐页面：http://localhost:3000/api-recommendations-openrouter

---

## 🎯 **核心 API 接口（API 方案）**

### `POST /api/products/recommend-openrouter`

生成个性化商品推荐文案（使用 OpenRouter API）

**请求体：**
```json
{
  "userId": "user_demo_001",
  "history": [],
  "context": {
    "categoryPreference": "electronics",
    "budgetRange": "500-1000"
  }
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "userId": "user_demo_001",
    "description": "根据您的偏好，我们为您推荐以下几款商品..."
  }
}
```

---

## 🔧 **完整的工具链技术方案**

### **核心 SDK（已封装）**

#### **1. OpenRouter API 客户端（推荐默认）**
```typescript
import { createOpenRouterClient } from '@/lib/ai-sdk'

const client = createOpenRouterClient()

// 生成推荐
const response = await client.generate(
  '请为以下商品生成推荐文案：iPhone 15 Pro',
  { temperature: 0.7 }
)
```

#### **2. 智能推荐服务（统一接口）**
```typescript
import { AIPromotionService } from '@/lib/ai-recommend-service'

const service = new AIPromotionService(apiKey)

// 个性化推荐
const recommendation = await service.generateRecommendation({
  userId: 'user_123',
  history: [],
  categoryPreference: 'electronics',
  budgetRange: '500-1000'
})
```

#### **3. 智能路由（自动降级）**
```typescript
import { SmartRoutingService } from '@/lib/ai-recommend-service'

// 自动选择 API（优先 OpenRouter，失败降级 Ollama）
const recommendation = await SmartRoutingService.autoGenerateRecommendation({
  userId: 'user_123',
  history: [],
  context: {}
})
```

---

## 📦 **支持的模型**

### **OpenRouter API 可用模型：**

| 模型 | 类型 | 特点 | 推荐场景 |
|------|------|------|---------|
| `mistralai/mistral-7b-instruct` | 免费 | 轻量快速 | ✅ 开发测试首选 |
| `anthropic/claude-3-haiku` | 付费 | 高智商 | 复杂任务 |
| `google/gemma-2:9b` | 免费 | 开源模型 | 高性价比 |
| `meta-llama/llama-3-8b-instruct` | 免费 | 通用 | ✅ 推荐文案生成 |

**推荐默认使用：** `mistralai/mistral-7b-instruct:free`（免费 + 够用）

---

## 🎨 **提示词工程（Prompt Engineering）**

### **系统 Prompt 模板：**

```typescript
const SYSTEM_PROMPT = `你是一个专业的电商商品推荐专家。请根据用户的历史行为、偏好和场景，
生成个性化、有吸引力的商品推荐文案。

【要求】
1. 分析用户的潜在需求（类别、预算、兴趣）
2. 推荐理由要充分且具体
3. 推荐的语气要友好、专业、有温度
4. 字数控制在 200-300 字`
```

### **进阶技巧：**

1. **多轮对话** - 使用 `multiTurnConversation()` 方法
2. **混合推荐** - 内容基础 + 协同过滤结合
3. **少样本学习** - 在 Prompt 中提供 Few-Shot 示例

---

## 🔗 **技术架构（OpenRouter API）**

```
┌─────────────────────────────────────────────────────┐
│                 Next.js App                          │
│                                                       │
│  ┌─────────────────┐    ┌───────────────────┐       │
│  │   API Layer     │───▶│ OpenRouter API    │◀───│  │
│  │ /recommend-openrouter          │              │  │
│  │                 │    │ Mistral/LLama3    │       │
│  └─────────────────┘    └───────────────────┘       │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │         AI-SDK + Service 层封装               │   │
│  │  - OpenRouterClient (API 调用)                 │   │
│  │  - AIPromotionService (统一接口)               │   │
│  │  - SmartRoutingService (智能路由/降级)         │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  ┌─────────────────┐    ┌───────────────────┐       │
│  │ Frontend Pages  │◀───│ API Key 检查      │       │
│  │ - api-recommend-│    │ - 自动降级        │       │
│  │   recommendations│    └───────────────────┘       │
│  └─────────────────┘                                   │
└─────────────────────────────────────────────────────┘

环境变量配置：
OPENROUTER_API_KEY=sk_...（从 openrouter.ai 获取）
```

---

## 💰 **成本分析**

| 模型 | 输入（$ / 1M tokens） | 输出（$ / 1M tokens） | 推荐文案约 300 tokens |
|------|------------------|---------------------|---------------------|
| Mistral 7B (免费) | $0.002 | $0.0005 | < $0.01 |
| Claude 3 Haiku | $0.25 | $0.80 | ~$0.01 |
| Llama 3 8B | $0.07 | $0.01 | ~$0.001 |

**说明：**
- 开发测试：基本免费（每日$5 配额）
- 生产环境：按量付费，推荐文案每次 <$0.02
- **相比 Ollama 硬件成本优势明显！**

---

## 📚 **进阶功能**

### **1. 混合推荐系统（推荐！）**

结合内容基础 + 协同过滤 + AI 生成文案：

```typescript
// 伪代码示例
async function hybridRecommendation(userId: string) {
  // 1️⃣ 内容基础：基于商品属性推荐
  const contentBased = await getContentBasedProducts(userId)
  
  // 2️⃣ 协同过滤：找相似用户喜欢的商品
  const collaborative = await getCollaborativeFiltering(userId)
  
  // 3️⃣ AI 生成个性化文案（OpenRouter API）
  const aiPrompts = await service.generateHybridPrompt(contentBased, collaborative)
  const aiRecommendation = await service.chat([aiPrompts])
  
  return { contentBased, collaborative, aiRecommendation }
}
```

### **2. Agent 模式（复杂任务）**

使用 LangChain 构建智能推荐 Agent：

```typescript
import { createOpenRouterClient } from '@/lib/ai-sdk'

const client = createOpenRouterClient()

// 定义工具
const tools = [
  searchProducts(),      // 搜索商品
  checkInventory(),      // 检查库存
  calculatePrice()       // 计算价格
]

// Agent 自动调用工具完成任务
const agent = client.withStructuredToolArray(tools)
const result = await agent.invoke([
  { role: 'user', content: '为我推荐性价比高的电子产品' }
])
```

### **3. 向量相似度搜索（进阶）**

集成 Pinecone/Milvus + OpenRouter API：

1. 将商品特征向量化
2. 使用 RAG（Retrieval Augmented Generation）技术
3. OpenRouter API 生成更精准推荐理由

---

## 🔄 **迁移指南（从 Ollama 到 OpenRouter）**

### **步骤 1：保留 Ollama 配置**

```bash
# .env.local - 两套方案都保留
OLLAMA_API_URL=http://localhost:11434
OPENROUTER_API_KEY=your_key_here
```

### **步骤 2：使用智能路由（自动选择）**

```typescript
import { SmartRoutingService } from '@/lib/ai-recommend-service'

// 自动选择最优 API
const result = await SmartRoutingService.autoGenerateRecommendation(context)
```

### **步骤 3：生产环境建议**

- 高并发场景：优先 OpenRouter（更快）
- 隐私要求高：降级到 Ollama
- 实现自动切换，降低运维成本

---

## 📖 **完整示例代码**

### **使用封装好的 SDK：**

```typescript
// src/lib/recommend-example.ts
import { AIPromotionService } from '@/lib/ai-recommend-service'

const service = new AIPromotionService(process.env.OPENROUTER_API_KEY)

// 简单推荐
const prompt = '请为以下用户生成商品推荐...'
const recommendation = await service.generateRecommendation({
  userId: 'user_123',
  history: [],
  context: {
    categoryPreference: 'electronics',
    budgetRange: '500-1000'
  }
})

console.log(recommendation)
```

---

## 🚀 **下一步**

1. ✅ **已完成**：基础 API + SDK + 智能路由
2. ⬜ **进阶**：混合推荐系统（内容 + 协同过滤）
3. ⬜ **高级**：向量相似度搜索 + RAG
4. ⬜ **生产级**：自动降级策略、监控告警

---

## 📞 **技术支持**

有任何问题可以随时联系！

资源链接：
- [OpenRouter 官网](https://openrouter.ai)
- [OpenRouter API 文档](https://docs.openrouter.ai/)
- [提示词工程最佳实践](https://github.com/lm-sys/FastChat)
