import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type VoucherDocument = Voucher & Document;

export enum DiscountType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export enum PaymentMethod {
  BANK = 'BANK',
  COD = 'COD',
  ALL = 'ALL',
}

export enum VoucherType {
  GLOBAL = 'GLOBAL',
  PRODUCT_SPECIFIC = 'PRODUCT_SPECIFIC',
}

@Schema({ timestamps: true })
export class Voucher {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: VoucherType, required: true, default: VoucherType.GLOBAL })
  voucherType: VoucherType;

  @Prop({ type: [String], default: [] })
  productSlugs: string[];

  @Prop({ type: String })
  userId?: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ enum: PaymentMethod, default: PaymentMethod.ALL })
  paymentMethod: PaymentMethod;

  @Prop({ enum: DiscountType, required: true })
  discountType: DiscountType;

  @Prop({ required: true })
  discountValue: number;

  @Prop({ default: 0 })
  minimumAmount: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const VoucherSchema = SchemaFactory.createForClass(Voucher);