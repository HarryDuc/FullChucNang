import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CategoryPost,
  CategoryPostDocument,
} from '../schemas/categories-post.schema';

@Injectable()
export class CategoryPostRepository {
  constructor(
    @InjectModel(CategoryPost.name)
    private readonly model: Model<CategoryPostDocument>,
  ) {}

  /**
   * Tạo mới một danh mục bài viết.
   * @param data Dữ liệu danh mục
   */
  async create(
    data: Partial<CategoryPostDocument>,
  ): Promise<CategoryPostDocument> {
    return this.model.create(data);
  }

  /**
   * Tìm danh mục theo slug.
   * @param slug Slug của danh mục
   */
  async findBySlug(slug: string): Promise<CategoryPostDocument | null> {
    return this.model.findOne({ slug, isDeleted: false }).exec();
  }

  /**
   * Cập nhật danh mục theo slug.
   * @param slug Slug hiện tại
   * @param data Dữ liệu cần cập nhật
   */
  async updateBySlug(
    slug: string,
    data: Partial<CategoryPost>,
  ): Promise<CategoryPostDocument | null> {
    return this.model
      .findOneAndUpdate({ slug, isDeleted: false }, data, { new: true })
      .exec();
  }

  /**
   * Xóa mềm danh mục theo slug (đặt isDeleted = true).
   * @param slug Slug danh mục cần xóa
   */
  async softDeleteBySlug(slug: string): Promise<CategoryPostDocument | null> {
    return this.model
      .findOneAndUpdate(
        { slug, isDeleted: false },
        { isDeleted: true },
        { new: true },
      )
      .exec();
  }

  /**
   * Xóa vĩnh viễn danh mục khỏi DB.
   * @param slug Slug danh mục cần xóa
   */
  async hardDeleteBySlug(slug: string): Promise<CategoryPostDocument | null> {
    return this.model.findOneAndDelete({ slug }).exec();
  }

  /**
   * Kiểm tra slug đã tồn tại hay chưa.
   * @param slug Slug cần kiểm tra
   */
  async existsSlug(slug: string): Promise<boolean> {
    const result = await this.model.exists({ slug, isDeleted: false });
    return !!result;
  }

  /**
   * Tìm danh mục theo ID.
   * @param id ObjectId của danh mục
   */
  async findById(id: string): Promise<CategoryPostDocument | null> {
    return this.model.findById(id).exec();
  }

  /**
   * Truy vấn danh mục (phân trang).
   * @param skip Số lượng bỏ qua
   * @param limit Số lượng lấy về
   */
  async findAll(skip: number, limit: number): Promise<CategoryPostDocument[]> {
    return this.model
      .find({ isDeleted: false })
      .skip(skip)
      .limit(limit)
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();
  }

  /**
   * Truy vấn danh mục con theo parent.
   * @param parentId ID danh mục cha
   */
  async findByParent(parentId: string): Promise<CategoryPostDocument[]> {
    return this.model
      .find({ parent: new Types.ObjectId(parentId), isDeleted: false })
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();
  }

  /**
   * Cập nhật danh mục cha – thêm ID danh mục con vào mảng children.
   * @param parentId ID danh mục cha
   * @param childId ObjectId của danh mục con
   */
  async addChildToParent(
    parentId: string,
    childId: Types.ObjectId,
  ): Promise<CategoryPostDocument | null> {
    return this.model
      .findOneAndUpdate(
        { _id: parentId, isDeleted: false },
        { $addToSet: { children: childId } },
        { new: true },
      )
      .exec();
  }
}
