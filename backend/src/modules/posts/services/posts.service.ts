import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from '../repositories/posts.repository';
import { CreatePostDto } from '../dtos/create-posts.dto';
import { UpdatePostDto } from '../dtos/update-posts.dto';
import { Post, PostDocument, PostStatus } from '../schemas/post.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  generateUniqueSlug,
  removeVietnameseTones,
} from '../../../common/utils/slug.utils';
import { RedirectsService } from '../../redirects/services/redirects.service';
import { FRONTEND_ROUTES } from '../../../config/routes.config';
@Injectable()
export class PostService {
  constructor(
    private readonly postRepo: PostRepository,

    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>, // Dùng để tạo slug duy nhất

    @Inject(forwardRef(() => RedirectsService))
    private readonly redirectsService: RedirectsService, // Dùng để tạo redirect
  ) { }

  /**
   * Tạo bài viết mới, tự động xử lý slug không dấu và tránh trùng lặp
   */
  async create(dto: CreatePostDto, user: { fullName?: string; userId?: string }) {
    const rawSlug = dto.slug || dto.name;
    const finalSlug = await generateUniqueSlug(rawSlug, this.postModel);

    dto.slug = finalSlug;

    // ⏰ Nếu không có ngày xuất bản, mặc định là ngày hiện tại
    if (!dto.publishedDate) {
      dto.publishedDate = new Date();
    }

    // 👤 Chỉ set author nếu không được gửi từ frontend
    if (!dto.author) {
      dto.author = user?.fullName?.trim() || 'Admin';
    }

    // 🆔 Thêm userId vào bài viết
    if (!user.userId) {
      throw new Error('User ID is required');
    }
    dto.userId = user.userId;

    return this.postRepo.create(dto);
  }

  async findAll(page = 1, limit = 10, includeHidden = false) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.postRepo.findAll(skip, limit, includeHidden),
      this.postRepo.countAll(includeHidden),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Tìm bài viết theo slug
   */
  findBySlug(slug: string, includeHidden = false) {
    return this.postRepo.findBySlug(slug, includeHidden);
  }

    /**
   * Cập nhật bài viết và xử lý slug nếu bị thay đổi
   * Tự động tạo redirect nếu slug thay đổi
   */
  // async updateBySlug(slug: string, dto: UpdatePostDto) {
  //   if (dto.slug) {
  //     const newSlug = removeVietnameseTones(dto.slug);
  //     if (newSlug !== slug) {
  //       const existed = await this.postRepo.existsBySlug(newSlug);
  //       if (existed) {
  //         throw new BadRequestException(`Slug "${newSlug}" đã tồn tại.`);
  //       }
  //       dto.slug = newSlug;
  //     }
  //   }
  //   return this.postRepo.updateBySlug(slug, dto);
  // }

    /**
   * Cập nhật bài viết và xử lý slug nếu bị thay đổi
   * Tự động tạo redirect nếu slug thay đổi
   */
    async updateBySlug(slug: string, dto: UpdatePostDto) {
      let oldSlug = slug;
      let newSlug = slug;
      let needRedirect = false;

      if (dto.slug) {
        newSlug = removeVietnameseTones(dto.slug);
        if (newSlug !== slug) {
          // Kiểm tra xem slug mới có tồn tại không
          const existed = await this.postRepo.existsBySlug(newSlug);
          if (existed) {
            throw new BadRequestException(`Slug "${newSlug}" đã tồn tại.`);
          }
          dto.slug = newSlug;
          needRedirect = true;
        }
      }

      // Cập nhật bài viết
      const updatedPost = await this.postRepo.updateBySlug(oldSlug, dto);

      if (!updatedPost) {
        throw new NotFoundException(`Không tìm thấy bài viết với slug ${oldSlug}`);
      }

      // Nếu slug đã thay đổi, tạo redirect từ slug cũ sang slug mới
      if (needRedirect && this.redirectsService) {
        try {
          // Sử dụng cấu hình đường dẫn từ routes.config
          const oldPath = FRONTEND_ROUTES.POSTS.DETAIL(oldSlug);
          const newPath = FRONTEND_ROUTES.POSTS.DETAIL(newSlug);

          // Tạo redirect trong hệ thống
          await this.redirectsService.create({
            oldPath,
            newPath,
            type: 'post',
            isActive: true,
            statusCode: 301,
          });

          console.log(`Đã tạo redirect từ ${oldPath} sang ${newPath}`);
        } catch (redirectError) {
          console.error('Lỗi khi tạo redirect:', redirectError);
        }
      }

      return updatedPost;
    }

    
  /**
   * Xóa mềm bài viết
   */
  softDelete(slug: string) {
    return this.postRepo.softDelete(slug);
  }

  /**
   * Xóa vĩnh viễn bài viết khỏi DB
   */
  async hardDelete(slug: string) {
    return this.postRepo.hardDelete(slug);
  }

