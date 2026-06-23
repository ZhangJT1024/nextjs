import { SUCCESS } from '@/constants'
import { PermissionRepository } from '@/repositories/permission.repositiories'
import bcrypt from 'bcrypt'

const permissionRepository = new PermissionRepository()

export class PermissionService {
  async checkToken (token: string) {
    const hashToken = bcrypt.hash(token, 12)
    const tokenInfo = await permissionRepository.checkToken(token)
    if (
      tokenInfo.status === SUCCESS &&
      bcrypt.compare(hashToken, tokenInfo.tokenInfo?.token)
    ) {
      if (new Date() < new Date(tokenInfo.tokenInfo.expiration_date)) {
        // 如果token临近十五分钟过去 就生成一个新的token返回，否则返回原来token
      } else {
        return {
          status: 'error',
          message: 'token过期，请重新登录'
        }
      }
    } else {
      return {
        status: 'error',
        message: 'token检验失败'
      }
    }
  }
}
