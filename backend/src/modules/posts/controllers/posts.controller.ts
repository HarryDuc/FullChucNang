import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { PostService } from '../services/posts.service';
import { CreatePostDto } from '../dtos/create-posts.dto';
import { UpdatePostDto } from '../dtos/update-posts.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PermissionGuard } from 'src/modules/permissions/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';

/**
 * Bộ điều khiển quản lý bài viết (CRUD) tại endpoint /api/posts
 */
@Controller('postsapi')
export class PostController {
  constructor(private readonly postService: PostService) { }

  /**
   * Tạo một bài viết mới
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager', 'staff')
  @RequirePermission('posts', 'create')
  async create(@Body() dto: CreatePostDto, @Req() req: Request) {
    const user = (req as Request & { user?: { fullName?: string } }).user ?? {};
    return this.postService.create(dto, user);
  }

  /**
   * Lấy danh sách tất cả bài viết chưa bị xóa mềm (isDeleted = false)
   */
  @Get()
  async findAll() {
    return this.postService.findAll();
  }

  /**
   * Lấy thông tin chi tiết một bài viết qua slug
   */
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const post = await this.postService.findBySlug(slug);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return post;
  }

  /**
   * Lấy bài viết theo name danh mục (có phân trang)
   * @example GET /postsapi/category/tranh-canvas?page=2&limit=6
   */
  @Get('category/:slug')
  async findByCategorySlugWithPagination(
    @Param('slug') slug: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.postService.findByCategorySlugWithPagination(
      slug,
      parseInt(page),
      parseInt(limit),
    );
  }

  /**
   * Cập nhật nội dung bài viết qua slug
   */
  @Patch(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager', 'staff')
  @RequirePermission('posts', 'update')
  async update(@Param('slug') slug: string, @Body() dto: UpdatePostDto) {
    const post = await this.postService.updateBySlug(slug, dto);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return post;
  }

  /**
   * Xóa mềm bài viết (isDeleted = true)
   */
  @Delete(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('posts', 'delete')
  async remove(@Param('slug') slug: string) {
    const post = await this.postService.softDelete(slug);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return post;
  }

  /**
   * Xóa vĩnh viễn bài viết khỏi cơ sở dữ liệu
   */
  @Delete(':slug/force')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('posts', 'delete')
  async hardRemove(@Param('slug') slug: string) {
    const post = await this.postService.hardDelete(slug);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return post;
  }
}
