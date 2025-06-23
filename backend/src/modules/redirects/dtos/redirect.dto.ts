import { IsString, IsBoolean, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';

/**
 * DTO để tạo redirect mới
 */
export class CreateRedirectDto {
  @IsString()
  @IsNotEmpty()
  oldPath: string;

  @IsString() 
  @IsNotEmpty()
  newPath: string;

  @IsOptional()
  @IsEnum(['product', 'category', 'post', 'page', 'other'])
  type?: string = 'other';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsInt()
  @Min(300)
  @Max(308)
  statusCode?: number = 301;
}

/**
 * DTO để cập nhật redirect
 */
export class UpdateRedirectDto {
  @IsOptional()
  @IsString()
  oldPath?: string;

  @IsOptional()
  @IsString()
  newPath?: string;

  @IsOptional()
  @IsEnum(['product', 'category', 'post', 'page', 'other'])
  type?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(300)
  @Max(308)
  statusCode?: number;
} 