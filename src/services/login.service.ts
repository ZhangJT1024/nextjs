import { SUCCESS } from '@/constants'
import { debugger_logger } from '../lib/logger'
import { LoginRepository } from '../repositories/login.repositiories'
// 密码哈希值
import bcrypt from 'bcrypt'
const loginRepository = new LoginRepository()

export class LoginService {
  /**
   * 登录模块
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
          data: { account, nickname }
        }
      })
      .catch(error => {
        debugger_logger.error('login.service.ts----账号创建失败', {
          error: error.message
        })
        throw error // 重新抛出错误，让调用层处理
      })
  }
}
