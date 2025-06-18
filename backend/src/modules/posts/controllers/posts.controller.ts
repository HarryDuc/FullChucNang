import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostService } from '../services/posts.service';
import { CreatePostDto } from '../dtos/create-posts.dto';
import { UpdatePostDto } from '../dtos/update-posts.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionGuard } from 'src/modules/permissions/guards/permission.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RequirePermission } from 'src/common/decorators/permission.decorator';

/**
 * Bộ điều khiển quản lý bài viết (CRUD) tại endpoint /api/posts
 */
@Controller('postapi')
export class PostController {
  constructor(private readonly postService: PostService) { }

  /**
   * Tạo một bài viết mới
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  // @Roles('admin', 'manager')
  @RequirePermission('posts', 'create')
  async create(@Body() dto: CreatePostDto, @Req() req: Request) {
    const user = (req as Request & { user?: { fullName?: string } }).user ?? {};
    return this.postService.create(dto, user);
  }

  /**
   * Lấy danh sách tất cả bài viết chưa bị xóa mềm (isDeleted = false), có phân trang
   * @query page Số trang (mặc định: 1)
   * @query limit Số lượng bản ghi mỗi trang (mặc định: 10)
   */
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    if (search && search.trim()) {
      return this.postService.search(search.trim(), +page, +limit);
    }
    return this.postService.findAll(+page, +limit);
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
   * Cập nhật nội dung bài viết qua slug
   */
  @Patch(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  // @Roles('admin', 'manager', 'staff')
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
  // @Roles('admin', 'manager')
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
  // @Roles('admin', 'manager')
  @RequirePermission('posts', 'delete')
  async hardRemove(@Param('slug') slug: string) {
    const post = await this.postService.hardDelete(slug);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return post;
  }
}
