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

// Middleware để tự động tạo slug từ name
FilterSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    let baseSlug = removeVietnameseTones(this.name);
    let slug = baseSlug;
    let count = 0;
    
    // Kiểm tra xem slug đã tồn tại chưa
    while (await (this.constructor as any).findOne({ slug, _id: { $ne: this._id } })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }
    
    this.slug = slug;
  }
  next();
});

// Middleware cho findOneAndUpdate
FilterSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate() as any;
  if (update.name) {
    let baseSlug = removeVietnameseTones(update.name);
    let slug = baseSlug;
    let count = 0;
    
    // Kiểm tra xem slug đã tồn tại chưa
    while (await (this.model as any).findOne({ 
      slug, 
      _id: { $ne: (this.getQuery() as any)._id } 
    })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }
    
    update.slug = slug;
  }
  next();
});
