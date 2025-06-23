import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
  IsDate,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PostStatus } from '../schemas/post.schema';
// import { safeTrim } from '../../../common/utils/safe-trim';

class PostMetaDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Lượt xem phải là số.' })
  views?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Lượt thích phải là số.' })
  likes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Lượt chia sẻ phải là số.' })
  shares?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Lượt lưu phải là số.' })
  bookmarks?: number;
}

class CategoryDto {
  @IsOptional()
  @IsArray({ message: 'Danh sách chuyên mục chính phải là mảng.' })
  @IsString({ each: true, message: 'Mỗi chuyên mục chính phải là chuỗi.' })
  main?: string[];

  @IsOptional()
  @IsArray({ message: 'Danh sách chuyên mục phụ phải là mảng.' })
  @IsString({ each: true, message: 'Mỗi chuyên mục phụ phải là chuỗi.' })
  sub?: string[];
}

export class CreatePostDto {
  // 📝 Nội dung chính
  // @Transform(({ value }) => safeTrim(value))
  @IsString({ message: 'Tiêu đề không được để trống và phải là chuỗi.' })
  name: string;

  @IsOptional()
  // @Transform(({ value }) => safeTrim(value))
  @IsString({ message: 'Slug phải là chuỗi.' })
  slug?: string;

  // 👤 User ID
  @IsOptional()
  @IsString({ message: 'User ID phải là chuỗi.' })
  userId?: string;

  @IsOptional()
  // @Transform(({ value }) => safeTrim(value))
  @IsString({ message: 'Mô tả ngắn phải là chuỗi.' })
  excerpt?: string;

  @IsOptional()
  // @Transform(({ value }) => safeTrim(value))
  @IsString({ message: 'Nội dung bài viết phải là chuỗi.' })
  postData?: string;

  // 🎥 Media
  @IsOptional()
  // @Transform(({ value }) => safeTrim(value))
  @IsString({ message: 'Video bìa phải là chuỗi.' })
  coverVideo?: string;

  // 🖼️ Hình ảnh
  @IsOptional()
  @IsArray({ message: 'Thumbnail phải là mảng chuỗi.' })
  @IsString({
    each: true,
    message: 'Từng phần tử trong thumbnail phải là chuỗi.',
  })
  thumbnail?: string[];

  @IsOptional()
  @IsArray({ message: 'Danh sách hình ảnh phải là mảng chuỗi.' })
  @IsString({ each: true, message: 'Từng phần tử trong images phải là chuỗi.' })
  images?: string[];

  // 🔍 SEO & Metadata
  @IsOptional()
  @ValidateNested()
  @Type(() => PostMetaDto)
  meta?: PostMetaDto;

  // 📚 Phân loại
  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryDto)
  category?: CategoryDto;

  @IsOptional()
  @IsArray({ message: 'Tags phải là mảng chuỗi.' })
  @IsString({ each: true, message: 'Từng phần tử trong tags phải là chuỗi.' })
  tags?: string[];

  // 👤 Tác giả & kiểm duyệt
  @IsOptional()
  // @Transform(({ value }) => safeTrim(value))
  @IsString({ message: 'Tác giả phải là chuỗi.' })
  author?: string;

  @IsOptional()
  // @Transform(({ value }) => safeTrim(value))
  @IsString({ message: 'Người tạo phải là chuỗi.' })
  createdBy?: string;

  @IsOptional()
  // @Transform(({ value }) => safeTrim(value))
  @IsString({ message: 'Người cập nhật phải là chuỗi.' })
  updatedBy?: string;

  @IsOptional()
  // @Transform(({ value }) => safeTrim(value))
  @IsString({ message: 'Người duyệt phải là chuỗi.' })
  approvedBy?: string;

  // ⏳ Thời gian
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Ngày xuất bản không hợp lệ.' })
  publishedDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Ngày lên lịch không hợp lệ.' })
  scheduledAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Ngày duyệt không hợp lệ.' })
  approvedDate?: Date;

  // ✅ Trạng thái
  @IsOptional()
  @IsEnum(PostStatus, { message: 'Trạng thái bài viết không hợp lệ.' })
  status?: PostStatus;

  // 📌 Hiển thị đặc biệt
  @IsOptional()
  @IsBoolean({ message: 'Trường isFeatured phải là kiểu boolean.' })
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Trường isPinned phải là kiểu boolean.' })
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Trường isVisible phải là kiểu boolean.' })
  isVisible?: boolean;

  @IsOptional()
  @IsArray({ message: 'Danh sách bài liên quan phải là mảng chuỗi.' })
  @IsString({
    each: true,
    message: 'Từng slug trong relatedPostSlugs phải là chuỗi.',
  })
  relatedPostSlugs?: string[];

  // 🔒 Soft Delete
  @IsOptional()
  @IsBoolean({ message: 'Trường isDeleted phải là kiểu boolean.' })
  isDeleted?: boolean;
}
