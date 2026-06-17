import { checkCreateAccountsParams } from '@/app/api/login/composables'
import { SUCCESS } from '@/constants'
import logger, { debugger_logger } from '@/lib/logger'
import { LoginService } from '@/services/login.service'
import { generateToken, TokenPayload } from '@/utils/token.utils'
import { NextRequest, NextResponse } from 'next/server'
import { log } from 'node:console'
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
      return NextResponse.json(
        {
          data: { message: checkMessage.message },
          status: 400
        },
        { status: 400 }
      )
    }

    // ✅ 创建账号（包含 bcrypt 哈希密码）
    const accountResult = await loginService.createAccount(
      body.account,
      body.password,
      body.nickname
    )
    debugger_logger.info('创建账号的结果', {
      accountResult
    })
    // ✅ 生成 JWT Token（使用账号和昵称作为 payload）
    if (accountResult.status === SUCCESS) {
      const tokenPayload: TokenPayload = {
        userId: (accountResult?.data.userInfo[0]?.id as string) || '', // ⭐ 用户 ID
        nickname: body.nickname, // ⭐ 用户昵称
        account: body.account // ✅ 可选：原始账号名
      }
      const token = generateToken(tokenPayload)
      debugger_logger.info('Route: JWT Token generated successfully', {
        userId: (accountResult?.data.userInfo[0]?.id as string) || '',
        nickname: body.nickname,
        tokenPayload,
        accountResult
      })
      // 将token存储到数据库（使用 bcrypt 哈希 token）
      await loginService.storageToken(tokenPayload.userId, token)

      return NextResponse.json(
        {
          data: {
            message: '创建成功',
            status: 200,
            token // ✅ 返回 token 给前端
          }
        },
        {
          status: 200
        }
      )
    } else {
      debugger_logger.error(
        'Route: Account creation failed',
        accountResult.message
      )
      return NextResponse.json(
        {
          data: { message: accountResult.message },
          status: 400
        },
        { status: 400 }
      )
    }
  } catch (error) {
    debugger_logger.error('POST Error:', error)
    return NextResponse.json(
      {
        data: { message: '请求体格式错误，请提供 JSON 数据' }
      },
      { status: 400 }
    )
  }
}
