/**
 * 判定是否为空
 * */
export function isEmpty (value: any) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0)
  )
}

/**
 * 校验token
 * */
export function checkToken (account: string, token: string) {}
