import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
  variantGalleries?: string[];
}

/**
 * Schema cho thông số kỹ thuật
 */
@Schema()
export class TechnicalSpec {
  @Prop()
  name: string;

  @Prop()
  value: string;
}

@Schema()
export class SpecificationGroup {
  @Prop()
  title: string;

  @Prop([TechnicalSpec])
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
  id: { type: String },
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
  isNewArrival?: boolean;

  @Prop({ default: false })
  isBestSeller?: boolean;

  @Prop({
    type: String,
    enum: ['draft', 'published', 'archived', 'outOfStock', 'comingSoon'],
    default: 'draft'
  })
  status?: string;

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
  variantAttributes: VariantAttribute[];

  @Prop({ type: [ProductVariant], default: [] })
  variants: ProductVariant[];

  @Prop({ default: () => new Date() })
  createdAt?: Date;

  @Prop({ default: () => new Date() })
  publishedAt?: Date;

  // Virtual fields for reviews
  reviews?: any[];
  averageRating?: number;
  totalReviews?: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Tạo index cho các trường quan trọng
ProductSchema.index({ slug: 1 });
ProductSchema.index({ 'category.main': 1 });
ProductSchema.index({ 'variants.sku': 1 });
ProductSchema.index({ 'variantAttributes.slug': 1 });
ProductSchema.index({ 'variantAttributes.values.slug': 1 });
