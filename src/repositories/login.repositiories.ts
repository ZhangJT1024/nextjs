import { debugger_logger } from '../lib/logger'
import { pool } from '../lib/db'
import { searchAccount } from './composables'
import { error } from 'node:console'
import { ca } from 'zod/v4/locales'
import { generateToken, TokenPayload } from '@/utils/token.utils'
import bcrypt from 'bcrypt'

/**
 * 数据访问层 (Data Access Layer - Repository)
 * 职责：负责所有的 SQL 查询逻辑。
 * 它屏蔽了数据库的细节，让上层 Service 不需要关心具体的 SQL 语法。
 */
export class LoginRepository {
  /**
   * 注册
   * @para account 账号
   * @param password 密码
   * @param nickname 昵称
   * @return 是否成功
   */
  async creatorAccount (account: string, password: string, nickname: string) {
    // 这里应该有实际的数据库操作逻辑，例如使用连接池执行 SQL 插入语句
    // 例如：INSERT INTO sys_user (account, password, nickname) VALUES (?, ?, ?)
    // 这里我们假设注册总是成功的，实际项目中需要处理各种异常情况

    try {
      const result = await searchAccount(account, false)
      if ((result as any).length > 0) {
        debugger_logger.warn('login.repositiories.ts----账号已存在', {
          account
        })
        return { status: 'error', message: '账号已存在' }
      } else {
        // 创建账号
        const insertSql = `INSERT INTO sys_user (account, password, user_name,create_time) VALUES (?, ?, ?,?)`
        const userResult = await pool.execute(insertSql, [
          account,
          password,
          nickname,
          new Date()
        ])
        if (userResult.length > 0) {
          const searchUserSql = `SELECT * FROM sys_user WHERE account = ?`
          const [userInfoResult] = await pool.execute(searchUserSql, [account])
          return {
            status: 'success',
            data: { userInfo: userInfoResult, message: '账号创建成功' }
          }
        }
        return { status: 'error', data: { message: '账号创建失败' } }
      }
    } catch (error) {
      debugger_logger.error('login.repositiories.ts----注册失败', { error })
      return {
        status: 'error',
        message: error instanceof Error ? error.message : '账号创建失败'
      }
    }
  }
  async logout (account: string, token: string) {
    try {
      const result = await searchAccount(account)
      if ((result as any).length > 0) {
        const deleteTokenSql = `DELETE FROM sys_token WHERE user_id = ? AND token = ?`

        await pool.execute(deleteTokenSql, [result[0].id, token])
        return {
          status: 'success',
          message: '登出成功'
        }
      }
    } catch (error) {}
  }
  /**
   * 登录
   * @param account 账号
   * @param password 密码（明文）
   * */
  async login (account: string, password: string) {
    const result = await searchAccount(account)
    if ((result as any).length > 0) {
      // ✅ 使用 bcrypt.compare() 进行密码比对（返回 Promise<boolean>）
      const isPasswordValid = await bcrypt.compare(password, result[0].password)
      if (isPasswordValid) {
        const tokenPayload: TokenPayload = {
          userId: (result[0]?.id as string) || '', // ⭐ 用户 ID
          nickname: result[0]?.user_name, // ⭐ 用户昵称
          account: result[0]?.account // ✅ 可选：原始账号名
        }
        const token = generateToken(tokenPayload)

        const insertTokenSql = `INSERT INTO  sys_token (token,user_id,expiration_date) VALUES(?,?,?)`
        await pool.execute(insertTokenSql, [
          token,
          result[0]?.id,
          new Date(Date.now() + 86400000)
        ])
        return {
          status: 'success',
          message: '登录成功',
          data: {
            userInfo: result[0],
            token: token
          }
        }
      } else {
        return {
          status: 'error',
          message: '密码错误'
        }
      }
    } else {
      return {
        status: 'error',
        message: '账号不存在'
      }
    }
  }
  async storeToken (userId: string, token: string) {
    // 查询账号是否存在 acc
    const searchAccountSql = `SELECT * FROM sys_user WHERE id= ?`
    const result = (await pool.execute(searchAccountSql, [userId])) as any[]
    if (result.length === 0) {
      debugger_logger.warn(
        'login.repositiories.ts----账号不存在，无法存储 Token',
        { userId }
      )
      return { status: 'error', message: '账号不存在，无法存储 Token' }
    }
    // 是否已经存在 token
    const searchTokenSql = `SELECT * FROM sys_token WHERE user_id = ?`
    const tokenResult = (await pool.execute(searchTokenSql, [userId])) as any[]
    // 存在 token 就删除
    if (tokenResult.length > 0) {
      const deleteTokenSql = `DELETE FROM sys_token WHERE user_id = ?`
      await pool.execute(deleteTokenSql, [userId])
      debugger_logger.info(
        'login.repositiories.ts----旧 Token 已删除，准备存储新 Token',
        { userId }
      )
    }
    const sql =
      'INSERT INTO sys_token (user_id, token, expiration_date) VALUES (?, ?, ?)'
    await pool.execute(sql, [userId, token, new Date(Date.now() + 86400000)])
  }
}
