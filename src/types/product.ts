/**
 * API 响应基类
 */
export interface ApiResponse {
  success: boolean
  message?: string
  data?: any
}

/**
 * 商品类型
 */
export interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url?: string
  category?: string
  created_at?: string
}

/**
 * 推荐请求参数
 */
export interface RecommendRequest {
  userId: string | number
  history: Product[] // 历史浏览/购买记录
  context: {
    categoryPreference?: string // 类别偏好
    budgetRange?: string // 预算范围
    interests?: string // 兴趣标签
    [key: string]: any
  }
}

/**
 * 推荐 API 响应
 */
export interface RecommendResponse extends ApiResponse {
  data: {
    userId: string | number
    context: Record<string, any>
    timestamp: string
    description: string // AI 生成的推荐文案
  }
}

/**
 * 用户行为日志
 */
export interface UserBehaviorLog {
  id: number
  user_id: string | number
  product_id: number
  action: 'view' | 'click' | 'purchase' | 'cart_add'
  timestamp: string
  metadata?: Record<string, any>
}
