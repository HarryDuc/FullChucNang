import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PaypalPaymentDocument = PaypalPayment & Document;

@Schema({ timestamps: true })
export class PaypalPayment {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  paypalOrderId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({
    type: String,
    enum: ['CREATED', 'SAVED', 'APPROVED', 'VOIDED', 'COMPLETED', 'PAYER_ACTION_REQUIRED', 'FAILED'],
    default: 'CREATED'
  })
  status: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  paypalResponse: any;

  @Prop({ type: Date })
  paymentDate: Date;

  @Prop({ type: String })
  payerId: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  payerDetails: any;

  @Prop({ type: String })
  failureReason: string;

  @Prop({ type: Boolean, default: false })
  isRefunded: boolean;

  @Prop({ type: Date })
  refundDate: Date;

  @Prop({ type: MongooseSchema.Types.Mixed })
  refundDetails: any;
}

export const PaypalPaymentSchema = SchemaFactory.createForClass(PaypalPayment);