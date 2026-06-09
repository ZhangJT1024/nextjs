import { ProductRepository } from '../repositories/product.repository';
import logger from '../lib/logger';

/**
 * 业务逻辑层 (Business Logic Layer - Service)
 * 职责：负责核心业务逻辑、复杂的条件判断、数据转换以及与 Repository 层的交互。
 * 它是整个应用的“大脑”，确保数据操作符合业务规则。
 */
const productRepo = new ProductRepository();

export class ProductService {
  /**
   * 创建产品的业务逻辑
   * 包括：价格校验、日志记录等
   */
  async createProduct(data: { name: string; price: number; stock: number }) {
    // 1. 业务规则校验：价格不能为负数
    if (data.price < 0) {
      throw new Error('Product price cannot be negative.');
    }

    // 2. 记录业务日志
    logger.info('Business: Attempting to create a new product', { name: data.name });

    // 3. 调用数据访问层执行操作
    const id = await productRepo.create(data);

    logger.info(`Business: Product successfully created with ID: ${id}`);
    return { id, ...data };
  }

  /**
   * 获取产品列表
   */
  async getProducts() {
    logger.info('Business: Fetching all products');
    return await productRepo.findAll();
  }

  /**
   * 删除产品的业务逻辑
   * 包括：核心产品保护逻辑等
   */
  async removeProduct(id: number) {
    // 1. 业务逻辑校验：防止删除系统核心产品（假设名称包含 "Core"）
    const allProducts = await productRepo.findAll();
    const coreProduct = allProducts.find((p: any) => p.name.toLowerCase().includes('core'));

    if (coreProduct && coreProduct.id === id) {
      logger.warn(`Business: Blocked attempt to delete core product ID: ${id}`);
      throw new Error('Operation denied: Core system products cannot be deleted.');
    }

    // 2. 执行删除操作
    const success = await productRepo.delete(id);
    if (success) {
      logger.info(`Business: Product ${id} deleted successfully`);
    } else {
      logger.warn(`Business: Product ${id} delete failed (maybe not found)`);
    }

    return success;
  }
}
