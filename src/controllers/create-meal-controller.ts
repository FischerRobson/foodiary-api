import { db } from '../db'
import { HttpResponse, ProtectedHttpRequest } from '../types/http'
import { badRequest, ok } from '../utils/http'
import { mealsTable } from '../db/schema'
import z from 'zod'

const schema = z.object({
  fileType: z.enum(['audio/m4a', 'image/jpeg']),
})

export class CreateMealController {
  static async handle(request: ProtectedHttpRequest): Promise<HttpResponse> {
    const { success, error, data } = schema.safeParse(request.body)

    if (!success) {
      return badRequest({ errors: error.issues })
    }

    const { userId } = request

    const [meal] = await db
      .insert(mealsTable)
      .values({
        userId,
        icon: '',
        inputFileKey: 'input_file_key',
        inputType: data.fileType === 'audio/m4a' ? 'audio' : 'picture',
        status: 'uploading',
        name: '',
        foods: [],
      })
      .returning({ id: mealsTable.id })

    return ok({ mealId: meal.id })
  }
}
