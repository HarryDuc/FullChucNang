import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Discount {
  /** 📌 Mã giảm giá */
  @Prop({ required: true, unique: true, trim: true })
  code: string;

  /** 📌 Phần trăm giảm giá (0 - 100%) */
  @Prop({ required: true, min: 0, max: 100 })
  percentage: number;

  /** 📌 Ngày hết hạn của mã giảm giá */
  @Prop({ required: true, index: true })
  expiresAt: Date;

  /** 📌 Áp dụng tự động */
  @Prop({ default: false })
  autoApply: boolean;

  /** 📌 Điều kiện áp dụng mã giảm giá */
  @Prop({
    type: {
      minOrderValue: { type: Number, default: 0, min: 0 },
      applicableCategories: { type: [String], default: [] },
      maxUsage: { type: Number, default: null, min: 0 },
      maxDiscountAmount: { type: Number, default: null, min: 0 },
    },
  })
  conditions?: {
    minOrderValue?: number;
    applicableCategories?: string[];
    maxUsage?: number | null;
    maxDiscountAmount?: number | null;
  };
}

/** 📌 Tạo schema Mongoose */
export type DiscountDocument = Discount & Document;
export const DiscountSchema = SchemaFactory.createForClass(Discount);

/** 📌 Đánh index để tối ưu truy vấn */
DiscountSchema.index({ code: 1 }, { unique: true });
DiscountSchema.index({ expiresAt: 1 });
