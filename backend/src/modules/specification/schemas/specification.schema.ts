import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SpecificationDocument = Specification & Document;

/**
 * Schema cho thông số kỹ thuật
 */
export class TechnicalSpec {
  @Prop({ required: true })
  name: string;

  @Prop()
  value?: string;
}

/**
 * Schema cho nhóm thông số kỹ thuật
 */
export class SpecificationGroup {
  @Prop({ required: true })
  title: string;

  @Prop({ type: () => [TechnicalSpec], default: [] })
  specs: TechnicalSpec[];
}

/**
 * Schema chính cho template thông số kỹ thuật
 */
@Schema({
  timestamps: true,
})
export class Specification {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: () => [SpecificationGroup], default: [] })
  groups: SpecificationGroup[];

  @Prop({ default: false })
  isSpecification?: boolean;
  
  @Prop({ default: '' })
  isSpecificationProduct?: string;

  @Prop({ type: [String], default: [] })
  categories: string[]; // Danh sách category ID mà template này áp dụng được

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;
}

export const SpecificationSchema = SchemaFactory.createForClass(Specification);

// Tạo index
SpecificationSchema.index({ slug: 1 });
SpecificationSchema.index({ categories: 1 });
SpecificationSchema.index({ isActive: 1 });
SpecificationSchema.index({ displayOrder: 1 }); 