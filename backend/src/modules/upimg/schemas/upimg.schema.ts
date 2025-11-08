import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UpimgDocument = Upimg & Document;

@Schema({ timestamps: true })
export class Upimg {
  @Prop({ required: false, trim: true })
  title?: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Image', default: [] })
  images: Types.ObjectId[];

  @Prop({ type: String, enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: String, trim: true })
  slug?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const UpimgSchema = SchemaFactory.createForClass(Upimg);

// Indexes
UpimgSchema.index({ title: 1 });
UpimgSchema.index({ status: 1 });
UpimgSchema.index({ order: 1 });
UpimgSchema.index({ slug: 1 }, { unique: true, sparse: true }); 