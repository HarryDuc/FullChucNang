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
  ) { }

  /**
   * Tạo bài viết mới, tự động xử lý slug không dấu và tránh trùng lặp
   */
  async create(dto: CreatePostDto, user: { fullName?: string }) {
    const rawSlug = dto.slug || dto.name;
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

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.postRepo.findAll(skip, limit),
      this.postRepo.countAll(),
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
  findBySlug(slug: string) {
    return this.postRepo.findBySlug(slug);
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

  async search(name: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.postRepo.searchByName(name, skip, limit),
      this.postRepo.countSearchByName(name),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
