import { BadRequestException, Injectable } from '@nestjs/common';
import { PostRepository } from '../repositories/posts.repository';
import { CreatePostDto } from '../dtos/create-posts.dto';
import { UpdatePostDto } from '../dtos/update-posts.dto';
import { Post, PostDocument } from '../schemas/post.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  generateUniqueSlug,
  removeVietnameseTones,
} from '../../../common/utils/slug.utils';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepo: PostRepository,

    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>, // Dùng để tạo slug duy nhất
  ) {}

  /**
   * Tạo bài viết mới, tự động xử lý slug không dấu và tránh trùng lặp
   */
  async create(dto: CreatePostDto, user: { fullName?: string }) {
    const rawSlug = dto.slug || dto.title;
    const finalSlug = await generateUniqueSlug(rawSlug, this.postModel);

    dto.slug = finalSlug;

    // ⏰ Nếu không có ngày xuất bản, mặc định là ngày hiện tại
    if (!dto.publishedDate) {
      dto.publishedDate = new Date();
    }

    // 👤 Nếu không có author, lấy từ user.fullName hoặc mặc định là 'Admin'
    dto.author = user?.fullName?.trim() || 'Admin';

    return this.postRepo.create(dto);
  }

  /**
   * Lấy danh sách tất cả bài viết chưa bị xóa
   */
  findAll() {
    return this.postRepo.findAll();
  }

  /**
   * Tìm bài viết theo slug
   */
  findBySlug(slug: string) {
    return this.postRepo.findBySlug(slug);
  }

  /**
   * Lấy bài viết theo name danh mục (main hoặc sub) có phân trang
   */
  async findByCategorySlugWithPagination(name: string, page = 1, limit = 10) {
    const filter = {
      isDeleted: false,
      $or: [
        { 'category.main': { $in: [name] } },
        { 'category.sub': { $in: [name] } },
      ],
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.postRepo.findManyByFilter(filter, skip, limit),
      this.postRepo.countByFilter(filter),
    ]);

    return { data, total };
  }

  /**
   * Cập nhật bài viết và xử lý slug nếu bị thay đổi
   */
  async updateBySlug(slug: string, dto: UpdatePostDto) {
    if (dto.slug) {
      const newSlug = removeVietnameseTones(dto.slug);
      if (newSlug !== slug) {
        const existed = await this.postRepo.existsBySlug(newSlug);
        if (existed) {
          throw new BadRequestException(`Slug "${newSlug}" đã tồn tại.`);
        }
        dto.slug = newSlug;
      }
    }
    return this.postRepo.updateBySlug(slug, dto);
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
}
