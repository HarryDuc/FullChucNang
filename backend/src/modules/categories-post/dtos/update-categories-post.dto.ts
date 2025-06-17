import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryPostDto } from './create-categories-post.dto';

/**
 * DTO cập nhật danh mục bài viết – cho phép cập nhật từng phần.
 */
export class UpdateCategoryPostDto extends PartialType(CreateCategoryPostDto) {}
