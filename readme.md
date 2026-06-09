# Next.js + MySQL 三层架构实战项目

这是一个用于学习 Next.js 全栈开发与企业级软件架构设计的纯服务端项目。项目严格遵循**三层架构**设计，旨在帮助开发者理解代码的可维护性与职责分离。

## 🚀 技术栈
- **Framework**: Next.js 14+ (App Router)
- **Database**: MySQL 8.0+
- **Driver**: `mysql2` (Promise Wrapper)
- **Validation**: `zod` (Schema-based validation)
- **Logging**: `winston` (Structured logging)
- **Language**: TypeScript

## 🏗 架构设计说明

### 1. 接口层 (Interface Layer / Route Handlers)
- **路径**: `src/app/api/*`
- **职责**: 
  - 处理 HTTP 请求 (GET, POST, PUT, DELETE)。
  - 解析 JSON 请求体。
  - 使用 `zod` 进行强类型输入校验。
  - 调用 `Service` 层处理逻辑，不直接操作数据库。
  - 统一返回标准的 JSON 响应。

### 2. 业务逻辑层 (Business Logic Layer / Services)
- **路径**: `src/services/*`
- **职责**: 
  - 核心业务逻辑处理（如：库存是否足够、权限验证、数据计算）。
  - 异常处理逻辑。
  - 调用 `Repository` 层获取数据。
  - 它是整个系统的“大脑”。

### 3. 数据访问层 (Data Access Layer / Repositories)
- **路径**: `src/repositories/*`
- **职责**: 
  - 执行原始 SQL 语句。
  - 处理数据库连接池。
  - 封装 CRUD 操作。
  - 屏蔽数据库底层细节，确保 Service 层不感知 SQL 语法。

## 🛠 开发指南

### 环境配置
创建 `.env` 文件并配置你的 MySQL 信息：
```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=next_demo_db
```

### 运行项目
1. 安装依赖: `npm install`
2. 启动开发环境: `npm run dev`
3. 接口地址: `http://localhost:3000/api/products`

## 📝 学习重点
- **职责分离**: 为什么不把 SQL 直接写在 API 路由里？（为了易于测试和维护）。
- **连接池**: 为什么使用 `mysql2/promise` 而不是简单的连接？（为了在高并发下保持性能）。
- **Zod 校验**: 为什么在进入业务逻辑前先校验？（防止脏数据污染数据库）。
- **结构化日志**: 为什么使用 `winston` 而不是 `console.log`？（为了生产环境的可追踪性）。
