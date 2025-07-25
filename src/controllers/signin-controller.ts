import { HttpRequest, HttpResponse } from '../types/http'
import { z } from 'zod'
import { badRequest, ok, unauthorized } from '../utils/http'
import { db } from '../db'
import { usersTable } from '../db/schema'
import { eq } from 'drizzle-orm'
import { compare } from 'bcryptjs'
import { signAccessTokenFor } from '../lib/jwt'

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export class SignInController {
  static async handle(request: HttpRequest): Promise<HttpResponse> {
    const { success, error, data } = schema.safeParse(request.body)

    if (!success) {
      return badRequest({ errors: error.issues })
    }

    const user = await db.query.usersTable.findFirst({
      columns: {
        id: true,
        email: true,
        password: true,
      },
      where: eq(usersTable.email, data.email),
    })

    if (!user) return unauthorized({ error: 'Invalid credentials' })

    const isPasswordValid = await compare(data.password, user.password)

    if (!isPasswordValid) return unauthorized({ error: 'Invalid credentials' })

    const jwt = signAccessTokenFor(user.id)

    return ok({ jwt })
  }
}
