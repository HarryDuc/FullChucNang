import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoryPostService } from '../services/categories-post.service';
import { CreateCategoryPostDto } from '../dtos/create-categories-post.dto';
import { UpdateCategoryPostDto } from '../dtos/update-categories-post.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PermissionGuard } from 'src/modules/permissions/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';

/**
 * Controller quản lý danh mục bài viết.
 * Chuẩn RESTful – Thân thiện SEO – Kiểm soát logic theo tầng rõ ràng.
 */
@Controller('category-postsapi')
export class CategoryPostController {
  constructor(private readonly service: CategoryPostService) { }

  /**
   * POST /api/category-posts
   * 👉 Tạo mới danh mục bài viết.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('categories-post', 'create')
  async create(@Body() dto: CreateCategoryPostDto) {
    return this.service.create(dto);
  }

  /**
   * PATCH /api/category-posts/:slug
   * 👉 Cập nhật thông tin danh mục theo slug.
   */
  @Patch(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('categories-post', 'update')
  async update(
    @Param('slug') slug: string,
    @Body() dto: UpdateCategoryPostDto,
  ) {
    return this.service.update(slug, dto);
  }

  /**
   * GET /api/category-posts/:slug
   * 👉 Trả về thông tin danh mục và toàn bộ cây con (đệ quy).
   */
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.service.findOne(slug);
  }

  /**
   * GET /api/category-posts?page=&limit=
   * 👉 Truy vấn tất cả danh mục (phân trang).
   * @query page Số trang (default: 1)
   * @query limit Số bản ghi/trang (default: 10)
   */
  @Get()
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.findAll(page, limit);
  }

  /**
   * PATCH /api/category-posts/:slug/soft-delete
   * 👉 Xoá mềm danh mục (chỉ đặt cờ isDeleted = true).
   */
  @Patch(':slug/soft-delete')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('categories-post', 'delete')
  async softDelete(@Param('slug') slug: string) {
    return this.service.softDelete(slug);
  }

  /**
   * DELETE /api/category-posts/:slug
   * 👉 Xoá vĩnh viễn danh mục khỏi cơ sở dữ liệu.
   */
  @Delete(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('categories-post', 'delete')
  async hardDelete(@Param('slug') slug: string) {
    return this.service.hardDelete(slug);
  }
}
