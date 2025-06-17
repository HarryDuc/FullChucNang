import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsMongoId,
  MaxLength,
  MinLength,
  IsArray,
  ArrayUnique,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO tạo mới danh mục bài viết – đảm bảo toàn vẹn dữ liệu, kiểm tra đầy đủ và thông báo lỗi bằng tiếng Việt.
 */
export class CreateCategoryPostDto {
  @IsString({ message: 'Tên danh mục phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Tên danh mục không được để trống.' })
  @MinLength(1, { message: 'Tên danh mục phải có ít nhất 1 ký tự.' })
  @MaxLength(100, { message: 'Tên danh mục không được vượt quá 100 ký tự.' })
  readonly name: string;

  @IsOptional()
  @IsString({ message: 'Slug phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Slug không được để trống.' })
  readonly slug: string;

  @IsOptional()
  @IsNumber({}, { message: 'Cấp độ (level) phải là số.' })
  @Min(0, { message: 'Cấp độ (level) không được nhỏ hơn 0.' })
  @Type(() => Number)
  readonly level?: number;

  @IsOptional()
  @IsMongoId({ message: 'ID danh mục cha (parent) phải là ObjectId hợp lệ.' })
  readonly parent?: string;

  @IsOptional()
  @IsArray({ message: 'Danh sách con (children) phải là một mảng.' })
  @ArrayUnique({
    message: 'Danh sách con (children) không được chứa các giá trị trùng lặp.',
  })
  @IsMongoId({
    each: true,
    message: 'Mỗi phần tử trong danh sách con phải là ObjectId hợp lệ.',
  })
  readonly children?: string[];

  @IsOptional()
  @IsString({ message: 'Path phải là chuỗi ký tự.' })
  @MaxLength(1000, { message: 'Path không được vượt quá 1000 ký tự.' })
  readonly path?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Thứ tự hiển thị (sortOrder) phải là số.' })
  @Type(() => Number)
  readonly sortOrder?: number;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái xóa (isDeleted) phải là true hoặc false.' })
  @Type(() => Boolean)
  readonly isDeleted?: boolean;
}
