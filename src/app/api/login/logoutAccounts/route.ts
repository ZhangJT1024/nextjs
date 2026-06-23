import { NextRequest, NextResponse } from 'next/server'
import { LoginService } from '@/services/login.service'
import logger from '@/lib/logger'
import { checkLogoutParams } from '@/app/api/login/composables'

const loginService = new LoginService()

export async function POST (req: NextRequest) {
  try {
    const text = await req.text()
    if (!text) {
      return NextResponse.json(
        { data: { message: '请求体不能为空' }, status: 400 },
        { status: 400 }
      )
    }

    // 打印接收到的原始文本，方便排查
    logger.info('Logout Route Received Body:', { rawText: text })

    let body
    try {
      body = JSON.parse(text)
    } catch (e) {
      return NextResponse.json(
        {
          data: {
            message: `无效的 JSON 格式: ${text}`,
            status: 400
          }
        },
        { status: 400 }
      )
    }

    // 从 cookies 中获取名为 'token' 的值
    // 注意：请确保这里的 'token' 与您在前端设置 Cookie 时使用的名称一致
    const token = req.cookies.get('token')?.value
    // 校验参数
    const checkMessage = checkLogoutParams({ account: body.account, token })
    //   如果参数校验失败，返回 400 错误
    if (!checkMessage.isValid) {
      return NextResponse.json(
        {
          data: {
            message: checkMessage.message,
            status: 400
          }
        },
        {
          status: 400
        }
      )
    }
    const result = await loginService.logoutService(
      body.account,
      token as string
    )
    return NextResponse.json(
      {
        data: {
          message: '登出成功',
          status: 200
        }
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Logout Route Error:', error)
    return NextResponse.json(
      {
        data: {
          message: error instanceof Error ? error.message : '请求处理出错',
          status: 500
        }
      },
      { status: 500 }
    )
  }
}
