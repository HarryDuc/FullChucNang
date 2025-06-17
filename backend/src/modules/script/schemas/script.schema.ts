import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ScriptPosition } from '../dto/script.dto';

export type ScriptDocument = Script & Document;

@Schema({ timestamps: true })
export class Script {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, enum: ScriptPosition })
  position: ScriptPosition;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ScriptSchema = SchemaFactory.createForClass(Script);