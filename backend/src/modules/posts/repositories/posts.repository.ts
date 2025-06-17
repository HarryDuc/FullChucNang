import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
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
  findAll() {
    return this.model.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Tìm bài viết theo slug
   */
  findBySlug(slug: string) {
    return this.model.findOne({ slug, isDeleted: false }).lean();
  }

  /**
   * Tìm bài viết theo slug danh mục (main hoặc sub) có phân trang
   */
  async findManyByFilter(
    filter: FilterQuery<PostDocument>,
    skip = 0,
    limit = 10,
  ) {
    return this.model
      .find(filter)
      .sort({ publishedDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countByFilter(filter: FilterQuery<PostDocument>) {
    return this.model.countDocuments(filter);
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
}
