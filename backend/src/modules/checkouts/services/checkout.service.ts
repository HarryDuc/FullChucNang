import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Checkout } from '../schemas/checkout.schema';
import { Order } from '../../orders/schemas/order.schema';
import { CreateCheckoutDto } from '../dtos/checkout.dto';
import { removeVietnameseTones } from '../../../common/utils/slug.utils';
import { BankTransferService } from './bank-transfer.service';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(Checkout.name) private checkoutModel: Model<Checkout>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly bankTransferService: BankTransferService,
  ) { }

  // 📌 Tạo slug từ name + 6 ký tự cuối của _id
  private generateSlug(name: string, id: string): string {
    const base = removeVietnameseTones(name)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const suffix = id.slice(-6);
    return `${base}-${suffix}`;
  }

  // 🛒 Tạo thanh toán mới
  async create(dto: CreateCheckoutDto): Promise<Checkout> {
    try {
      // ✅ Truy vấn đơn hàng để lấy slug và totalPrice
      const order = await this.orderModel
        .findById(dto.orderId)
        .select('slug totalPrice')
        .lean();

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng để liên kết');
      }

      const amount = order.totalPrice || 0;

      // ⚙️ Nếu là thanh toán chuyển khoản, sinh mã QR và lưu vào paymentMethodInfo
      let paymentMethodInfo = {};
      if (dto.paymentMethod === 'bank') {
        try {
          paymentMethodInfo = await this.bankTransferService.generateTransferInfo(
            order.slug,
            amount,
          );
        } catch (error) {
          console.error('Error generating QR code:', error);
          throw new BadRequestException('Không thể tạo mã QR. Vui lòng thử lại sau.');
        }
      }

      // ✅ Tạo _id trước để dùng cho slug
      const tempId = new this.checkoutModel()._id;
      const slug = this.generateSlug(dto.name, tempId.toString());

      // ✅ Tạo đơn thanh toán với slug đã chuẩn bị
      const created = await this.checkoutModel.create({
        _id: tempId, // gán _id thủ công
        ...dto,
        slug, // ✅ bắt buộc truyền slug ngay lúc create
        paymentMethod: dto.paymentMethod || 'cash',
        paymentStatus: 'pending',
        orderCode: order.slug,
        paymentMethodInfo,
      });

      return created;
    } catch (error) {
      console.error('Error in checkout creation:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể tạo đơn thanh toán. Vui lòng thử lại sau.');
    }
  }

  // 📋 Lấy danh sách
  async findAll(): Promise<Checkout[]> {
    return this.checkoutModel.find().exec();
  }

  // 🔍 Lấy theo slug
  async findOne(slug: string): Promise<Checkout> {
    const found = await this.checkoutModel.findOne({ slug }).exec();
    if (!found) throw new NotFoundException('Đơn không tồn tại');
    return found;
  }

  // 🔄 Cập nhật đơn
  async update(
    slug: string,
    updateData: Partial<CreateCheckoutDto>,
  ): Promise<Checkout> {
    const found = await this.checkoutModel.findOne({ slug }).exec();
    if (!found) throw new NotFoundException('Không tìm thấy đơn');

    // ❌ Không cho phép cập nhật orderId và orderCode
    delete updateData.orderId;

    // ⚠️ Nếu người dùng gửi slug → cập nhật lại cho đúng format và kiểm tra trùng
    if (updateData.slug) {
      const newSlug = this.generateSlug(
        updateData.name || found.name,
        found._id.toString(),
      );

      const existing = await this.checkoutModel
        .findOne({ slug: newSlug })
        .exec();
      if (existing && !existing._id.equals(found._id)) {
        throw new BadRequestException(
          'Slug đã tồn tại. Vui lòng chọn slug khác.',
        );
      }

      updateData.slug = newSlug;
    }

    Object.assign(found, updateData);
    return found.save();
  }

  // ✅ Cập nhật trạng thái thanh toán
  async updatePaymentStatus(
    slug: string,
    status: 'pending' | 'paid' | 'failed',
  ): Promise<Checkout> {
    if (!['pending', 'paid', 'failed'].includes(status)) {
      throw new BadRequestException('Trạng thái không hợp lệ');
    }

    const found = await this.checkoutModel.findOne({ slug }).exec();
    if (!found) throw new NotFoundException('Không tìm thấy đơn');

    found.paymentStatus = status;
    return found.save();
  }

  // ❌ Xoá đơn
  async remove(slug: string): Promise<{ message: string }> {
    const deleted = await this.checkoutModel.findOneAndDelete({ slug }).exec();
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy đơn để xoá');
    }
    return { message: 'Đơn đã được xoá' };
  }
}
