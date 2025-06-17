import { IsNotEmpty, IsOptional, IsString, IsNumber, IsUrl } from 'class-validator';

/**
 * DTO để tạo VariantType (Loại biến thể)
 */
export class CreateVariantTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO để cập nhật VariantType
 */
export class UpdateVariantTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO để tạo Variant (Giá trị của biến thể)
 */
export class CreateVariantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsNotEmpty()
  @IsString()
  variantType: string;

  @IsOptional()
  @IsNumber()
  additionalPrice?: number;

  @IsOptional()
  @IsNumber()
  discountPrice?: number;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsUrl()
  thumbnail?: string;
}

/**
 * DTO để cập nhật Variant
 */
export class UpdateVariantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  variantType?: string;

  @IsOptional()
  @IsNumber()
  additionalPrice?: number;

  @IsOptional()
  @IsNumber()
  discountPrice?: number;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsUrl()
  thumbnail?: string;
}
