import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { removeVietnameseTones } from '../../../common/utils/slug.utils';

export type FilterDocument = Filter & Document;

@Schema({ _id: false })
export class RangeOption {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true, min: 0 })
  min: number;

  @Prop({ required: true, min: 0 })
  max: number;
}

@Schema({ timestamps: true })
export class Filter {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true, enum: ['select', 'checkbox', 'range', 'text', 'number'] })
  type: string;

  @Prop({ type: [String], default: [] })
  options: string[];

  @Prop({
    type: [{
      label: { type: String, required: true },
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 0 }
    }],
    default: []
  })
  rangeOptions: RangeOption[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }] })
  categories: Types.ObjectId[];
}

export const FilterSchema = SchemaFactory.createForClass(Filter);
