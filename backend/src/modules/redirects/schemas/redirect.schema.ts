import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RedirectDocument = Redirect & Document;

/**
 * Schema quản lý redirect URL
 * Dùng để xử lý các URL cũ sang URL mới (301 permanent redirect)
 */
@Schema({ timestamps: true })
export class Redirect {
  @Prop({ required: true, unique: true, trim: true, index: true })
  oldPath: string; // Đường dẫn cũ (không bao gồm domain, bắt đầu bằng /)

  @Prop({ required: true, trim: true })
  newPath: string; // Đường dẫn mới (không bao gồm domain, bắt đầu bằng /)

  @Prop({ default: true })
  isActive: boolean; // Trạng thái kích hoạt
  
  @Prop({ default: 301 })
  statusCode: number; // Mã redirect (301-Permanent, 302-Temporary)

  @Prop({ type: String, enum: ['product', 'category', 'post', 'page', 'other'], default: 'other' })
  type: string; // Loại redirect để phân loại

  @Prop({ default: 0 })
  hitCount: number; // Số lần được hit

  @Prop({ type: Date })
  lastAccessed: Date; // Lần cuối được truy cập
}

export const RedirectSchema = SchemaFactory.createForClass(Redirect);

// Tạo index để tối ưu tìm kiếm
RedirectSchema.index({ oldPath: 1 }, { unique: true });
RedirectSchema.index({ type: 1 });
RedirectSchema.index({ isActive: 1 }); 