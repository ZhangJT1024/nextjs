'use client'

import { useState, useEffect } from 'react'
import createOllamaClient from '@/lib/ollama-client'
import { Product, RecommendResponse } from '@/types/product'

interface LocalProduct extends Product {
  image_url?: string
}

export default function ProductRecommendationsPage({ id }: { params: Promise<{ id: string }> }) {
  const params = await Promise.resolve(id) // Next.js 13+
  const [currentProduct, setCurrentProduct] = useState<LocalProduct | null>(null)
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [ollamaAvailable, setOllamaAvailable] = useState(false)
  const ollama = createOllamaClient()

  // 获取当前商品详情
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params}`)
        if (response.ok) {
          const data = await response.json()
          setCurrentProduct(data.data || null)
        }
      } catch (error) {
        console.error('获取商品详情失败:', error)
      }
    }

    fetchProduct()
  }, [params])

  // 生成推荐
  const generateRecommendations = async () => {
    setLoading(true)
    try {
      // 先检查 Ollama 是否可用
      await ollama.checkModelExists('llama3.2')
      setOllamaAvailable(true)

      const userProfile = `用户正在浏览商品 ID:${params},类别：${currentProduct?.category || '未知'}`
      const systemPrompt = `请生成个性化的商品推荐，结合以下信息：\n- 当前商品：${currentProduct?.name || params}\n- 价格区间：¥${currentProduct?.price || 'N/A'}\n- 推荐理由：相似性、互补性、性价比等维度`

      const response = await ollama.generate(systemPrompt, {
        temperature: 0.7,
        num_predict: 512
      })

      // 解析推荐结果并调用推荐 API
      const recommendResponse: RecommendResponse = await fetch('/api/products/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_current',
          history: [],
          context: { categoryPreference: currentProduct?.category || '' }
        })
      }).then(res => res.json())

      if (recommendResponse.success) {
        setRecommendations(recommendResponse.data || [])
      }
    } catch (error) {
      console.error('生成推荐失败:', error)
      alert('Ollama 服务不可用，请先运行：ollama run llama3.2')
    } finally {
      setLoading(false)
    }
  }

  if (!currentProduct) {
    return <div className="p-8 text-center">加载中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* 面包屑 */}
        <nav className="mb-6 text-sm text-gray-600">
          <a href="/" className="hover:text-blue-600">首页</a>
          <span className="mx-2">/</span>
          <span className="font-medium">{currentProduct.name}</span>
        </nav>

        {/* 商品详情 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">{currentProduct.name}</h1>
            <p className="text-gray-600 mb-4">¥{currentProduct.price.toFixed(2)}</p>
            <div className="prose max-w-none text-gray-700">
              {currentProduct.description || '暂无描述'}
            </div>
          </div>

          {/* 分类标签 */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">商品分类</h3>
            <span className="inline-block bg-white px-4 py-2 rounded-full text-sm shadow-sm">
              {currentProduct.category || '未分类'}
            </span>
          </div>
        </div>

        {/* AI 推荐 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>🤖</span> AI 智能推荐
            </h2>
            <button
              onClick={generateRecommendations}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition"
            >
              {loading ? '生成中...' : '生成推荐'}
            </button>
          </div>

          {ollamaAvailable && (
            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
              ✅ Ollama 服务已连接，可以生成个性化推荐
            </div>
          )}

          {!ollamaAvailable && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
              ⚠️ Ollama 服务不可用。请先运行：<code className="ml-1">ollama run llama3.2</code>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.slice(0, 4).map((rec, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition border border-gray-200">
                  <h4 className="font-medium text-blue-700">{rec.name || `推荐商品${idx + 1}`}</h4>
                  <p className="text-sm text-gray-600 mt-2">{rec.description?.slice(0, 100) || ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">如何使用：</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
            <li>确保已安装并运行 Ollama：{`ollama run llama3.2`}</li>
            <li>在.env.local 中设置 OLLAMA_API_URL</li>
            <li>点击"生成推荐"按钮获取 AI 生成的个性化建议</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
