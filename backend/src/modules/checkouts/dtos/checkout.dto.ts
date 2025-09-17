import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  Matches,
  IsMongoId,
  IsEmail,
} from 'class-validator';

/**
 * 🎯 DTO: CreateCheckoutDto
 *
 * Dữ liệu đầu vào khi tạo mới đơn thanh toán.
 * Gồm thông tin người nhận + tham chiếu đơn hàng gốc.
 */
export class CreateCheckoutDto {
  // 🧑 Tên người nhận hàng
  @IsNotEmpty()
  @IsString()
  name: string;

  // ☎️ Số điện thoại (10-11 số)
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'Phone must be a valid number (10-11 digits)',
  })
  phone: string;

  // 📍 Địa chỉ giao hàng
  @IsNotEmpty()
  @IsString()
  address: string;

  // 📧 Email
  @IsNotEmpty()
  @IsEmail()
  email: string;

  // 🆔 ID đơn hàng gốc (ObjectId)
  @IsNotEmpty()
  @IsMongoId()
  orderId: string;

  // 💳 Phương thức thanh toán
  @IsOptional()
  @IsString()
  @IsIn(['cash', 'payos', 'bank', 'paypal', 'metamask']) // mở rộng thêm sau
  paymentMethod?: string;

  // 🧾 Trạng thái thanh toán
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'paid', 'failed'])
  paymentStatus?: string;

  // 🔗 Slug truy cập (tự tạo ở service)
  @IsOptional()
  @IsString()
  slug?: string;

  // Đường dẫn trả về sau thanh toán (PayOS)
  @IsOptional()
  @IsString()
  returnUrl?: string;

  // Đường dẫn hủy thanh toán (PayOS)
  @IsOptional()
  @IsString()
  cancelUrl?: string;

  // 👤 ID người dùng
  @IsNotEmpty()
  @IsString()
  userId: string;

  // 📝 Mã đơn hàng
  @IsNotEmpty()
  @IsString()
  orderCode: string;
}
