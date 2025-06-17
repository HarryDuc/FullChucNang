import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from '../../products/schemas/product.schema';

/**
 * Schema cho từng mặt hàng trong đơn hàng (OrderItem).
 * - Tắt tạo _id cho từng subdocument bằng cách sử dụng { _id: false }.
 * - Lưu product slug, số lượng và giá (price) được gửi từ frontend.
 * - Lưu variant để quản lý biến thể sản phẩm cho việc giao hàng.
 */
@Schema({ _id: false })
export class OrderItem {
  // Tham chiếu đến sản phẩm thông qua ObjectId
  @Prop({ type: 'ObjectId', ref: Product.name, required: true })
  product: Types.ObjectId;

  // Số lượng sản phẩm đặt mua, mặc định là 1 nếu không có dữ liệu
  @Prop({ type: Number, required: true, default: 1 })
  quantity: number;

  // Giá của sản phẩm được gửi từ frontend
  @Prop({ type: Number, required: true })
  price: number;

  // Biến thể của sản phẩm (nếu có)
  @Prop({ type: String, required: false })
  variant?: string;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

/**
 * Schema cho đơn hàng (Order).
 * - Sử dụng trường slug làm định danh duy nhất cho đơn hàng.
 * - Lưu danh sách các mặt hàng trong mảng orderItems.
 * - totalPrice được tính dựa trên giá của sản phẩm (price) nhân với số lượng.
 * - status theo dõi trạng thái đơn hàng.
 */
@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({
    type: String,
    required: false, // Cho phép tự tạo slug ở service nếu không truyền vào
    unique: true,
    trim: true,
    index: true,
  })
  slug: string;

  // Mảng các mặt hàng được lưu theo OrderItemSchema
  @Prop({ type: [OrderItemSchema], default: [] })
  orderItems: OrderItem[];

  // Tổng giá của đơn hàng, được tính dựa trên price của sản phẩm nhân với số lượng
  @Prop({ type: Number, required: true, default: 0 })
  totalPrice: number;

  // Trạng thái đơn hàng
  @Prop({
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
