export class GetPresignedUrlDto {
  fileName: string;
  fileType: string;
}

export class DeleteAssetsDto {
  fileNames: string[];
}
