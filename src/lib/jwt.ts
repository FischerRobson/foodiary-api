import { JwtPayload, sign, verify } from 'jsonwebtoken'

export function signAccessTokenFor(userId: string) {
  const jwt = sign({ sub: userId }, process.env.JWT_SECRET!, {
    expiresIn: '3d',
  })

  return jwt
}

export function validateAccessToken(jwt: string) {
  try {
    const { sub } = verify(jwt, process.env.JWT_SECRET!) as JwtPayload
    return sub ?? null
  } catch (err) {
    return null
  }
}
