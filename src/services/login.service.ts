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
    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.MYSQL_HOST)
    )
    return loginRepository
      .creatAccount(account, hashedPassword, nickname)
      .then(() => {
        debugger_logger.info('Service: Account created successfully', {
          account,
          nickname
        })
        return {
          status: 'success',
          message: 'Account created successfully',
          data: { account, nickname }
        }
      })
      .catch(error => {
        debugger_logger.error('Service: Failed to create account', { error })
        return {
          status: 'error',
          message: 'Failed to create account',
          error
        }
      })
  }
}
