export enum VoucherType {
  GLOBAL = 'GLOBAL',
  PRODUCT_SPECIFIC = 'PRODUCT_SPECIFIC',
}

export enum PaymentMethod {
  ALL = 'ALL',
  BANK = 'BANK',
  COD = 'COD',
}

export enum DiscountType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export interface Voucher {
  _id: string;
  code: string;
  description: string;
  voucherType: VoucherType;
  productSlugs: string[];
  quantity: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  paymentMethod: PaymentMethod;
  discountType: DiscountType;
  discountValue: number;
  minimumAmount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVoucherDto {
  code: string;
  description: string;
  voucherType: VoucherType;
  productSlugs: string[];
  quantity: number;
  startDate: Date;
  endDate: Date;
  paymentMethod: PaymentMethod;
  discountType: DiscountType;
  discountValue: number;
  minimumAmount?: number;
  isActive: boolean;
}

export interface UpdateVoucherDto extends Partial<CreateVoucherDto> { }

export interface VoucherResponse {
  data: Voucher[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}