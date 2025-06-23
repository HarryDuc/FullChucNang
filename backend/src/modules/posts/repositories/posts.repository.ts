import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument, PostStatus } from '../schemas/post.schema';
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
  async findAll(skip = 0, limit = 10, includeHidden = false) {
    const query = { isDeleted: false };

    // Nếu không bao gồm bài viết ẩn, thêm điều kiện isVisible = true
    if (!includeHidden) {
      query['isVisible'] = true;
    }

    return this.model
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ sortOrder: 1, createdAt: -1 }) // 👈 Ưu tiên sortOrder
      .exec();
  }

  async countAll(includeHidden = false) {
    const query = { isDeleted: false };

    // Nếu không bao gồm bài viết ẩn, thêm điều kiện isVisible = true
    if (!includeHidden) {
      query['isVisible'] = true;
    }

    return this.model.countDocuments(query).exec();
  }

  /**
   * Tìm bài viết theo slug
   */
  findBySlug(slug: string, includeHidden = false) {
    const query = { slug, isDeleted: false };

    // Nếu không bao gồm bài viết ẩn, thêm điều kiện isVisible = true
    if (!includeHidden) {
      query['isVisible'] = true;
    }

    return this.model.findOne(query).lean();
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
  async searchByName(name: string, skip = 0, limit = 10, includeHidden = false) {
    const query = { $text: { $search: name }, isDeleted: false };

    // Nếu không bao gồm bài viết ẩn, thêm điều kiện isVisible = true
    if (!includeHidden) {
      query['isVisible'] = true;
    }

    return this.model
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .select({ score: { $meta: 'textScore' } })
      .exec();
  }

  async countSearchByName(name: string, includeHidden = false) {
    const query = { $text: { $search: name }, isDeleted: false };

    // Nếu không bao gồm bài viết ẩn, thêm điều kiện isVisible = true
    if (!includeHidden) {
      query['isVisible'] = true;
    }

    return this.model.countDocuments(query).exec();
  }

  /**
   * Lấy bài viết theo userId với phân trang
   */
  async findByUserId(userId: string, skip = 0, limit = 10) {
    return this.model
      .find({ userId, isDeleted: false })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Đếm tổng số bài viết của user
   */
  async countByUserId(userId: string) {
    return this.model.countDocuments({ userId, isDeleted: false }).exec();
  }

  /**
   * Lấy tất cả bài viết của một user (không phân trang)
   */
  async findAllByUserId(userId: string) {
    return this.model
      .find({ userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Lấy các bài viết theo userId và mảng postIds
   */
  async findByUserIdAndIds(userId: string, postIds: string[]) {
    return this.model
      .find({
        _id: { $in: postIds },
        userId,
        isDeleted: false,
      })
      .exec();
  }

  /**
   * Cập nhật nhiều bài viết theo userId
   */
  async updateManyByUserId(userId: string, update: Partial<Post>) {
    return this.model.updateMany(
      { userId, isDeleted: false },
      { $set: { ...update, updatedAt: new Date() } },
    );
  }

  /**
   * Cập nhật nhiều bài viết theo mảng ID
   */
  async updateManyByIds(postIds: string[], update: Partial<Post>) {
    return this.model.updateMany(
      { _id: { $in: postIds }, isDeleted: false },
      { $set: { ...update, updatedAt: new Date() } },
    );
  }

  /**
   * Lấy danh sách bài viết theo trạng thái phê duyệt
   */
  async findByStatus(status: PostStatus, skip = 0, limit = 10, includeHidden = false) {
    const query = { status, isDeleted: false };

    // Nếu không bao gồm bài viết ẩn, thêm điều kiện isVisible = true
    if (!includeHidden) {
      query['isVisible'] = true;
    }

    return this.model
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Đếm số bài viết theo trạng thái phê duyệt
   */
  async countByStatus(status: PostStatus, includeHidden = false) {
    const query = { status, isDeleted: false };

    // Nếu không bao gồm bài viết ẩn, thêm điều kiện isVisible = true
    if (!includeHidden) {
      query['isVisible'] = true;
    }

    return this.model.countDocuments(query).exec();
  }

  /**
   * Cập nhật trạng thái phê duyệt của bài viết
   */
  async updateStatus(slug: string, status: PostStatus, approvedBy?: string) {
    const update: any = { status };

    // Nếu trạng thái là approved, cập nhật thêm ngày duyệt và người duyệt
    if (status === PostStatus.Approved) {
      update.approvedDate = new Date();
      if (approvedBy) {
        update.approvedBy = approvedBy;
      }
    }

    return this.model.findOneAndUpdate(
      { slug, isDeleted: false },
      { $set: update },
      { new: true },
    );
  }

  /**
   * Cập nhật trạng thái hiển thị của bài viết
   */
  async updateVisibility(slug: string, isVisible: boolean) {
    return this.model.findOneAndUpdate(
      { slug, isDeleted: false },
      { $set: { isVisible, updatedAt: new Date() } },
      { new: true },
    );
  }
}
