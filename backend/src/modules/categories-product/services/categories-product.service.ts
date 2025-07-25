import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { removeVietnameseTones } from 'src/common/utils/slug.utils';

export interface SimpleCategory {
  id: string;
  name: string;
  slug: string;
}

@Injectable()
export class CategoriesProductService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) { }

  /**
   * ✅ Tạo danh mục mới (hỗ trợ tạo danh mục con ngay lập tức)
   */
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<string> {
    const { subCategories, name, parentCategory, ...categoryData } =
      createCategoryDto;
    const slug = removeVietnameseTones(name);

    // 🔍 Kiểm tra slug để tránh trùng lặp
    let uniqueSlug = slug;
    let count = 1;
    while (await this.categoryModel.findOne({ slug: uniqueSlug }).exec()) {
      uniqueSlug = `${slug}-${count}`;
      count++;
    }

    // 🏷️ Tạo danh mục chính (hoặc danh mục cha)
    const category = new this.categoryModel({
      ...categoryData,
      name,
      slug: uniqueSlug,
      parentCategory: parentCategory
        ? new Types.ObjectId(parentCategory)
        : null,
      _id: new Types.ObjectId(),
      subCategories: [],
    });

    await category.save();

    // 🏷️ Nếu có danh mục cha, thêm ID vào danh mục cha
    if (parentCategory) {
      const parent = await this.categoryModel.findById(parentCategory);
      if (!parent) throw new NotFoundException('Danh mục cha không tồn tại!');
      parent.subCategories.push(category._id);
      await parent.save();
    }

    // 🏷️ Xử lý danh mục con (đệ quy nhưng không lưu trùng)
    if (subCategories?.length) {
      category.subCategories = await this.createSubCategories(
        subCategories,
        category._id,
        category.level + 1,
      );
      await category.save();
    }

    return 'Danh mục đã được tạo thành công';
  }

  /**
   * ✅ Lấy ID danh mục (để hiển thị tên danh mục cha trong xem chi tiết)
   */
  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) throw new NotFoundException('Danh mục không tồn tại!');
    return category;
  }

  /**
   * ✅ Hàm đệ quy để tạo danh mục con nhiều cấp mà không bị trùng
   */
  private async createSubCategories(
    subCategories: CreateCategoryDto[],
    parentId: Types.ObjectId,
    level: number,
  ): Promise<Types.ObjectId[]> {
    const createdSubCategories = await Promise.all(
      subCategories.map(async (subCategoryDto) => {
        // 🔍 Kiểm tra danh mục con có tồn tại chưa (tránh lưu trùng)
        const existingCategory = await this.categoryModel.findOne({
          name: subCategoryDto.name,
          parentCategory: parentId,
        });

        if (existingCategory) {
          return existingCategory._id; // Nếu đã có, trả về `_id` cũ
        }

        // Tạo slug duy nhất
        const slug = removeVietnameseTones(subCategoryDto.name);
        let uniqueSlug = slug;
        let count = 1;
        while (await this.categoryModel.findOne({ slug: uniqueSlug }).exec()) {
          uniqueSlug = `${slug}-${count}`;
          count++;
        }

        const newCategory = new this.categoryModel({
          ...subCategoryDto,
          slug: uniqueSlug,
          parentCategory: parentId,
          level,
          subCategories: [],
        });

        await newCategory.save();

        // Nếu danh mục con có danh mục con khác, tiếp tục tạo
        if (subCategoryDto.subCategories?.length) {
          newCategory.subCategories = await this.createSubCategories(
            subCategoryDto.subCategories,
            newCategory._id,
            level + 1,
          );
          await newCategory.save();
        }

        return newCategory._id;
      }),
    );

    return createdSubCategories;
  }

  /**
   * ✅ Lấy tất cả danh mục (không phân trang)
   */
  async getAllCategories(): Promise<Category[]> {
    return this.categoryModel.find().populate('subCategories').exec();
  }

  /**
   * ✅ Lấy danh mục theo slug (bao gồm danh mục con đầy đủ)
   */
  async getCategoryBySlug(slug: string): Promise<any> {
    const category = await this.categoryModel.findOne({ slug }).exec();
    if (!category) throw new NotFoundException('Danh mục không tồn tại');

    // 🏷️ Lấy tất cả danh mục con đệ quy
    const fullSubCategories = await this.getAllSubCategories(category._id);

    // Trả về object mở rộng, tránh lỗi TypeScript
    return {
      ...category.toObject(),
      fullSubCategories, // 👈 Thêm danh mục con đầy đủ
    };
  }

  /**
   * 🏷️ Hàm lấy danh mục con đệ quy
   */
  private async getAllSubCategories(parentId: Types.ObjectId): Promise<any[]> {
    const subCategories = await this.categoryModel
      .find({ parentCategory: parentId })
      .exec();

    return Promise.all(
      subCategories.map(async (subCategory) => ({
        ...subCategory.toObject(),
        fullSubCategories: await this.getAllSubCategories(subCategory._id),
      })),
    );
  }

  /**
   * ✅ Cập nhật danh mục theo slug
   */
  async updateCategory(
    slug: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<string> {
    const category = await this.categoryModel.findOne({ slug }).exec();
    if (!category) throw new NotFoundException('Danh mục không tồn tại!');

    // Kiểm tra updateCategoryDto có tồn tại không
    if (!updateCategoryDto) {
      throw new Error('Dữ liệu cập nhật không hợp lệ!');
    }

    // Kiểm tra nếu có thay đổi danh mục cha
    if (updateCategoryDto.parentCategory) {
      const newParent = await this.categoryModel
        .findById(updateCategoryDto.parentCategory)
        .exec();
      if (!newParent)
        throw new NotFoundException('Danh mục cha không tồn tại!');

      category.parentCategory = newParent._id;
      category.level = newParent.level + 1;

      // Cập nhật level của danh mục con
      await this.updateChildrenLevels(category._id, category.level + 1);
    }

    // Cập nhật thông tin danh mục
    Object.assign(category, updateCategoryDto);
    await category.save();

    return 'Danh mục đã được cập nhật thành công';
  }

  /**
   * ✅ Cập nhật level của danh mục con khi danh mục cha thay đổi
   */
  private async updateChildrenLevels(
    parentId: Types.ObjectId,
    newLevel: number,
  ) {
    const children = await this.categoryModel
      .find({ parentCategory: parentId })
      .exec();
    for (const child of children) {
      child.level = newLevel;
      await child.save();
      // Đệ quy cập nhật danh mục con của danh mục con
      await this.updateChildrenLevels(child._id, newLevel + 1);
    }
  }

  /**
   * ✅ Xóa danh mục theo slug (chuyển danh mục con lên mức cao nhất nếu có)
   */
  async deleteCategory(slug: string): Promise<string> {
    const category = await this.categoryModel.findOne({ slug }).exec();
    if (!category) throw new NotFoundException('Danh mục không tồn tại!');

    // Cập nhật danh mục con lên cấp cao nhất
    await this.categoryModel.updateMany(
      { parentCategory: category._id },
      { $set: { parentCategory: null, level: 0 } },
    );

    const deletedCategory = await this.categoryModel
      .findOneAndDelete({ slug })
      .exec();
    if (!deletedCategory)
      throw new NotFoundException('Danh mục không tồn tại!');

    return 'Danh mục đã được xóa thành công';
  }

  /**
   * ✅ Lấy thông tin đơn giản của những danh mục cha (level = 0) chỉ bao gồm các danh mục active
   */
  async getSimpleParentCategories(): Promise<
    { id: string; name: string; slug: string }[]
  > {
    // Tìm các danh mục có level = 0 và isActive = true, chỉ lấy các trường cần thiết
    const parentCategories = await this.categoryModel
      .find({ level: 0, isActive: true })
      .select('_id name slug')
      .lean()
      .exec();

    return parentCategories.map((category) => ({
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
    }));
  }

  /**
   * ✅ Lấy thông tin đơn giản của tất cả danh mục con theo id của danh mục cha,
   * chỉ trả về các danh mục active và thông tin đơn giản (id, name, slug) theo cấp trực tiếp.
   */
  async getSubCategoriesByParentId(
    parentId: string,
  ): Promise<{ id: string; name: string; slug: string }[]> {
    // Chuyển đổi parentId sang ObjectId
    const parentObjectId = new Types.ObjectId(parentId);

    // Chạy 2 truy vấn song song: kiểm tra danh mục cha và lấy danh mục con
    const [parent, subCategories] = await Promise.all([
      this.categoryModel
        .findOne({ _id: parentObjectId, isActive: true })
        .lean()
        .exec(),
      this.categoryModel
        .find({ parentCategory: parentObjectId, isActive: true })
        .select('_id name slug')
        .lean()
        .exec(),
    ]);

    if (!parent) {
      throw new NotFoundException(
        'Danh mục cha không tồn tại hoặc không active!',
      );
    }

    return subCategories.map((subCategory) => ({
      id: subCategory._id.toString(),
      name: subCategory.name,
      slug: subCategory.slug,
    }));
  }

  async setFiltersForCategory(id: string, filters: Record<string, any>): Promise<Category> {
    const updated = await this.categoryModel.findByIdAndUpdate(
      id,
      { filterableAttributes: filters },
      { new: true }
    ).exec();
    if (!updated) throw new NotFoundException('Danh mục không tồn tại!');
    return updated;
  }

  async getFiltersByCategory(id: string): Promise<Record<string, any>> {
    const cat = await this.categoryModel.findById(id).exec();
    if (!cat) throw new NotFoundException('Danh mục không tồn tại!');
    return cat.filterableAttributes || {};
  }
  
}
