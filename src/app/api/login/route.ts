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
          message: checkMessage.message.message,
          data: null
        },
        { status: 400 }
      )
    }
    const loginResult = await loginService.login(body.account, body.password)

    if (loginResult.status === 'success') {
      return NextResponse.json(
        {
          status: 'success',
          message: loginResult.message,
          data: { ...loginResult.data, code: 200 }
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          status: 'error',
          message: loginResult.message || '登录失败',
          data: null
        },
        { status: 401 }
      )
    }
  } catch (error) {
    logger.error({ message: 'Login Route Error', error })
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : '登录处理出错',
        data: null
      },
      { status: 500 }
    )
  }
}
