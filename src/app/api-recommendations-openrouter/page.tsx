'use client'

import { useState, useEffect } from 'react'

export default function OpenRouterRecommendationsPage() {
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<string>('')
  const [context, setContext] = useState({
    categoryPreference: '',
    budgetRange: '',
    interests: ''
  })

  // 检查 API Key 配置
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false)

  useEffect(() => {
    checkApiKey()
  }, [])

  const checkApiKey = async () => {
    try {
      const key = process.env.OPENROUTER_API_KEY
      setApiKeyConfigured(!!key)
    } catch {
      setApiKeyConfigured(false)
    }
  }

  const generateRecommendations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/products/recommend-openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_demo_001',
          history: [],
          context
        })
      })

      const data = await response.json()

      if (data.success) {
        setRecommendation(data.data.description || '')
      } else {
        alert('生成失败：' + data.message)
      }
    } catch (error) {
      console.error(error)
      alert('请求出错了')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 shadow-md">
          <h1 className="text-3xl font-bold mb-2">OpenRouter API 推荐系统</h1>
          <p className="text-blue-100">
            ✅ 使用第三方大模型 API，无需 Ollama，支持全球主流大模型
          </p>

          {!apiKeyConfigured && (
            <div className="mt-4 bg-yellow-900/60 border border-yellow-400 rounded p-3 text-sm">
              ⚠️ <strong>提示：</strong> 请先设置 API Key<br />
              1. 访问 <a href="https://openrouter.ai/api-keys" target="_blank" className="underline">OpenRouter</a><br />
              2. 获取 API Key 后设置到 .env.local：<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<code className="bg-yellow-900 px-2 rounded">OPENROUTER_API_KEY=your_key_here</code>
            </div>
          )}
        </div>

        {/* 表单区域 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <span>🎯</span> 设置推荐参数
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户类别偏好
              </label>
              <select
                value={context.categoryPreference}
                onChange={(e) => setContext({ ...context, categoryPreference: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={!apiKeyConfigured}
              >
                <option value="">请选择偏好</option>
                <option value="electronics">电子产品</option>
                <option value="fashion">时尚服饰</option>
                <option value="home">家居用品</option>
                <option value="sports">运动健身</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                预算范围
              </label>
              <input
                type="text"
                placeholder="例如：500-1000 元"
                value={context.budgetRange}
                onChange={(e) => setContext({ ...context, budgetRange: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={!apiKeyConfigured}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户兴趣标签（可选）
              </label>
              <textarea
                rows={3}
                placeholder="例如：数码、创新、便携、性价比..."
                value={context.interests}
                onChange={(e) => setContext({ ...context, interests: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={!apiKeyConfigured}
              />
            </div>
          </div>

          <button
            onClick={generateRecommendations}
            disabled={loading || !apiKeyConfigured}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
          >
            {loading ? '正在生成...' : '生成 AI 推荐文案'}
          </button>
        </div>

        {/* 结果展示 */}
        {recommendation && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border border-purple-200 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <span>🤖 AI 推荐结果</span>
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{recommendation}</p>
            </div>
          </div>
        )}

        {/* API 技术说明 */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <span>🔧</span> API 技术架构说明
          </h3>
          <div className="space-y-2 text-sm text-green-700">
            <p><strong>API 提供商：</strong>OpenRouter（聚合多家大模型 API）</p>
            <p><strong>默认模型：</strong>Mistral 7B Instruct（免费额度充足）</p>
            <p><strong>优势：</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>无需安装 Ollama，开箱即用</li>
                <li>支持全球主流大模型（Claude/Gemini/Llama 等）</li>
                <li>每日免费额度充足（适合开发测试）</li>
                <li>统一的 API 接口，兼容 OpenAI SDK</li>
              </ul>
            </p>
            <p><strong>适用场景：</strong>
              <span className="inline-block mt-1 px-2 py-1 bg-green-100 rounded text-xs">
                ✅ 快速开发、API 测试、生产环境高并发
              </span>
            </p>
          </div>

          {/* 对比说明 */}
          <div className="mt-6 pt-4 border-t border-green-200">
            <h4 className="font-medium text-green-800 mb-2">与 Ollama 方案对比：</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-200">
                  <th className="text-left py-1">维度</th>
                  <th className="text-left py-1">OpenRouter API</th>
                  <th className="text-left py-1">Ollama（本地）</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-green-100">
                  <td className="py-1 font-medium">部署方式</td>
                  <td className="py-1">无需安装，调用云端 API</td>
                  <td className="py-1">需要本地运行 Ollama 服务</td>
                </tr>
                <tr className="border-b border-green-100">
                  <td className="py-1 font-medium">响应速度</td>
                  <td className="py-1">快（云端 GPU 集群）</td>
                  <td className="py-1">中等（取决于本地硬件）</td>
                </tr>
                <tr className="border-b border-green-100">
                  <td className="py-1 font-medium">模型选择</td>
                  <td className="py-1">支持所有主流大模型</td>
                  <td className="py-1">需自行拉取模型</td>
                </tr>
                <tr className="border-b border-green-100">
                  <td className="py-1 font-medium">隐私性</td>
                  <td className="py-1">⚠️ 数据发送到云端</td>
                  <td className="py-1">✅ 本地处理，更隐私</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">成本</td>
                  <td className="py-1">按 Token 计费（有免费额度）</td>
                  <td className="py-1">硬件折旧 + 电费</td>
                </tr>
              </tbody>
            </table>

            <p className="mt-3 text-xs text-green-600">
              💡 建议：生产环境推荐同时接入两种方式，根据场景自动切换
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
