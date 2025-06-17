import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Voucher, VoucherDocument, VoucherType } from '../schemas/voucher.schema';
import { CreateVoucherDto } from '../dtos/create-voucher.dto';

export interface CheckVoucherParams {
  productSlug?: string;
  userId?: string;
  paymentMethod?: string;
  totalAmount?: number;
}

export interface CheckVoucherResponse {
  valid: boolean;
  voucher?: Voucher;
  message?: string;
  discountAmount?: number;
  finalPrice?: number;
}

@Injectable()
export class VoucherService {
  constructor(
    @InjectModel(Voucher.name) private voucherModel: Model<VoucherDocument>,
  ) { }

  private normalizePaymentMethod(paymentMethod?: string): string | undefined {
    if (!paymentMethod) return undefined;

    const methodMap: { [key: string]: string } = {
      'cod': 'COD',
      'cash': 'COD',
      'COD': 'COD',
      'bankTransfer': 'BANK',
      'bankTranfer': 'BANK',
      'banktranfer': 'BANK',
      'bank': 'BANK',
      'BANK': 'BANK',
      'all': 'ALL',
      'ALL': 'ALL'
    };

    return methodMap[paymentMethod.toLowerCase()] || paymentMethod.toUpperCase();
  }

  async create(createVoucherDto: CreateVoucherDto): Promise<Voucher> {
    const existingVoucher = await this.voucherModel.findOne({ code: createVoucherDto.code });
    if (existingVoucher) {
      throw new BadRequestException('Voucher code already exists');
    }

    // Validate product-specific voucher
    if (createVoucherDto.voucherType === VoucherType.PRODUCT_SPECIFIC) {
      if (!createVoucherDto.productSlugs || createVoucherDto.productSlugs.length === 0) {
        throw new BadRequestException('At least one product slug is required for product-specific vouchers');
      }
    }

    // Clear productSlugs for global vouchers
    if (createVoucherDto.voucherType === VoucherType.GLOBAL) {
      createVoucherDto.productSlugs = [];
    }

    const voucher = new this.voucherModel(createVoucherDto);
    return voucher.save();
  }

  async findAll(
    page = 1,
    limit = 10,
    isActive?: boolean,
    voucherType?: VoucherType,
  ): Promise<{ data: Voucher[]; total: number; page: number; totalPages: number }> {
    const query: any = {};
    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }
    if (voucherType) {
      query.voucherType = voucherType;
    }

