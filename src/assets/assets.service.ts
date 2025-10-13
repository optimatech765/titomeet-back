import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Res,
} from '@nestjs/common';
import { DeleteObjectsCommand, S3Client } from '@aws-sdk/client-s3';
import awsConfig from 'src/config/aws';
import { randomUUID } from 'crypto';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { GetPresignedUrlDto, DeleteAssetsDto } from 'src/dto/assets.dto';
import { MAX_UPLOAD_SIZE } from 'src/utils/constants';
import { Response } from 'express';

@Injectable()
export class AssetsService {
  private s3Client: S3Client;
  private bucketName: string;
  private bucketPublicUrl: string;
  private logger = new Logger(AssetsService.name);
  constructor() {
    const {
      AWS_REGION,
      AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY,
      AWS_BUCKET_NAME,
      AWS_BUCKET_PUBLIC_URL,
    } = awsConfig();
    this.s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: AWS_SECRET_ACCESS_KEY ?? '',
      },
      endpoint: 'https://' + AWS_BUCKET_PUBLIC_URL,
    });
    this.bucketName = AWS_BUCKET_NAME;
    this.bucketPublicUrl = AWS_BUCKET_PUBLIC_URL;
  }

  async getPresignedUrl(payload: GetPresignedUrlDto) {
    try {
      const { fileName, fileType } = payload;
      const extension = fileName.split('.').pop();
      const uniqueName = `${randomUUID()}-${Date.now()}.${extension}`;
      const finalName = `public/${uniqueName}`;
      const expiresInSeconds = 600; //? 10 minutes

      const { url, fields } = await createPresignedPost(this.s3Client, {
        Bucket: this.bucketName,
        Key: finalName,
        Conditions: [
          ['content-length-range', 0, MAX_UPLOAD_SIZE], // up to 10 MB
          ['starts-with', '$Content-Type', fileType],
        ],
        Fields: {
          acl: 'public-read',
          'Content-Type': fileType,
        },
        Expires: expiresInSeconds, //? Seconds before the presigned post expires. 3600 by default.
      });

      console.log(url, fields);

      const downloadUrl = `https://${this.bucketName}.${this.bucketPublicUrl}/${finalName}`;

      return {
        success: true,
        uploadUrl: url,
        downloadUrl,
        uniqueName,
        filePath: finalName,
        fields,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteAssets(payload: DeleteAssetsDto) {
    try {
      const { fileNames } = payload;

      const command = new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: { Objects: fileNames.map((name) => ({ Key: name })) },
      });
      await this.s3Client.send(command);

      return { success: true };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getImage(imageUrl: string, @Res() res: Response) {
    if (!imageUrl) {
      throw new HttpException({ error: 'url missing' }, HttpStatus.BAD_REQUEST);
    }

    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new HttpException(
          { error: 'failed to fetch' },
          HttpStatus.BAD_GATEWAY,
        );
      }

      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') ?? 'image/png';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error(error);
      throw new HttpException(
        { error: 'fetch failed' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
