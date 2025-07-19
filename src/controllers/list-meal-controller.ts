import { db } from '../db'
import { HttpResponse, ProtectedHttpRequest } from '../types/http'
import { badRequest, ok } from '../utils/http'
import { mealsTable } from '../db/schema'
import z from 'zod'
import { and, eq, gte, lte } from 'drizzle-orm'

const schema = z.object({
  date: z.iso.date().transform((dateStr) => new Date(dateStr)),
})

export class ListMealController {
  static async handle(request: ProtectedHttpRequest): Promise<HttpResponse> {
    const { success, error, data } = schema.safeParse(request.queryParams)

    if (!success) {
      return badRequest({ errors: error.issues })
    }

    const { userId } = request

    const { date } = data

    const endDate = new Date(date)
    endDate.setUTCHours(23, 59, 59, 59)

    const meals = await db.query.mealsTable.findMany({
      columns: {
        id: true,
        foods: true,
        createdAt: true,
        icon: true,
        name: true,
      },
      where: and(
        eq(mealsTable.userId, userId),
        gte(mealsTable.createdAt, date),
        lte(mealsTable.createdAt, endDate),
        eq(mealsTable.status, 'success'),
      ), // gte = greater than or equal
    })

    return ok({ meals })
  }
}
