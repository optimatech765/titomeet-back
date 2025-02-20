export class GetPresignedUrlDto {
  fileName: string;
  fileType: string;
}

export class GetPresignedResponseDto {
  success: boolean;
  uploadUrl: string;
  downloadUrl: string;
  uniqueName: string;
  filePath: string;
  fields: Record<string, string>;
}

export class DeleteAssetsDto {
  fileNames: string[];
}

export class DeleteAssetsResponseDto {
  success: boolean;
}
