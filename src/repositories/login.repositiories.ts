import { debugger_logger } from '../lib/logger'
import { pool } from '../lib/db'
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
  async creatAccount (account: string, password: string, nickname: string) {
    // 这里应该有实际的数据库操作逻辑，例如使用连接池执行 SQL 插入语句
    // 例如：INSERT INTO sys_user (account, password, nickname) VALUES (?, ?, ?)
    // 这里我们假设注册总是成功的，实际项目中需要处理各种异常情况
    const searchAccountSql = `SELECT * FROM sys_user WHERE account = ?`
    const [result] = await pool.execute(searchAccountSql, [account])
    debugger_logger.info('寻找账号', { account, result })
    if ((result as any).length > 0) {
      debugger_logger.warn('账号已存在', { account })
      return false
    } else {
      const insertSql = `INSERT INTO sys_user (account, password, user_name,create_time) VALUES (?, ?, ?,?)`
      await pool.execute(insertSql, [account, password, nickname, new Date()])
      debugger_logger.info('账号创建成功', { account })
      return true
    }
  }
}
