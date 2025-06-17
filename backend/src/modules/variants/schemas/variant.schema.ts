import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Schema VariantType - Loại biến thể
 * ===============================================================
 * Ví dụ:
 * - Phân loại (Pro đen, Pro xám,...)
 * - Số lượng pin (1 pin, 2 pin,...)
 * - Kích thước (nhỏ, vừa, lớn,...)
 * - Màu sắc (đỏ, xanh, vàng,...)
 */
@Schema({ timestamps: true })
export class VariantType extends Document {
  @Prop({ required: true, trim: true })
  name: string; // Tên loại biến thể (ví dụ: "Phân loại", "Số lượng pin")

  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ type: String, trim: true })
  description?: string;
}

export const VariantTypeSchema = SchemaFactory.createForClass(VariantType);

/**
 * Schema Variant - Giá trị của biến thể
 * ===============================================================
 * Mỗi variant có thể có giá và số lượng riêng
 * Ví dụ:
 * - Pro đen (1 camera): +500k, còn 50 cái
 * - 2 pin: +200k, còn 100 cái
 */
@Schema({ timestamps: true })
export class Variant extends Document {
  @Prop({ required: true, trim: true })
  name: string; // Tên giá trị biến thể (ví dụ: "Pro đen (1 camera)", "1 pin")

  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ required: true, ref: 'VariantType' })
  variantType: string; // Reference đến VariantType

  @Prop({ type: Number, default: 0 })
  additionalPrice?: number; // Giá tăng thêm khi chọn variant này

  @Prop({ type: Number })
  discountPrice?: number; // Giá giảm nếu có

  @Prop({ type: Number, default: 0 })
  stock?: number; // Số lượng tồn kho của variant này

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop()
  displayOrder?: number; // Thứ tự hiển thị

  @Prop()
  thumbnail?: string; // Hình ảnh đại diện nếu cần
}

export const VariantSchema = SchemaFactory.createForClass(Variant);

// Tạo index
VariantSchema.index({ slug: 1 });
VariantSchema.index({ variantType: 1 });
VariantTypeSchema.index({ slug: 1 });
