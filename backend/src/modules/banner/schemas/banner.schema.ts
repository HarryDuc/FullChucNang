import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true })
export class Banner {
  @Prop({ required: true })
  imagePath: string;

  @Prop({ required: true, enum: ['main', 'sub', 'mobile'] })
  type: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  order: number;

  @Prop()
  link?: string;

  @Prop()
  title?: string;

  @Prop()
  description?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);