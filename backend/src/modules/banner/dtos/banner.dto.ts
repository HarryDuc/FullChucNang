import { IsString, IsEnum, IsBoolean, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  @IsUrl()
  imagePath: string;

  @IsEnum(['main', 'sub', 'mobile'])
  type: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  order: number;

  @IsString()
  @IsOptional()
  @IsUrl()
  link?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateBannerDto {
  @IsString()
  @IsUrl()
  @IsOptional()
  imagePath?: string;

  @IsEnum(['main', 'sub', 'mobile'])
  @IsOptional()
  type?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  @IsUrl()
  link?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateBannerOrderDto {
  @IsNumber()
  order: number;
}