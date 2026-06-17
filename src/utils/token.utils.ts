import jwt from 'jsonwebtoken'

/**
 * JWT Token Payload 接口 - 定义 token 中包含的信息
 */
export interface TokenPayload {
  userId: string // 用户账号/ID
  nickname: string // 用户昵称
  account?: string // 原始账号名（可选）
}

// ⭐ JWT 密钥配置 - 从环境变量读取，安全起见使用强密码
export const JWT_SECRET =
  process.env.JWT_SECRET ||
  'your-super-secret-key-for-jwt-authentication-in-nextjs-app'

// ⭐ Token 有效期 - 默认 24 小时
export const JWT_EXPIRES_MINUTES = process.env.JWT_EXPIRES_IN || '24h'

/**
 * 生成 JWT Token
 * @param payload token 负载信息
 * @returns JWT 字符串
 */
export function generateToken (payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_MINUTES })
}

/**
 * 验证并解析 Token
 * @param token JWT Token 字符串
 * @returns 解析后的 payload 或 null（如果无效）
 */
export function verifyToken (token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    console.error('JWT verify error:', error)
    return null
  }
}

/**
 * 从请求头提取 Bearer Token
 * @param authHeader Authorization header 值
 * @returns 解析后的 Token 或 null
 */
export function extractBearerToken (authHeader?: string): string | null {
  if (!authHeader) return null

  // 格式："Bearer <token>" 或 "bearer <token>"
  const parts = authHeader.toLowerCase().trim().split(' ')

  if (parts.length >= 2 && parts[0] === 'bearer') {
    return parts.slice(1).join(' ').trim()
  }

  return null
}

/**
 * 从请求中获取并验证 Token
 * @param req Next.js Request 对象
 * @returns 解析后的 payload 或 null
 */
export async function getAuthFromRequest (
  req: Request
): Promise<TokenPayload | null> {
  const authHeader = req.headers.get('authorization') || ''
  const token = extractBearerToken(authHeader)

  if (!token) return null

  return verifyToken(token)
}
