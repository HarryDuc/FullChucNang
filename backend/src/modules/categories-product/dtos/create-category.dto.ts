import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsMongoId,
  IsBoolean,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsMongoId() // Kiểm tra xem có phải ObjectId không
  parentCategory?: Types.ObjectId; // Sử dụng ObjectId thay vì string

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) // Đảm bảo danh mục con được validate đúng
  @Type(() => CreateCategoryDto) // Biến subCategories thành mảng chứa CreateCategoryDto
  @IsMongoId()
  subCategories?: CreateCategoryDto[];

  @IsOptional()
  @IsNumber()
  level?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
