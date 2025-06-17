import { IsString, IsOptional, IsNumber, IsEnum, IsDate, Min, Max, IsBoolean, ValidateIf, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType, PaymentMethod, VoucherType } from '../schemas/voucher.schema';

export class CreateVoucherDto {
  @IsString()
  code: string;

  @IsString()
  description: string;

  @IsEnum(VoucherType)
  voucherType: VoucherType;

  @ValidateIf(o => o.voucherType === VoucherType.PRODUCT_SPECIFIC)
  @IsArray()
  @IsString({ each: true })
  productSlugs: string[];

  @IsString()
  @IsOptional()
  userId?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber()
  @Min(0)
  @Max(100, { message: 'Percentage discount cannot exceed 100%' })
  discountValue: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minimumAmount?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}