    const total = await this.voucherModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const data = await this.voucherModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
      page,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Voucher> {
    const voucher = await this.voucherModel.findById(id);
    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }
    return voucher;
  }

  async findByCode(code: string): Promise<Voucher> {
    const voucher = await this.voucherModel.findOne({ code });
    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }
    return voucher;
  }

  async findValidVouchers(
    productSlug?: string,
    userId?: string,
    paymentMethod?: string,
  ): Promise<Voucher[]> {
    const now = new Date();
    const query: any = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      usedCount: { $lt: { $ref: 'quantity' } },
    };

    // Handle product-specific and global vouchers
    if (productSlug) {
      query.$or = [
        { voucherType: VoucherType.GLOBAL },
        {
          voucherType: VoucherType.PRODUCT_SPECIFIC,
          productSlugs: productSlug
        },
      ];
    } else {
      query.voucherType = VoucherType.GLOBAL;
    }

    if (userId) {
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { userId },
            { userId: { $exists: false } },
          ],
        },
      ];
    }

    if (paymentMethod) {
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { paymentMethod },
            { paymentMethod: 'ALL' },
          ],
        },
      ];
    }

    return this.voucherModel.find(query);
  }

  async useVoucher(code: string, productSlug?: string): Promise<Voucher> {
    const voucher = await this.voucherModel.findOne({ code });
    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    if (!voucher.isActive) {
      throw new BadRequestException('Voucher is inactive');
    }

    if (voucher.usedCount >= voucher.quantity) {
      throw new BadRequestException('Voucher has reached its usage limit');
    }

    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      throw new BadRequestException('Voucher is not valid at this time');
    }

    // Validate product-specific voucher usage
    if (voucher.voucherType === VoucherType.PRODUCT_SPECIFIC) {
      if (!productSlug) {
        throw new BadRequestException('Product slug is required for using this voucher');
      }
      if (!voucher.productSlugs.includes(productSlug)) {
        throw new BadRequestException('This voucher is not valid for the specified product');
      }
    }

    voucher.usedCount += 1;
    return voucher.save();
  }

  async update(id: string, updateData: Partial<CreateVoucherDto>): Promise<Voucher> {
    const voucher = await this.voucherModel.findById(id);
    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    if (updateData.code && updateData.code !== voucher.code) {
      const existingVoucher = await this.voucherModel.findOne({ code: updateData.code });
      if (existingVoucher) {
        throw new BadRequestException('Voucher code already exists');
      }
    }

    // Validate product-specific voucher update
    if (updateData.voucherType === VoucherType.PRODUCT_SPECIFIC) {
      if (!updateData.productSlugs || updateData.productSlugs.length === 0) {
        throw new BadRequestException('At least one product slug is required for product-specific vouchers');
      }
    }

    // Clear productSlugs when changing to global voucher
    if (updateData.voucherType === VoucherType.GLOBAL) {
      updateData.productSlugs = [];
    }

    Object.assign(voucher, updateData);
    return voucher.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.voucherModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Voucher not found');
    }
  }

  async checkVoucherValidity(
    code: string,
    params: CheckVoucherParams
  ): Promise<CheckVoucherResponse> {
    try {
      const voucher = await this.voucherModel.findOne({ code });
      if (!voucher) {
        return {
          valid: false,
          message: 'Voucher not found'
        };
      }

      if (!voucher.isActive) {
        return {
          valid: false,
          message: 'Voucher is inactive'
        };
      }

      if (voucher.usedCount >= voucher.quantity) {
        return {
          valid: false,
          message: 'Voucher has reached its usage limit'
        };
      }

      const now = new Date();
      if (now < voucher.startDate || now > voucher.endDate) {
        return {
          valid: false,
          message: 'Voucher is not valid at this time'
        };
      }

      // Validate product-specific voucher
      if (voucher.voucherType === VoucherType.PRODUCT_SPECIFIC) {
        if (!params.productSlug) {
          return {
            valid: false,
            message: 'Product slug is required for this voucher'
          };
        }
        if (!voucher.productSlugs.includes(params.productSlug)) {
          return {
            valid: false,
            message: 'This voucher is not valid for the specified product'
          };
        }
      }

      // Validate minimum amount requirement
      if (voucher.minimumAmount > 0 && (!params.totalAmount || params.totalAmount < voucher.minimumAmount)) {
        return {
          valid: false,
          message: `Voucher requires a minimum purchase amount of ${voucher.minimumAmount.toLocaleString('vi-VN')} VND`
        };
      }

      // Normalize the payment method before validation
      const normalizedPaymentMethod = this.normalizePaymentMethod(params.paymentMethod);
      console.log('Original payment method:', params.paymentMethod);
      console.log('Normalized payment method:', normalizedPaymentMethod);
      console.log('Voucher payment method:', voucher.paymentMethod);

      // Validate payment method if specified
      if (voucher.paymentMethod !== 'ALL' && normalizedPaymentMethod && voucher.paymentMethod !== normalizedPaymentMethod) {
        return {
          valid: false,
          message: `Voucher không hợp lệ với phương thức thanh toán đã chọn (${normalizedPaymentMethod}). Voucher này chỉ áp dụng cho: ${voucher.paymentMethod}`
        };
      }

      // Calculate discount
      let discountAmount = 0;
      if (params.totalAmount) {
        if (voucher.discountType === 'PERCENTAGE') {
          discountAmount = (params.totalAmount * voucher.discountValue) / 100;
        } else {
          discountAmount = voucher.discountValue;
        }
        // Ensure discount doesn't exceed the total amount
        discountAmount = Math.min(discountAmount, params.totalAmount);
      }

      return {
        valid: true,
        voucher,
        discountAmount,
        finalPrice: params.totalAmount ? params.totalAmount - discountAmount : undefined
      };
    } catch (error) {
      console.error('Error validating voucher:', error);
      return {
        valid: false,
        message: 'Error validating voucher'
      };
    }
  }
}