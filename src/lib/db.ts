import mysql from 'mysql2/promise'; // 使用 promise 版本的 mysql2 驱动，方便使用 async/await
import logger from './logger';

/**
 * 数据库连接池配置
 * 使用连接池而不是单次连接，是为了在并发请求时能够复用连接，减少建立连接的开销。
 */
export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port:Number(process.env.MYSQL_PORT ) || 3306,
  timezone: '+08:00',
  waitForConnections: true,      // 如果连接池满了，是否等待
  connectionLimit: 10,            // 最大连接数
  queueLimit: 0,                  // 等待队列限制
  enableKeepAlive: true,          // 保持连接存活
  keepAliveInitialDelay: 10000,   // 保持存活的初始延迟
    // 新增超时配置，延长TCP握手等待时间
  connectTimeout: 15000,
  acquireTimeout: 12000,
});

/**
 * 在项目启动时尝试连接数据库并记录日志
 */
pool.getConnection()
  .then(() => {
    logger.info('MySQL Database Connected Successfully');
  })
  .catch((err) => {
    logger.error('Database Connection Failed', {
      error: err.message,
      stack: err.stack
    });
  });
