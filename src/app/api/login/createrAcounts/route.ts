import { checkCreateAccountsParams } from '@/app/api/login/composables'
import { SUCCESS } from '@/constants'
import logger, { debugger_logger } from '@/lib/logger'
import { LoginService } from '@/services/login.service'
import { generateToken, TokenPayload } from '@/utils/token.utils'
import { NextRequest, NextResponse } from 'next/server'
/**
 * 接口层 (Interface Layer - Route Handler)
 * 职责：处理 POST 创建账号、GET 测试请求
 */

const loginService = new LoginService()

export async function POST (req: NextRequest) {
  try {
    // 从请求体中获取参数
    const body = await req.json()
    debugger_logger.info('Route: Received request to create account', {
      body,
      req
    })

    // 验证参数
    const checkMessage = checkCreateAccountsParams(body)
    if (!checkMessage.isValid) {
      return NextResponse.json(checkMessage.message, { status: 400 })
    }

    // ✅ 创建账号（包含 bcrypt 哈希密码）
    const accountResult = await loginService.createAccount(
      body.account,
      body.password,
      body.nickname
    )

    // ✅ 生成 JWT Token（使用账号和昵称作为 payload）
    if (accountResult.status === SUCCESS) {
      const tokenPayload: TokenPayload = {
        accountId: body.account, // ⭐ 用户 ID
        nickname: body.nickname, // ⭐ 用户昵称
        account: body.account // ✅ 可选：原始账号名
      }
      const token = generateToken(tokenPayload)

      debugger_logger.info('Route: JWT Token generated successfully', {
        accountId: body.account,
        nickname: body.nickname
      })

      return NextResponse.json(
        {
          message: '创建成功',
          status: 200,
          token // ✅ 返回 token 给前端
        },
        { status: 200 }
      )
    } else {
      debugger_logger.error(
        'Route: Account creation failed',
        accountResult.message
      )
      return NextResponse.json(
        { message: accountResult.message },
        { status: 400 }
      )
    }
  } catch (error) {
    debugger_logger.error('POST Error:', error)
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
