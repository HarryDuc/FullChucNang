import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VietQRConfigDocument = VietQRConfig & Document;

@Schema({ timestamps: true })
export class VietQRConfig {
  _id: Types.ObjectId;

  @Prop({ required: true })
  bankBin: string;

  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
  accountName: string;

  @Prop({ required: true })
  template: string;

  @Prop({ default: false })
  active: boolean;
}

export const VietQRConfigSchema = SchemaFactory.createForClass(VietQRConfig);