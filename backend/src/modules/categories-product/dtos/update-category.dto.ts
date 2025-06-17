import {
  IsString,
  IsOptional,
  IsMongoId,
  IsBoolean,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Types } from 'mongoose';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsMongoId()
  parentCategory?: Types.ObjectId; // 🔹 ID danh mục cha mới (nếu có)

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  subCategories?: Types.ObjectId[]; // 🔹 Danh sách danh mục con (nếu cập nhật)

  @IsOptional()
  @IsNumber()
  level?: number; // 🔹 Cập nhật level nếu thay đổi cha

  @IsOptional()
  @IsBoolean()
  isActive?: boolean; // 🔹 Cập nhật trạng thái danh mục
}
