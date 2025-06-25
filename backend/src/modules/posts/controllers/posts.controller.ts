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
  BadRequestException,
} from '@nestjs/common';
import { PostService } from '../services/posts.service';
import { CreatePostDto } from '../dtos/create-posts.dto';
import { UpdatePostDto } from '../dtos/update-posts.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionGuard } from 'src/modules/permissions/guards/permission.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { PostStatus } from '../schemas/post.schema';

class UpdateSlugDto {
  newSlug: string;
}

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
  @Roles('admin', 'manager')
  @RequirePermission('posts', 'create')
  async create(@Body() dto: CreatePostDto, @Req() req: Request) {
    const user = (req as Request & { user?: { fullName?: string } }).user ?? {};
    return this.postService.create(dto, user);
  }

  /**
   * Lấy danh sách tất cả bài viết chưa bị xóa mềm (isDeleted = false), có phân trang
   * @query page Số trang (mặc định: 1)
   * @query limit Số lượng bản ghi mỗi trang (mặc định: 10)
   * @query includeHidden Có bao gồm bài viết ẩn hay không (mặc định: false)
   */
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('includeHidden') includeHidden: boolean = false,
  ) {
    if (search && search.trim()) {
      return this.postService.search(search.trim(), +page, +limit, includeHidden);
    }
    return this.postService.findAll(+page, +limit, includeHidden);
  }

  /**
   * Lấy danh sách bài viết của user, có phân trang
   * @query userId ID của user cần lấy bài viết
   * @query page Số trang (mặc định: 1)
   * @query limit Số lượng bản ghi mỗi trang (mặc định: 10)
   */
  @Get('my-posts')
  @UseGuards(JwtAuthGuard)
  async getMyPosts(
    @Query('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (!userId) {
      throw new NotFoundException('Thiếu userId trong query parameters');
    }
    return this.postService.findByUserId(userId, +page, +limit);
  }

  /**
   * Lấy danh sách bài viết theo trạng thái phê duyệt
   * @query status Trạng thái bài viết (draft, pending, approved, rejected)
   * @query page Số trang (mặc định: 1)
   * @query limit Số lượng bản ghi mỗi trang (mặc định: 10)
   * @query includeHidden Có bao gồm bài viết ẩn hay không (mặc định: false)
   */
  @Get('by-status/:status')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @RequirePermission('posts', 'read')
  async getByStatus(
    @Param('status') status: PostStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('includeHidden') includeHidden: boolean = false,
  ) {
    return this.postService.findByStatus(status, +page, +limit, includeHidden);
  }

  /**
   * Lấy thông tin chi tiết một bài viết qua slug
   * @query includeHidden Có bao gồm bài viết ẩn hay không (mặc định: false)
   */
  @Get(':slug')
  async findOne(
    @Param('slug') slug: string,
    @Query('includeHidden') includeHidden: boolean = false,
  ) {
    const post = await this.postService.findBySlug(slug, includeHidden);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return post;
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
   * Cập nhật riêng slug của bài viết
   * Tự động tạo redirect từ slug cũ sang slug mới
   */
  @Patch(':slug/update-slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('posts', 'update')
  async updateSlug(@Param('slug') slug: string, @Body() dto: UpdateSlugDto) {
    const post = await this.postService.updateSlug(slug, dto.newSlug);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return post;
  }
  /**
   * Cập nhật trạng thái hiển thị của bài viết (ẩn/hiện)
   */
  @Patch(':slug/visibility')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager', 'staff')
  @RequirePermission('posts', 'publish')
  async updateVisibility(
    @Param('slug') slug: string,
    @Body() body: { isVisible: boolean },
  ) {
    if (body.isVisible === undefined) {
      throw new BadRequestException('Thiếu trường isVisible');
    }

    const post = await this.postService.updateVisibility(slug, body.isVisible);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return post;
  }

  /**
   * Cập nhật trạng thái phê duyệt của bài viết
   */
  @Patch(':slug/status')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @RequirePermission('posts', 'approve')
  async updateStatus(
    @Param('slug') slug: string,
    @Body() body: { status: PostStatus },
    @Req() req: Request,
  ) {
    if (!body.status) {
      throw new BadRequestException('Thiếu trường status');
    }

    if (!Object.values(PostStatus).includes(body.status)) {
      throw new BadRequestException('Trạng thái không hợp lệ');
    }

    const user = (req as Request & { user?: { fullName?: string } }).user ?? {};
    const approvedBy = body.status === PostStatus.Approved ? user?.fullName : undefined;

    const post = await this.postService.updateStatus(slug, body.status, approvedBy);
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
  @Roles('admin', 'manager')
  @RequirePermission('posts', 'delete')
  async hardRemove(@Param('slug') slug: string) {
    const post = await this.postService.hardDelete(slug);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return post;
  }

  /**
   * Chuyển tất cả bài viết từ một user sang user khác
   */
  @Post('transfer-all')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('posts', 'update')
  async transferAllPosts(
    @Body() body: { fromUserId: string; toUserId: string },
  ) {
    const { fromUserId, toUserId } = body;

    if (!fromUserId || !toUserId) {
      throw new BadRequestException('Thiếu fromUserId hoặc toUserId');
    }

    if (fromUserId === toUserId) {
      throw new BadRequestException('fromUserId và toUserId không được giống nhau');
    }

    return this.postService.transferAllPosts(fromUserId, toUserId);
  }

  /**
   * Chuyển các bài viết được chọn từ một user sang user khác
   */
  @Post('transfer-selected')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('posts', 'update')
  async transferSelectedPosts(
    @Body() body: { fromUserId: string; toUserId: string; postIds: string[] },
  ) {
    const { fromUserId, toUserId, postIds } = body;

    if (!fromUserId || !toUserId || !postIds?.length) {
      throw new BadRequestException('Thiếu fromUserId, toUserId hoặc postIds');
    }

    if (fromUserId === toUserId) {
      throw new BadRequestException('fromUserId và toUserId không được giống nhau');
    }

    return this.postService.transferSelectedPosts(fromUserId, toUserId, postIds);
  }
}
