import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type WalletDocument = Wallet & Document;

@Schema({ timestamps: true })
export class Wallet {
  @Prop({ required: true, unique: true, index: true })
  address: string;

  @Prop({ ref: 'User', type: MongooseSchema.Types.ObjectId })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ default: '' })
  nonce: string;

  @Prop({ default: false })
  isPrimary: boolean;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);