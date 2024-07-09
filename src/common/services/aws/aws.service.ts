import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as dotenv from 'dotenv';

dotenv.config();

export const fileSchema = z.object({
  size: z.number(),
  originalname: z.string(),
  buffer: z.instanceof(Buffer),
  mineType: z.string(),
});

@Injectable()
export class AwsService {
  private readonly client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile({ file }: { file: z.infer<typeof fileSchema> }) {
    const parsedFile = fileSchema.safeParse(file);
    if (!parsedFile.success) {
      throw new Error(parsedFile.error.message);
    }

    const createdId = createId();
    const fileKey = createdId + file.originalname;
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mineType,
      CacheControl: 'max-age=31536000',
    });

    await this.client.send(putObjectCommand);

    return fileKey;
  }

  async getFile(fileKey: string) {
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
    });

    return await getSignedUrl(this.client, getObjectCommand);
  }

  async getFiles(fileKeys: string[]) {
    return await Promise.all(fileKeys.map((key) => this.getFile(key)));
  }

  async updateFile({
    fileKey,
    file,
  }: {
    fileKey: string;
    file: z.infer<typeof fileSchema>;
  }) {
    const parsedFile = fileSchema.safeParse(file);
    if (!parsedFile.success) {
      throw new Error(parsedFile.error.message);
    }

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mineType,
      CacheControl: 'max-age=31536000',
    });

    await this.client.send(putObjectCommand);
  }

  async deleteFile(fileKey: string) {
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
    });

    await this.client.send(deleteObjectCommand);
  }
}
