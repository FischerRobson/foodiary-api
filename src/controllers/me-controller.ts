import { eq } from 'drizzle-orm'
import { db } from '../db'
import { HttpResponse, ProtectedHttpRequest } from '../types/http'
import { ok } from '../utils/http'
import { usersTable } from '../db/schema'

export class MeController {
  static async handle(request: ProtectedHttpRequest): Promise<HttpResponse> {
    const user = await db.query.usersTable.findFirst({
      columns: {
        id: true,
        email: true,
        name: true,
        calories: true,
        proteins: true,
        fats: true,
        carbohydrates: true,
      },
      where: eq(usersTable.id, request.userId),
    })

    return ok({ user })
  }
}
