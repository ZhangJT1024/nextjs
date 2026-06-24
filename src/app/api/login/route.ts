import { NextRequest, NextResponse } from 'next/server'
import { LoginService } from '@/services/login.service'
import logger from '@/lib/logger'
import { checkLoginParams } from '@/app/api/login/composables'

const loginService = new LoginService()

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    // 校验登录参数
    const checkMessage = checkLoginParams(body)
    if (!checkMessage.isValid) {
      return NextResponse.json(
        {
          status: 'error',
          data: { message: checkMessage.message.message, code: 500 }
        },
        { status: 200 }
      )
    }
    const loginResult = await loginService.login(body.account, body.password)

    if (loginResult.status === 'success') {
      return NextResponse.json(
        {
          status: 'success',

          data: { ...loginResult.data, message: loginResult.message, code: 200 }
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          status: 'error',

          data: { code: 500, message: loginResult.message || '登录失败' }
        },
        { status: 200 }
      )
    }
  } catch (error) {
    logger.error({ message: 'Login Route Error', error })
    return NextResponse.json(
      {
        status: 'error',

        data: {
          message: error instanceof Error ? error.message : '登录处理出错',
          code: 500
        }
      },
      { status: 500 }
    )
  }
}
