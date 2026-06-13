import { checkCreateAccountsParams } from '@/app/api/login/composables'
import { SUCCESS } from '@/constants'
import { LoginService } from '@/services/login.service'
import { LoginParamsType } from '@/types'
import { NextRequest, NextResponse } from 'next/server'
/**
 * 接口层 (Interface Layer - Route Handler)
 * 职责：处理带有 ID 参数的请求，如 DELETE 或 PUT。
 */

const loginService = new LoginService()

export async function POST (req: NextRequest, params: LoginParamsType) {
  /**
   * 创建账号
   * */
  const checkMessage = checkCreateAccountsParams(params)
  // 验证参数
  if (!checkMessage.isValid) {
    return NextResponse.json({ message: checkMessage.message }, { status: 400 })
  } else {
    const result = await loginService.createAccount(
      params.account,
      params.password,
      params.nickname
    )
    return NextResponse.json(
      { message: result.message },
      { status: result.status === SUCCESS ? 200 : 400 }
    )
  }
}
export async function GET (req: NextRequest, params: LoginParamsType) {
  /**
   * 创建账号
   * */
  return NextResponse.json({ message: 'test 测试' }, { status: 200 })
}
