import { IsString, IsArray, IsOptional } from 'class-validator';

export class UploadImagesDto {
  @IsString()
  upimgId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageIds?: string[];
}

export class RemoveImageDto {
  @IsString()
  upimgId: string;

  @IsString()
  imageId: string;
} 