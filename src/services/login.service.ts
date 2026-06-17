import { SUCCESS } from '@/constants'
import { debugger_logger } from '../lib/logger'
import { LoginRepository } from '../repositories/login.repositiories'
// 密码哈希值
import bcrypt from 'bcrypt'
import { userInfo } from 'node:os'
const loginRepository = new LoginRepository()

export class LoginService {
  /**
   * 创建账户
   */
  async createAccount (account: string, password: string, nickname: string) {
    // bcrypt.hash(密码，盐值轮数) - 使用硬编码数字 12（平衡安全性和性能）
    const hashedPassword = await bcrypt.hash(password, 12)
    return loginRepository
      .creatorAccount(account, hashedPassword, nickname)
      .then(res => {
        debugger_logger.info('login.service.ts----账号创建成功', {
          account,
          nickname
        })

        return {
          status: res.status,
          message: res.message,
          data: { userInfo: res.data?.userInfo || null }
        }
      })
      .catch(error => {
        debugger_logger.error('login.service.ts----账号创建失败', {
          error: error.message
        })
        throw error // 重新抛出错误，让调用层处理
      })
  }
  /**
   * 存储Token
   * @param account 账号
   * @param token JWT Token
   * @return 是否成功
   * */
  async storageToken (userId: string, token: string) {
    // 这里可以实现将 token 存储到数据库或缓存中的逻辑，例如 Redis
    // 例如：INSERT INTO user_tokens (account, token, created_at) VALUES (?, ?, ?)
    // 这里我们假设存储总是成功的，实际项目中需要处理各种异常情况
    const hashedToken = await bcrypt.hash(token, 12)
    return await loginRepository.storeToken(userId, hashedToken)
  }
}
