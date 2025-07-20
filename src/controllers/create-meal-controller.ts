import { db } from '../db'
import { HttpResponse, ProtectedHttpRequest } from '../types/http'
import { badRequest, ok } from '../utils/http'
import { mealsTable } from '../db/schema'
import z from 'zod'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client } from '../clients/s3Client'

const schema = z.object({
  fileType: z.enum(['audio/m4a', 'image/jpeg']),
})

export class CreateMealController {
  static async handle(request: ProtectedHttpRequest): Promise<HttpResponse> {
    const { success, error, data } = schema.safeParse(request.body)

    if (!success) {
      return badRequest({ errors: error.issues })
    }

    const fileId = randomUUID()
    const ext = data.fileType === 'audio/m4a' ? '.m4a' : '.jpg'
    const fileKey = `${fileId}${ext}`

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
      ContentType: data.fileType,
    })

    const presignedURL = await getSignedUrl(s3Client, command)

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

    return ok({ mealId: meal.id, uploadURL: presignedURL })
  }
}
