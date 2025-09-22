import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { removeVietnameseTones } from '../utils/image.utils';

@Schema({ timestamps: true })
export class Image extends Document {
  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true, unique: true })
  imageUrl: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({
    default: function (this: Image) {
      return removeVietnameseTones(this.originalName);
    },
  })
  alt: string;

  @Prop({ default: '' })
  caption: string;

  @Prop({ default: '' })
  description: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);