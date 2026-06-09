import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '../../../services/product.service';
import { z } from 'zod'; // 使用 Zod 进行强Schema的数据校验
import logger from '../../../lib/logger';

/**
 * 接口层 (Interface Layer - Route Handler)
 * 职责：处理 HTTP 请求，解析参数，调用 Service，并返回标准响应。
 */

// 初始化业务服务
const productService = new ProductService();

/**
 * 定义产品请求体的 Zod 校验 Schema
 * 这样可以确保进入 Service 层的数据是合法的
 */
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  price: z.number().min(0, "Price must be a positive number"),
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
});

/**
 * 处理 POST 请求: 创建产品
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 解析请求体
    const body = await req.json();
    logger.info('API Request: POST /api/products');

    // 2. 数据校验 (Validation)
    // 如果数据不符合 Schema，Zod 会抛出错误
    const validatedData = productSchema.parse(body);

    // 3. 调用业务逻辑层 (Service)
    const newProduct = await productService.createProduct(validatedData);

    // 4. 返回成功响应
    return NextResponse.json({
      message: 'Product created successfully',
      data: newProduct
    }, { status: 201 });

  } catch (error: any) {
    // 区分校验错误和系统错误
    if (error instanceof z.ZodError) {
      logger.warn('API Validation Error', { errors: error.errors });
      return NextResponse.json({
        message: 'Validation failed',
        errors: error.errors
      }, { status: 400 });
    }

    logger.error('API Request Error in POST /api/products', {
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json({
      message: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}

/**
 * 处理 GET 请求: 获取所有产品
 */
export async function GET() {
  try {
    logger.info('API Request: GET /api/products');
    const products = await productService.getProducts();

    return NextResponse.json(products);
  } catch (error: any) {
    logger.error('API Request Error in GET /api/products', { error: error.message });
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
