import { checkCreateAccountsParams } from '@/app/api/login/composables'
import { SUCCESS } from '@/constants'
import logger from '@/lib/logger'
import { LoginService } from '@/services/login.service'
import { NextRequest, NextResponse } from 'next/server'
/**
 * 接口层 (Interface Layer - Route Handler)
 * 职责：处理 POST 创建账号、GET 测试请求
 */

const loginService = new LoginService()

export async function POST (req: NextRequest) {
  /**
   * 从请求体中获取参数
   */
  try {
    const body = await req.json()
    logger.info('Route: Received request to create account', { body, req })

    // 验证参数
    const checkMessage = checkCreateAccountsParams(body)
    if (!checkMessage.isValid) {
      return NextResponse.json(
        { message: checkMessage.message },
        { status: 400 }
      )
    }

    const result = await loginService.createAccount(
      body.account,
      body.password,
      body.nickname
    )

    return NextResponse.json(
      { message: result.message },
      { status: result.status === SUCCESS ? 200 : 400 }
    )
  } catch (error) {
    logger.error('POST Error:', error)
    return NextResponse.json(
      { message: '请求体格式错误，请提供 JSON 数据' },
      { status: 400 }
    )
  }
}

export async function GET (req: NextRequest) {
  /**
   * 创建账号
   * */
  return NextResponse.json({ message: 'test 测试' }, { status: 200 })
}
