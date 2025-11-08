import { IsString, IsOptional, IsArray, IsNumber, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUpimgDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageIds?: string[];

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  order?: number;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  metadata?: Record<string, any>;
} 