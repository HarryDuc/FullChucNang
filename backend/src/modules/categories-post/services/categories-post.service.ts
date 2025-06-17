import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CategoryPostRepository } from '../repositories/categories-post.repository';
import { CreateCategoryPostDto } from '../dtos/create-categories-post.dto';
import { UpdateCategoryPostDto } from '../dtos/update-categories-post.dto';
import { generateUniqueSlug } from '../../../common/utils/slug.utils';
import { isValidObjectId, Types } from 'mongoose';
import { CategoryPostDocument } from '../schemas/categories-post.schema';

/**
 * Giao diện cây danh mục trả về (bao gồm children đệ quy).
 */
export interface CategoryPostTree {
  _id: string;
  name: string;
  slug: string;
  level: number;
  parent: string | null;
  children: CategoryPostTree[];
  path: string;
  isDeleted: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Định nghĩa interface cho kết quả của buildHierarchy
interface HierarchyResult {
  path: string;
  level: number;
  parent: Types.ObjectId | null | undefined;
}

interface CategoryPostObject
  extends Omit<CategoryPostTree, 'children' | '_id'> {
  _id: Types.ObjectId;
}

@Injectable()
export class CategoryPostService {
  constructor(private readonly repository: CategoryPostRepository) {}

  /**
   * ✅ Tính toán path + level dựa vào parentId
   */
  private async buildHierarchy(parentId?: string) {
    if (!parentId) return { path: '', level: 0, parent: undefined };

    if (!isValidObjectId(parentId)) {
      throw new NotFoundException('ID danh mục cha không hợp lệ');
    }

    const parent = await this.repository.findById(parentId);
    if (!parent || parent.isDeleted) {
      throw new NotFoundException('Danh mục cha không tồn tại');
    }

    return {
      path: `${parent.path}/${parent.slug}`.replace(/^\/+/, ''),
      level: parent.level + 1,
      parent: new Types.ObjectId(parentId),
    };
  }

  /**
   * ✅ Chuyển mảng string => ObjectId
   */
  private mapToObjectIds(ids?: string[]): Types.ObjectId[] | undefined {
    return ids?.map((id) => new Types.ObjectId(id));
  }

  /**
   * 🌲 Xây dựng cây danh mục con đệ quy.
   */
  private async buildCategoryTree(
    category: CategoryPostDocument,
  ): Promise<CategoryPostTree> {
    const children = await this.repository.findByParent(
      category._id.toString(),
    );

    const childrenTree = await Promise.all(
      children.map((child) => this.buildCategoryTree(child)),
    );

    const categoryObj = category.toObject<CategoryPostObject>();

    return {
      ...categoryObj,
      _id: categoryObj._id.toString(),
      children: childrenTree,
    };
  }

  /**
   * Kiểm tra xem parent mới có nằm trong cây con của chính danh mục đang cập nhật hay không.
   */
  private async isCircularParenting(
    currentId: string,
    parentId?: string,
  ): Promise<boolean> {
    if (!parentId) return false;
    if (parentId === currentId) return true;

    const parent = await this.repository.findById(parentId);
    if (!parent || parent.isDeleted) return false;

    // Đệ quy kiểm tra tiếp tục với parent của parent
    return this.isCircularParenting(currentId, parent.parent?.toString());
  }

  /**
   * 🆕 Tạo mới danh mục bài viết.
   */
  async create(dto: CreateCategoryPostDto) {
    const slug = await generateUniqueSlug(dto.name, this.repository['model']);
    const hierarchy = await this.buildHierarchy(dto.parent);

    const created = await this.repository.create({
      ...dto,
      slug,
      path: hierarchy.path,
      level: hierarchy.level,
      parent: hierarchy.parent,
      children: this.mapToObjectIds(dto.children),
    });

    if (dto.parent) {
      await this.repository.addChildToParent(dto.parent, created._id);
    }

    return { message: 'Tạo danh mục thành công', data: created };
  }

  /**
   * ✏️ Cập nhật danh mục bài viết theo slug.
   */
  async update(slug: string, dto: UpdateCategoryPostDto) {
    const existing = await this.repository.findBySlug(slug);
    if (!existing) throw new NotFoundException('Danh mục không tồn tại');

    if (dto.slug && dto.slug !== slug) {
      const isExist = await this.repository.existsSlug(dto.slug);
      if (isExist) throw new ConflictException('Slug đã tồn tại');
    }

    const currentId = existing._id.toString();

    // 🛡️ Ngăn không cho tự làm cha mình
    if (dto.parent && dto.parent === currentId) {
      throw new ConflictException('Danh mục không thể làm cha của chính nó');
    }

    // 🛡️ Ngăn vòng lặp đệ quy: không cho làm cha của chính tổ tiên
    if (dto.parent) {
      const isCircular = await this.isCircularParenting(currentId, dto.parent);
      if (isCircular) {
        throw new ConflictException(
          'Không thể chọn danh mục con làm cha. Điều này tạo ra vòng lặp phân cấp.',
        );
      }
    }

    // const hierarchy = await this.buildHierarchy(
    //   dto.parent || existing.parent?.toString(),
    // );

    // Xử lý đặc biệt cho trường hợp parent là null (xóa parent)
    let hierarchy: HierarchyResult;
    if (dto.parent === null) {
      hierarchy = { path: '', level: 0, parent: null };
    } else {
      hierarchy = await this.buildHierarchy(
        dto.parent !== undefined ? dto.parent : existing.parent?.toString(),
      );
    }

    const updated = await this.repository.updateBySlug(slug, {
      ...dto,
      path: hierarchy.path,
      level: hierarchy.level,
      parent: hierarchy.parent,
      // children: this.mapToObjectIds(dto.children),
      children: dto.children ? this.mapToObjectIds(dto.children) : undefined,
    });

    return { message: 'Cập nhật danh mục thành công', data: updated };
  }

  /**
   * 📌 Lấy thông tin danh mục và toàn bộ cây con.
   */
  async findOne(slug: string) {
    const item = await this.repository.findBySlug(slug);
    if (!item) throw new NotFoundException('Danh mục không tồn tại');

    const tree = await this.buildCategoryTree(item);
    return { message: 'Lấy thông tin danh mục thành công', data: tree };
  }

  /**
   * 📋 Truy vấn toàn bộ danh mục với phân trang.
   */
  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const items = await this.repository.findAll(skip, limit);
    return { message: 'Truy vấn danh mục thành công', data: items };
  }

  /**
   * 🗑️ Xóa mềm – chỉ gán isDeleted = true.
   */
  async softDelete(slug: string) {
    const deleted = await this.repository.softDeleteBySlug(slug);
    if (!deleted)
      throw new NotFoundException('Không tìm thấy danh mục cần xóa');
    return { message: 'Xóa mềm danh mục thành công' };
  }

  /**
   * ❌ Xóa vĩnh viễn danh mục khỏi DB.
   */
  async hardDelete(slug: string) {
    const deleted = await this.repository.hardDeleteBySlug(slug);
    if (!deleted)
      throw new NotFoundException('Không tìm thấy danh mục cần xóa');
    return { message: 'Xóa vĩnh viễn danh mục thành công' };
  }
}
