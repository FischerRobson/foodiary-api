import { db } from '../db'
import { HttpResponse, ProtectedHttpRequest } from '../types/http'
import { badRequest, ok } from '../utils/http'
import { mealsTable } from '../db/schema'
import z from 'zod'
import { and, eq, gte, lte } from 'drizzle-orm'

const schema = z.object({
  mealId: z.string(),
})

export class GetMealByIdController {
  static async handle(request: ProtectedHttpRequest): Promise<HttpResponse> {
    const { success, error, data } = schema.safeParse(request.params)

    if (!success) {
      return badRequest({ errors: error.issues })
    }

    const { userId } = request
    const { mealId } = data

    const meal = await db.query.mealsTable.findFirst({
      columns: {
        id: true,
        foods: true,
        createdAt: true,
        icon: true,
        name: true,
        status: true,
      },
      where: and(eq(mealsTable.id, mealId), eq(mealsTable.userId, userId)),
    })

    return ok({ meal })
  }
}
