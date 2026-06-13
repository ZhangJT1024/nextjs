import { pool } from '../lib/db';

/**
 * 数据访问层 (Data Access Layer - Repository)
 * 职责：负责所有的 SQL 查询逻辑。
 * 它屏蔽了数据库的细节，让上层 Service 不需要关心具体的 SQL 语法。
 */
export class ProductRepository {
  /**
   * 创建产品数据
   * @param data 产品信息对象
   * @returns 数据库生成的自增 ID
   */
  async create(data: { name: string; price: number; stock: number }) {
    const sql = 'INSERT INTO sys_user (name, price, stock) VALUES (?, ?, ?)';
    // pool.execute 会自动处理参数绑定，防止 SQL 注入
    const [result] = await pool.execute(sql, [data.name, data.price, data.stock]);
    return result.insertId;
  }

  /**
   * 获取所有产品列表
   * @returns 产品数组
   */
  async findAll() {
    const sql = 'SELECT * FROM sys_user';
    // const sql = 'INSERT INTO sys_user (user_name,accout,password) VALUES (?,?,?)';
    const [rows] = await pool.execute(sql);
    return rows;
  }

  /**
   * 更新产品信息
   * @param id 产品ID
   * @param data 需要更新的字段
   * @returns 是否更新成功
   */
  async update(id: number, data: { name?: string; price?: number; stock?: number }) {
    const sql = 'UPDATE sys_user SET name = ?, price = ?, stock = ? WHERE id = ?';
    const [result] = await pool.execute(sql, [data.name, data.price, data.stock, id]);
    return result.affectedRows > 0;
  }

  /**
   * 根据 ID 删除产品
   * @param id 产品ID
   * @returns 是否删除成功
   */
  async delete(id: number) {
    const sql = 'DELETE FROM sys_user WHERE id = ?';
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows > 0;
  }
}
