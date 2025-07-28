import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ProductDocument = Product & Document;

/**
 * Schema cho thuộc tính biến thể (ví dụ: Màu sắc, Kích thước)
 */
@Schema()
export class VariantAttribute {
  @Prop({ required: true })
  name: string; // Tên thuộc tính (VD: "Màu sắc", "Kích thước")

  @Prop({ required: true })
  slug: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Number, default: 0 })
  displayOrder?: number;

  @Prop([{
    value: { type: String, required: true }, // Giá trị cụ thể (VD: "Đỏ", "XL")
    slug: { type: String, required: true },
    additionalPrice: { type: Number, default: 0 }, // Giá tăng thêm cho giá trị này
    discountPrice: { type: Number }, // Giá giảm nếu có
    thumbnail: { type: String }, // Hình ảnh cho giá trị này nếu cần
    displayOrder: { type: Number, default: 0 }
  }])
  values: {
    value: string;
    slug: string;
    additionalPrice?: number;
    discountPrice?: number;
    thumbnail?: string;
    displayOrder?: number;
  }[];
}

/**
 * Schema cho biến thể sản phẩm cụ thể
 */
@Schema()
export class ProductVariant {
  @Prop({ required: true })
  variantName: string;

  @Prop({
    type: [{
      attributeName: { type: String, required: true },
      value: { type: String, required: true }
    }],
    _id: false,
    required: true
  })
  combination: { attributeName: string; value: string }[];

  @Prop()
  sku?: string;

  @Prop()
  variantImportPrice?: number;

  @Prop()
  variantCurrentPrice?: number;

  @Prop()
  variantDiscountPrice?: number;

  @Prop({ default: 0 })
  variantStock?: number;

  @Prop({ default: 0 })
  variantSold?: number;

  @Prop()
  variantThumbnail?: string;

  @Prop({ type: [String], default: [] })
  variantGalleries?: string[]
}

/**
 * Schema cho thông số kỹ thuật
 */
export const TechnicalSpecSchema = new MongooseSchema(
  {
    name: { type: String, required: true },
    value: { type: String, required: true }
  },
  { _id: false }
);

export class TechnicalSpec {
  name: string;
  value: string;
}

/**
 * Schema cho nhóm thông số kỹ thuật
 */
export const SpecificationGroupSchema = new MongooseSchema(
  {
    title: { type: String },
    specs: { type: [TechnicalSpecSchema], default: [] }
  },
  { _id: false }
);

export class SpecificationGroup {
  title: string;
  specs: TechnicalSpec[];
}

/**
 * Schema cho danh mục sản phẩm
 */
export const CategoryInfoSchema = {
  main: { type: String },
  sub: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  title: { type: String },
  key: { type: String },
  url: { type: String },
  mainCategoryId: { type: Types.ObjectId, ref: 'Category' }, // Store main category ID as ObjectId
  subCategoryIds: { type: [{ type: Types.ObjectId, ref: 'Category' }], default: [] }, // Store sub-category IDs
  name: { type: String },
  slug: { type: String }
};

/**
 * Schema chính cho sản phẩm
 */
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class Product {
  @Prop()
  id?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  sku?: string;

  @Prop({ type: String })
  shortDescription?: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Number, required: true })
  basePrice: number;

  @Prop({ type: Number })
  importPrice?: number;

  @Prop()
  currentPrice?: number;

  @Prop()
  discountPrice?: number;

  @Prop()
  thumbnail?: string;

  @Prop({ type: [String], default: [] })
  gallery?: string[];

  @Prop({ default: true })
  isVisible?: boolean;

  @Prop({ default: false })
  isFeatured?: boolean;

  @Prop({ default: false })
  isSpecification?: boolean;

  @Prop({
    type: {
      title: { type: String },
      groups: { type: [SpecificationGroupSchema], default: [] }
    },
    _id: false
  })
  specification?: {
    title: string;
    groups: SpecificationGroup[];
  };

  @Prop({ type: String, default: '' })
  specificationDescription?: string;

  @Prop({ default: '' })
  isSpecificationProduct?: string;

  @Prop({ default: false, description: 'Xác định sản phẩm có sử dụng biến thể hay không' })
  isNewArrival?: boolean;

  @Prop({ default: false })
  isBestSeller?: boolean;

  @Prop({ type: Number, default: 0 })
  stock: number; // Số lượng tồn kho của sản phẩm chính

  @Prop({ type: Number, default: 0 })
  sold: number; // Số lượng đã bán của sản phẩm chính

  @Prop({
    type: String,
    enum: ['draft', 'published', 'archived', 'outOfStock', 'comingSoon'],
    default: 'draft'
  })
  status: string;

  @Prop({
    type: Boolean,
    default: false,
    description: 'Xác định sản phẩm có sử dụng biến thể hay không'
  })
  hasVariants: boolean;

  @Prop({ type: CategoryInfoSchema })
  category?: {
    main: string;
    sub: string[];
    tags: string[];
    title?: string;
    key?: string;
    url?: string;
    id?: string;
    name?: string;
    slug?: string;
  };

  @Prop({ type: [VariantAttribute], default: [] })
  variantAttributes?: VariantAttribute[];

  @Prop({ type: [ProductVariant], default: [] })
  variants?: ProductVariant[];

  @Prop({ default: () => new Date() })
  createdAt?: Date;

  @Prop({ default: () => new Date() })
  publishedAt?: Date;


  @Prop({ type: Object, default: {} })
  filterAttributes?: Record<string, any>;

  // Virtual fields for reviews
  reviews?: any[];
  averageRating?: number;
  totalReviews?: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Middleware để tự động cập nhật trạng thái dựa trên stock
ProductSchema.pre('save', function (next) {
  // Nếu sản phẩm có biến thể
  if (this.hasVariants && this.variants && this.variants.length > 0) {
    // Tính tổng stock từ tất cả biến thể
    const totalStock = this.variants.reduce((sum, variant) => sum + (variant.variantStock || 0), 0);
    this.stock = totalStock;

    // Tính tổng số lượng đã bán từ tất cả biến thể
    const totalSold = this.variants.reduce((sum, variant) => sum + (variant.variantSold || 0), 0);
    this.sold = totalSold;
  }

  // Cập nhật trạng thái dựa trên stock
  if (this.stock <= 0) {
    this.status = 'outOfStock';
  } else if (this.status === 'outOfStock' && this.stock > 0) {
    this.status = 'published';
  }

  next();
});

// Tạo index cho các trường quan trọng
ProductSchema.index({ slug: 1 });
ProductSchema.index({ 'category.main': 1 });
ProductSchema.index({ 'variants.sku': 1 });
ProductSchema.index({ 'variantAttributes.slug': 1 });
ProductSchema.index({ 'variantAttributes.values.slug': 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ hasVariants: 1 });
// ProductSchema.index({ 'filterAttributes.key': 1 });
