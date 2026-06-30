# Next.js + 本地大模型 (Ollama) AI 推荐系统使用指南

## 📋 快速开始

### 1. 安装 Ollama（Windows）

```bash
# 下载并安装 Ollama: https://ollama.com/download/windows

# 启动服务
ollama serve

# 拉取模型
ollama pull llama3.2

# 验证运行
ollama list
ollama run llama3.2
```

### 2. 配置环境变量

编辑 `.env.local` 文件：

```bash
OLLAMA_API_URL=http://localhost:11434
MODEL_NAME=llama3.2
```

### 3. 启动项目

```bash
npm run dev
# 或
yarn dev
```

访问 http://localhost:3000/product-recommendations 即可使用推荐功能！

---

## 🎯 核心 API 接口

### `POST /api/products/recommend`
生成个性化商品推荐文案。

**请求体：**
```json
{
  "userId": "user_123",
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
    "userId": "user_123",
    "description": "根据您的偏好，我们为您推荐以下几款商品..."
  }
}
```

### `GET /api/user-behaviors`
获取用户历史行为（用于协同过滤）。

**请求：**
```
/api/user-behaviors?userId=user_123
```

### `POST /api/user-behaviors`
记录用户行为（浏览、点击、购买等）。

---

## 🤖 支持的模型

| 模型 | 推荐用途 |
|------|---------|
| `llama3.2` | ✅ 通用推荐文案生成 |
| `mistral` | ✅ 轻量级快速响应 |
| `qwen1.5` | ✅ 中文表现更好 |
| `command-r` | ✅ 复杂任务理解 |

### 拉取模型示例：

```bash
ollama pull llama3.2
# 或
ollama pull qwen1.5:0.5b  # 小模型，更快速
```

---

## 📊 架构说明

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js    │───▶│    Ollama     │◀───│  /api/      │
│   API 层      │     │  (本地 LLM)   │     │  products/   │
└─────────────┘     └──────────────┘     └─────────────┘
                                    ↑
                          ┌──────────┴──────────┐
                          │   MySQL 行为日志库   │
                          └─────────────────────┘
```

---

## 🔧 进阶功能

### 1. 多轮对话推荐（使用 OllamaClient）

```typescript
import createOllamaClient from '@/lib/ollama-client'

const ollama = createOllamaClient()

// 初始化对话
const messages: Message[] = [
  { role: 'system', content: '你是一个电商商品推荐专家' }
]

// 多轮交互
const response = await ollama.chat(messages, { temperature: 0.7 })
```

### 2. 协同过滤（基于用户行为）

```typescript
import db from '@/lib/db'

// 获取用户 A 喜欢的商品类别
async function getCoffeeUsers(): Promise<User[]> {
  const [rows] = await db.query(
    'SELECT user_id FROM products WHERE category = ?',
    ['coffee']
  )
  
  return rows.map(r => ({ userId: r.user_id }))
}

// 找到有相似偏好的用户并推荐其喜欢但目标用户未购买的商品
async function getSimilarUsers(targetUserId: number) {
  // 实现协同过滤逻辑...
}
```

### 3. 混合推荐系统（推荐）

结合内容基础 + 协同过滤 + AI 生成文案，实现更好的用户体验。

---

## 📦 Docker 部署（可选）

使用 Ollama 容器化方案：

```bash
# Docker Compose 启动
docker-compose up -d ollama

# 首次拉取模型
docker exec ollama ollama pull llama3.2
```

---

## ⚠️ 注意事项

1. **性能优化**：本地大模型首字生成需要 1-5 秒，建议添加 loading 状态
2. **Token 成本**：长文案生成可能消耗较多 token，控制输出长度
3. **隐私保护**：本地部署不会上传用户数据到云端，安全合规

---

## 📚 资源链接

- [Ollama 官网](https://ollama.com/)
- [Llama3.2 GitHub](https://github.com/meta-llama/llama3)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/router-handlers)

---

## 🎨 下一步

1. ✅ **当前已完成**：基础的 AI 推荐文案生成
2. ⬜ **进阶功能**：向量相似度搜索（集成 Pinecone/Milvus）
3. ⬜ **高级玩法**：深度学习推荐模型（TensorFlow.js / Python）

需要帮助可以随时联系！😊
