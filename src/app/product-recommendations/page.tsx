'use client'

import { useState } from 'react'
import { Product, ApiResponse } from '@/types/product'

interface RecommendationResponse extends ApiResponse {
  data: {
    userId: string | number
    context: Record<string, any>
    timestamp: string
    description: string
  }
}

export default function ProductRecommendationsPage() {
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<string>('')
  const [context, setContext] = useState({
    categoryPreference: '',
    budgetRange: '',
    interests: ''
  })

  const generateRecommendations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/products/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_123', // 替换为用户 ID
          history: [], // 用户历史数据
          context
        })
      })

      const data: RecommendationResponse = await response.json()

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI 商品智能推荐
          </h1>
          <p className="text-gray-600">
            基于本地大模型生成的个性化推荐文案
          </p>
        </div>

        {/* 表单区域 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">设置推荐参数</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户类别偏好
              </label>
              <select
                value={context.categoryPreference}
                onChange={(e) => setContext({ ...context, categoryPreference: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户兴趣标签
              </label>
              <textarea
                rows={3}
                placeholder="例如：数码、科技、创新..."
                value={context.interests}
                onChange={(e) => setContext({ ...context, interests: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={generateRecommendations}
            disabled={loading}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? '正在生成...' : '生成推荐文案'}
          </button>
        </div>

        {/* 结果展示 */}
        {recommendation && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6 border border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <span>🤖 AI 推荐结果</span>
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{recommendation}</p>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">使用说明：</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>确保 Ollama 服务正在运行：<code className="bg-yellow-100 px-1 rounded">ollama run llama3.2</code></li>
            <li>.env.local 中配置了正确的 Ollama API 地址</li>
            <li>推荐的 Prompt 会分析用户偏好和历史行为</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
