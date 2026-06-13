/**
 * 数据访问层 (Data Access Layer - Repository)
 * 职责：负责所有的 SQL 查询逻辑。
 * 它屏蔽了数据库的细节，让上层 Service 不需要关心具体的 SQL 语法。
 */
import { ProductRepository } from './product.repository';
import { LoginRepository } from './login.repositiories';
export {
    ProductRepository,
    LoginRepository
}