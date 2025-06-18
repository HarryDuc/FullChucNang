import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { CreatePostDto } from '../dtos/create-posts.dto';
import { UpdatePostDto } from '../dtos/update-posts.dto';

@Injectable()
export class PostRepository {
  constructor(@InjectModel(Post.name) private model: Model<PostDocument>) { }

  /**
   * Tạo bài viết mới
   */
  create(dto: CreatePostDto) {
    return this.model.create(dto);
  }

  /**
   * Trả về tất cả bài viết chưa bị xóa mềm
   */
  async findAll(skip = 0, limit = 10) {
    return this.model
      .find({ isDeleted: false })
      .skip(skip)
      .limit(limit)
      .sort({ sortOrder: 1, createdAt: -1 }) // 👈 Ưu tiên sortOrder
      .exec();
  }

  async countAll() {
    return this.model.countDocuments({ isDeleted: false }).exec();
  }

  /**
   * Tìm bài viết theo slug
   */
  findBySlug(slug: string) {
    return this.model.findOne({ slug, isDeleted: false }).lean();
  }

  /**
   * Cập nhật bài viết theo slug
   */
  updateBySlug(slug: string, dto: UpdatePostDto) {
    const { category, ...rest } = dto;
    return this.model.findOneAndUpdate(
      { slug, isDeleted: false },
      {
        $set: {
          ...rest,
          category, // ✅ rõ ràng gán lại field lồng nhau
          updatedAt: new Date(),
        },
      },
      { new: true },
    );
  }

  /**
   * Đánh dấu xóa mềm bài viết
   */
  softDelete(slug: string) {
    return this.model.findOneAndUpdate(
      { slug, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
  }

  /**
   * Xóa hoàn toàn bài viết khỏi DB
   */
  async hardDelete(slug: string) {
    return this.model.findOneAndDelete({ slug });
  }

  /**
   * Kiểm tra slug đã tồn tại hay chưa
   */
  async existsBySlug(slug: string): Promise<boolean> {
    const result = await this.model.exists({ slug, isDeleted: false });
    return !!result;
  }

  /**
   * Tìm kiếm bài viết theo tên (và/hoặc tác giả), có phân trang
   */
  async searchByName(name: string, skip = 0, limit = 10) {
    // Sử dụng text index cho tìm kiếm
    return this.model
      .find({ $text: { $search: name }, isDeleted: false })
      .skip(skip)
      .limit(limit)
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .select({ score: { $meta: 'textScore' } })
      .exec();
  }

  async countSearchByName(name: string) {
    return this.model.countDocuments({ $text: { $search: name }, isDeleted: false }).exec();
  }
}
