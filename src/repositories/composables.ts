import { pool } from '../lib/db'
/**
 * 查询账号
 * @param account 账号
 * @param throwIfNotFound 未找到时是否抛出异常
 * @returns 账号信息
 */
export const searchAccount = async (
  account: string,
  throwIfNotFound: boolean = true
) => {
  const searchAccountSql = `SELECT * FROM sys_user WHERE account = ?`
  const [result] = await pool.execute(searchAccountSql, [account])
  if (result) {
    return result
  }
  if (throwIfNotFound) {
    throw new Error(`查询${account}账号失败`)
  }
  return []
}
