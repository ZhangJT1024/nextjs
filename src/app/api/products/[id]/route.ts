import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '../../../services/product.service';
import logger from '../../../lib/logger';

/**
 * 接口层 (Interface Layer - Route Handler)
 * 职责：处理带有 ID 参数的请求，如 DELETE 或 PUT。
 */

const productService = new ProductService();

/**
 * 处理 DELETE 请求: 删除产品
 * 示例 URL: /api/products/1
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
    }

    logger.info(`API Request: DELETE /api/products/${id}`);

    // 调用业务逻辑层 (Service)
    const success = await productService.removeProduct(id);

    if (success) {
      return NextResponse.json({ message: `Product ${id} deleted successfully` });
    } else {
      return NextResponse.json({ message: `Failed to delete product ${id}` }, { status: 404 });
    }
  } catch (error: any) {
    logger.error(`API Request Error in DELETE /api/products/${params.id}`, {
      message: error.message,
      stack: error.stack
    });

    // 这里的错误可能是 Service 层抛出的业务异常（如禁止删除核心产品）
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