  /**
   * Lấy danh sách bài viết của user đang đăng nhập
   */
  async findByUserId(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.postRepo.findByUserId(userId, skip, limit),
      this.postRepo.countByUserId(userId),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async search(name: string, page = 1, limit = 10, includeHidden = false) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.postRepo.searchByName(name, skip, limit, includeHidden),
      this.postRepo.countSearchByName(name, includeHidden),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Chuyển tất cả bài viết từ một user sang user khác
   */
  async transferAllPosts(fromUserId: string, toUserId: string) {
    // Kiểm tra xem có bài viết nào của fromUserId không
    const posts = await this.postRepo.findAllByUserId(fromUserId);
    if (!posts.length) {
      throw new NotFoundException('Không tìm thấy bài viết nào của user này');
    }

    // Thực hiện chuyển tất cả bài viết
    const result = await this.postRepo.updateManyByUserId(fromUserId, { userId: toUserId });

    return {
      message: 'Chuyển bài viết thành công',
      transferredCount: result.modifiedCount,
    };
  }

  /**
   * Chuyển các bài viết được chọn từ một user sang user khác
   */
  async transferSelectedPosts(fromUserId: string, toUserId: string, postIds: string[]) {
    // Kiểm tra xem các bài viết có thuộc về fromUserId không
    const posts = await this.postRepo.findByUserIdAndIds(fromUserId, postIds);

    if (!posts.length) {
      throw new NotFoundException('Không tìm thấy bài viết nào của user này');
    }

    if (posts.length !== postIds.length) {
      throw new BadRequestException('Một số bài viết không thuộc về user này');
    }

    // Thực hiện chuyển các bài viết được chọn
    const result = await this.postRepo.updateManyByIds(postIds, { userId: toUserId });

    return {
      message: 'Chuyển bài viết thành công',
      transferredCount: result.modifiedCount,
    };
  }

  /**
   * Lấy danh sách bài viết theo trạng thái phê duyệt
   */
  async findByStatus(status: PostStatus, page = 1, limit = 10, includeHidden = false) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.postRepo.findByStatus(status, skip, limit, includeHidden),
      this.postRepo.countByStatus(status, includeHidden),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Cập nhật trạng thái phê duyệt của bài viết
   */
  async updateStatus(slug: string, status: PostStatus, approvedBy?: string) {
    const post = await this.postRepo.findBySlug(slug, true);
    if (!post) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    return this.postRepo.updateStatus(slug, status, approvedBy);
  }

  /**
   * Cập nhật trạng thái hiển thị của bài viết
   */
  async updateVisibility(slug: string, isVisible: boolean) {
    const post = await this.postRepo.findBySlug(slug, true);
    if (!post) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    return this.postRepo.updateVisibility(slug, isVisible);
  }
    /**
   * Cập nhật riêng slug của bài viết
   * Tự động tạo redirect từ slug cũ sang slug mới
   * @param slug Slug hiện tại của bài viết
   * @param newSlug Slug mới cho bài viết
   */
    async updateSlug(slug: string, newSlug: string): Promise<Post | null> {
      // Kiểm tra xem slug mới có hợp lệ không
      if (!newSlug || newSlug.trim() === '') {
        throw new BadRequestException('Slug mới không được để trống!');
      }

      // Chuẩn hóa slug mới
      const finalNewSlug = removeVietnameseTones(newSlug);

      // Kiểm tra slug mới có giống với slug cũ không
      if (finalNewSlug === slug) {
        return this.findBySlug(slug);
      }

      // Kiểm tra xem slug mới đã tồn tại chưa
      const existed = await this.postRepo.existsBySlug(finalNewSlug);
      if (existed) {
        throw new BadRequestException(`Slug "${finalNewSlug}" đã tồn tại.`);
      }

      // Cập nhật slug mới
      const updatedPost = await this.postRepo.updateBySlug(slug, { slug: finalNewSlug });

      if (!updatedPost) {
        throw new NotFoundException(`Không tìm thấy bài viết với slug ${slug}`);
      }

      // Tạo redirect từ slug cũ sang slug mới
      if (this.redirectsService) {
        try {
          // Sử dụng cấu hình đường dẫn từ routes.config
          const oldPath = FRONTEND_ROUTES.POSTS.DETAIL(slug);
          const newPath = FRONTEND_ROUTES.POSTS.DETAIL(finalNewSlug);

          // Tạo redirect trong hệ thống
          await this.redirectsService.create({
            oldPath,
            newPath,
            type: 'post',
            isActive: true,
            statusCode: 301,
          });

          console.log(`Đã tạo redirect từ ${oldPath} sang ${newPath}`);
        } catch (redirectError) {
          console.error('Lỗi khi tạo redirect:', redirectError);
        }
      }

      return updatedPost;
    }
}
