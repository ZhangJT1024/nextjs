/**
 * 业务逻辑层 (Business Logic Layer - Service)
 * 职责：负责核心业务逻辑、复杂的条件判断、数据转换以及与 Repository 层的交互。
 * 它是整个应用的“大脑”，确保数据操作符合业务规则。
 */

import {ProductRepository} from './product.service';
import {LoginRepository} from './login.service';

export {
    ProductRepository,
    LoginRepository
}