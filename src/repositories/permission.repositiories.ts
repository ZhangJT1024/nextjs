import { pool } from '../lib/db'
import { debugger_logger } from '../lib/logger'

/**
 * 数据访问层 (Data Access Layer - Repository)
 * 权限模块
 * */

export class PermissionRepository {
  /**
   * 校验token
   * */
  async checkToken (
    token
  ): Promise<{ status: string; tokenInfo: null | object }> {
    const SelectTokenSql = `SELECT user_id as id,token,expiration_date FROM sys_token WHERE token = ?`
    const tokenResult = await pool.execute(SelectTokenSql, [token])
    if (tokenResult.length > 0) {
      return {
        status: 'success',
        tokenInfo: tokenResult[0] as object
      }
    } else {
      return {
        status: 'error',
        tokenInfo: null
      }
    }
  }
  /**
   * 存储token
   * */
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
