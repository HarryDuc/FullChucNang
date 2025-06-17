import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Entity danh mục bài viết – phân cấp theo materialized path.
 */
@Schema({ timestamps: true, versionKey: false })
export class CategoryPost {
  @Prop({
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    index: true,
  })
  slug: string;

  @Prop({
    default: 0,
    min: 0,
  })
  level: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'CategoryPost',
    default: null,
    index: true,
  })
  parent: Types.ObjectId | null;

  @Prop({
    type: [Types.ObjectId],
    ref: 'CategoryPost',
    default: [],
    validate: {
      validator: (arr: Types.ObjectId[]) =>
        Array.isArray(arr) && new Set(arr.map(String)).size === arr.length,
      message:
        'Danh sách con (children) phải là mảng các ObjectId không trùng lặp.',
    },
  })
  children: Types.ObjectId[];

  @Prop({
    default: '',
    trim: true,
    maxlength: 1000,
    index: true,
  })
  path: string;

  @Prop({
    default: false,
    index: true,
  })
  isDeleted: boolean;

  @Prop({
    default: 0,
    type: Number,
    index: true,
    description:
      'Thứ tự hiển thị trong danh sách. Số nhỏ hơn sẽ được hiển thị trước.',
  })
  sortOrder: number;
}

/**
 * Document chuẩn hóa cho CategoryPost (có _id kiểu ObjectId + timestamps rõ ràng).
 */
export type CategoryPostDocument = CategoryPost &
  Document & {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };

/**
 * Schema Mongoose được sinh ra từ class và tối ưu với index tùy chỉnh.
 */
export const CategoryPostSchema = SchemaFactory.createForClass(CategoryPost);

/**
 * Các chỉ mục phục vụ truy vấn phổ biến và phân cấp.
 */
CategoryPostSchema.index(
  { slug: 1, isDeleted: 1 },
  { name: 'idx_slug_isDeleted' },
);
CategoryPostSchema.index(
  { parent: 1, isDeleted: 1 },
  { name: 'idx_parent_isDeleted' },
);
CategoryPostSchema.index(
  { level: 1, isDeleted: 1 },
  { name: 'idx_level_isDeleted' },
);
CategoryPostSchema.index(
  { name: 1, isDeleted: 1 },
  { name: 'idx_name_isDeleted' },
);
CategoryPostSchema.index(
  { path: 1, isDeleted: 1 },
  { name: 'idx_path_isDeleted' },
);
CategoryPostSchema.index(
  { createdAt: -1, isDeleted: 1 },
  { name: 'idx_createdAt_isDeleted' },
);
CategoryPostSchema.index(
  { path: 1, level: 1, createdAt: -1 },
  { name: 'idx_path_level_createdAt' },
);
CategoryPostSchema.index({ isDeleted: 1 }, { name: 'idx_isDeleted' });
CategoryPostSchema.index(
  { sortOrder: 1, isDeleted: 1 },
  { name: 'idx_sortOrder_isDeleted' },
);
