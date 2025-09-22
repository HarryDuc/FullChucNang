import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Schema cho cấu hình email
 * - Lưu cài đặt bật/tắt email cho user và admin
 * - Cấu hình địa chỉ email admin
 * - Cấu hình URL admin dashboard
 */
@Schema({ timestamps: true })
export class EmailConfig extends Document {
  // Có gửi email cho user khi tạo đơn hàng không
  @Prop({ type: Boolean, default: true })
  sendUserOrderConfirmation: boolean;

  // Có gửi email cho user khi thanh toán thành công không
  @Prop({ type: Boolean, default: true })
  sendUserPaymentSuccess: boolean;

  // Có gửi email cho admin khi có đơn hàng mới không
  @Prop({ type: Boolean, default: true })
  sendAdminOrderNotification: boolean;

  // Có gửi email cho admin khi thanh toán thành công không
  @Prop({ type: Boolean, default: true })
  sendAdminPaymentSuccess: boolean;

  // Danh sách email admin để nhận thông báo
  @Prop({ type: [String], default: [] })
  adminEmails: string[];

  // URL trang quản trị admin
  @Prop({ type: String, default: `${process.env.FRONTEND_URL}/admin` })
  adminDashboardUrl: string;

  // URL trang chi tiết đơn hàng admin
  @Prop({ type: String, default: `${process.env.FRONTEND_URL}/admin/orders` })
  adminOrdersUrl: string;

  // Email mặc định cho admin (fallback)
  @Prop({ type: String, default: 'admin@gmail.com' })
  defaultAdminEmail: string;

  // Có bật tất cả email không (master switch)
  @Prop({ type: Boolean, default: true })
  emailEnabled: boolean;
}

export const EmailConfigSchema = SchemaFactory.createForClass(EmailConfig);