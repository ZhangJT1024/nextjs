import winston from 'winston';

/**
 * 日志系统配置
 * 使用 winston 库，因为它支持多种日志传输（控制台、文件、数据库等）
 * 并支持结构化的 JSON 输出，非常适合生产环境的日志分析。
 */
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(), // 在日志中添加时间戳
    winston.format.json()       // 将日志对象转化为 JSON 格式输出
  ),
  transports: [
    // 在开发环境的终端输出日志
    new winston.transports.Console(),
    // 将错误级别的日志写入到 error.log 文件中
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    // 将所有的日志（info, warn, error）写入到 combined.log 文件中
    new winston.transports.File({
      filename: 'logs/combined.log'
    }),
  ],
});

export default logger;
