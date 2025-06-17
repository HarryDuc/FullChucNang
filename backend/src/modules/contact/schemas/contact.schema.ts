import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactDocument = Contact & Document;

@Schema({ timestamps: true })
export class Contact {

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  sendNotificationToAdmin: boolean;

  @Prop({ default: false })
  sendConfirmationToCustomer: boolean;

  @Prop()
  customerEmail?: string;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
