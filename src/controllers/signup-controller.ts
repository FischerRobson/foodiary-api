import { z } from 'zod'
import { HttpRequest, HttpResponse } from '../types/http'
import { badRequest, conflict, created } from '../utils/http'
import { db } from '../db'
import { usersTable } from '../db/schema'
import { eq } from 'drizzle-orm'
import { hash } from 'bcryptjs'
import { signAccessTokenFor } from '../lib/jwt'
import { calculateGoals } from '../lib/calculateGoals'

const schema = z.object({
  goal: z.enum(['lose', 'maintain', 'gain']),
  gender: z.enum(['male', 'female']),
  birthDate: z.iso.date(),
  height: z.number(),
  weight: z.number(),
  activityLevel: z.number().min(1).max(5),
  account: z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8),
  }),
})

export class SignUpController {
  static async handle(request: HttpRequest): Promise<HttpResponse> {
    const { success, error, data } = schema.safeParse(request.body)

    if (!success) {
      return badRequest({ errors: error.issues })
    }

    const userAlreadyExists = await db.query.usersTable.findFirst({
      columns: {
        email: true,
      },
      where: eq(usersTable.email, data.account.email),
    })

    if (userAlreadyExists) {
      return conflict({ error: 'This email is already in use' })
    }

    const { account, ...rest } = data

    const hashedPassword = await hash(account.password, 8)

    const goals = calculateGoals({
      activityLevel: rest.activityLevel,
      birthDate: new Date(rest.birthDate),
      goal: rest.goal,
      gender: rest.gender,
      weight: rest.weight,
      height: rest.height,
    })

    const [user] = await db
      .insert(usersTable)
      .values({
        ...rest,
        ...account,
        password: hashedPassword,
        ...goals,
      })
      .returning({
        id: usersTable.id,
      })

    const jwt = signAccessTokenFor(user.id)

    return created({ jwt })
  }
}
