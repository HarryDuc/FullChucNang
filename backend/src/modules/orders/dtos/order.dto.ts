import {
  IsNotEmpty,
  IsMongoId,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO cho từng mặt hàng trong đơn hàng.
 * - product: Slug của sản phẩm (dạng string).
 * - quantity: Số lượng đặt mua của sản phẩm.
 * - price: Giá của sản phẩm được gửi từ frontend.
 * - variant: Biến thể của sản phẩm (nếu có).
 */
export class OrderItemDto {
  @IsNotEmpty()
  @IsMongoId({ message: 'product phải là ObjectId hợp lệ' })
  product: string; // Sử dụng slug của sản phẩm

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  variant?: string; // Thêm biến thể sản phẩm
}

/**
 * DTO để tạo mới đơn hàng.
 * - slug: Định danh duy nhất cho đơn hàng; nếu không truyền vào thì service sẽ tự tạo.
 * - orderItems: Danh sách các mặt hàng.
 * - totalPrice: Tổng giá trị đơn hàng (có thể tính sau).
 * - status: Trạng thái đơn hàng, mặc định là 'pending'.
 */
export class CreateOrderDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsOptional()
  @IsArray()
  @Type(() => OrderItemDto)
  orderItems?: OrderItemDto[];

  @IsOptional()
  @IsNumber()
  totalPrice?: number;

  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'cancelled'], {
    message: 'Trạng thái không hợp lệ',
  })
  status?: string;
}

/**
 * DTO để cập nhật đơn hàng.
 * - Tất cả các trường là tùy chọn, cho phép cập nhật một phần.
 */
export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsArray()
  @Type(() => OrderItemDto)
  orderItems?: OrderItemDto[];

  @IsOptional()
  @IsNumber()
  totalPrice?: number;

  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'cancelled'], {
    message: 'Trạng thái không hợp lệ',
  })
  status?: string;
}
