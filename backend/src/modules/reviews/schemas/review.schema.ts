import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true })
  productSlug: string;

  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  userEmail: string;

  @Prop()
  userAvatar?: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop({ type: [String], default: [] })
  attributes?: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isVerifiedPurchase: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Create indexes for frequently queried fields
ReviewSchema.index({ productSlug: 1, isActive: 1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ userId: 1, productSlug: 1 }, { unique: true }); // Ensure one review per user per product