import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument, Model } from 'mongoose';
import { removeVietnameseTones } from 'src/common/utils/slug.utils';

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true }) // ❌ Bỏ `unique: true` để tránh duplicate index
  slug: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parentCategory?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }], default: [] })
  subCategories: Types.ObjectId[];

  @Prop({ type: String, trim: true, default: '' })
  description?: string;

  @Prop({ type: Object, default: {} })
  filterableAttributes?: Record<string, any>;

  @Prop({ default: 0 })
  level: number;

  @Prop({ default: true })
  isActive: boolean;
}

export type CategoryDocument = HydratedDocument<Category>;
export type CategoryModel = Model<CategoryDocument>;
export const CategorySchema = SchemaFactory.createForClass(Category);

/** ✅ Middleware: Tạo slug duy nhất trước khi lưu */
CategorySchema.pre<CategoryDocument>('save', async function (next) {
  if (!this.slug) {
    const baseSlug = removeVietnameseTones(this.name);
    let uniqueSlug = baseSlug;
    let count = 1;

    while (
      await (this.constructor as CategoryModel).findOne({ slug: uniqueSlug })
    ) {
      uniqueSlug = `${baseSlug}-${count}`;
      count++;
    }
    this.slug = uniqueSlug;
  }

  if (this.parentCategory) {
    const parent = await (this.constructor as CategoryModel).findById(
      this.parentCategory,
    );
    this.level = parent ? parent.level + 1 : 0;
  } else {
    this.level = 0;
  }

  next();
});

/** ✅ Middleware: Cập nhật `slug` nếu `name` thay đổi */
CategorySchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as Partial<Category>;
  if (update?.name) {
    const baseSlug = removeVietnameseTones(update.name);
    let uniqueSlug = baseSlug;
    let count = 1;

    while (await (this.model as CategoryModel).findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${count}`;
      count++;
    }

    update.slug = uniqueSlug;
    this.setUpdate(update);
  }

  next();
});

/** ✅ Middleware: Xóa danh mục con khỏi danh mục cha khi bị xóa */
CategorySchema.pre('findOneAndDelete', async function (next) {
  const filter = this.getFilter() as { _id?: Types.ObjectId };
  if (filter._id) {
    const category = await (this.model as CategoryModel).findById(filter._id);

    if (category?.parentCategory) {
      await (this.model as CategoryModel).findByIdAndUpdate(
        category.parentCategory,
        {
          $pull: { subCategories: category._id },
        },
      );
    }

    await (this.model as CategoryModel).updateMany(
      { parentCategory: filter._id },
      { $set: { parentCategory: null, level: 0 } },
    );
  }
  next();
});

/** 📌 Tạo Index tối ưu */
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ level: 1 });
