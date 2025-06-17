import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactListDocument = ContactList & Document;

@Schema({
  timestamps: true,
  collection: 'contact-list',
})
export class ContactList {

  @Prop({ type: String })
  logo: string;

  @Prop({ type: String })
  map: string;

  @Prop({ type: String })
  favicon: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  mst: string;

  @Prop({ type: String })
  date_start: string;

  @Prop({ type: String })
  company_name: string;

  @Prop({ type: String })
  youtube: string;

  @Prop({ type: String })
  facebook: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: String })
  website: string;

  @Prop({ type: String })
  zalo: string;

  @Prop({ type: String })
  whatsapp: string;

  @Prop({ type: String })
  hotline: string;

  @Prop({ type: String })
  twitter: string;

  @Prop({ type: String })
  telegram: string;

  @Prop({ type: String })
  instagram: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const ContactListSchema = SchemaFactory.createForClass(ContactList);