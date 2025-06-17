import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

/**
 * 🧾 Schema: Checkout
 *
 * Đại diện cho một đơn thanh toán.
 * Hỗ trợ nhiều phương thức: cash, payos, momo, vietqr...
 * Có thể lưu thông tin chi tiết trong `paymentMethodInfo`.
 * Gắn với đơn hàng qua `orderId` (ref: Order)
 */
@Schema({ timestamps: true })
export class Checkout extends Document {
  _id: Types.ObjectId;

  // 🆔 Tham chiếu tới đơn hàng gốc (Order)
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  // 📧 Email
  @Prop({ type: String, required: true, trim: true })
  email: string;

  // 🔢 Mã đơn hàng thân thiện để hiển thị (slug của Order)
  @Prop({ type: String, required: true, trim: true })
  orderCode: string;

  // 🔗 Slug để truy cập thân thiện
  @Prop({ type: String, required: true, unique: true, index: true })
  slug: string;

  // 🧑 Thông tin người đặt hàng
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, trim: true })
  phone: string;

  @Prop({ type: String, required: true, trim: true })
  address: string;

  // 💰 Phương thức thanh toán
  @Prop({
    type: String,
    default: 'cash',
    enum: ['cash', 'payos', 'bank'], // mở rộng thêm sau
  })
  paymentMethod: string;

  // 📌 Trạng thái thanh toán
  @Prop({
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  })
  paymentStatus: string;

  // 📦 Thông tin chi tiết theo phương thức thanh toán
  @Prop({ type: SchemaTypes.Mixed, default: {} })
  paymentMethodInfo: Record<string, any>;

  // 🕒 Thời gian tạo
  @Prop()
  createdAt: Date;

  // 🕒 Thời gian cập nhật gần nhất
  @Prop()
  updatedAt: Date;
}

export const CheckoutSchema = SchemaFactory.createForClass(Checkout);
