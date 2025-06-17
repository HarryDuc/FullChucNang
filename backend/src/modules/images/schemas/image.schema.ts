import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { removeVietnameseTones } from '../utils/image.utils';

@Schema({ timestamps: true }) // ✅ Tự động thêm `createdAt`, `updatedAt`
export class Image extends Document {
  @Prop({ required: true })
  originalName: string; // ✅ Tên file gốc (giữ nguyên)

  @Prop({ required: true, unique: true })
  imageUrl: string; // ✅ Đường dẫn ảnh trên server

  @Prop({
    default: function (this: Image) {
      return `${process.env.SERVER_URL}${this.imageUrl}`; // ✅ `location` luôn chứa giá trị của `imageUrl`
    },
  })
  location: string;

  @Prop({ required: true, unique: true })
  slug: string; // ✅ Slug duy nhất để quản lý ảnh

  @Prop({
    default: function (this: Image) {
      return removeVietnameseTones(this.originalName); // ✅ Tạo alt tự động từ tên gốc
    },
  })
  alt: string; // ✅ Văn bản thay thế

  @Prop({ default: '' })
  caption: string; // ✅ Chú thích ảnh

  @Prop({ default: '' })
  description: string; // ✅ Mô tả ảnh
}

// ✅ Tạo schema Mongoose
export const ImageSchema = SchemaFactory.createForClass(Image);