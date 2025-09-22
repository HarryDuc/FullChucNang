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
import { PayosService } from '../../payos/payos.service';
import { OrderEmailService } from '../../orders/services/order-email.service';
import { Product } from '../../products/schemas/product.schema';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(Checkout.name) private checkoutModel: Model<Checkout>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly bankTransferService: BankTransferService,
    private readonly payosService: PayosService,
    private readonly orderEmailService: OrderEmailService,
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
  // NOTE: Return type is any because we return a plain object, not a Mongoose Document
  async create(dto: CreateCheckoutDto & { returnUrl?: string; cancelUrl?: string }): Promise<any> {
    try {
      console.log('Creating checkout with data:', JSON.stringify(dto, null, 2));

      // Kiểm tra các trường bắt buộc
      if (!dto.orderId || !dto.userId || !dto.name || !dto.phone || !dto.address || !dto.email) {
        console.error('Missing required fields in checkout creation:', dto);
        throw new BadRequestException('Thiếu thông tin bắt buộc cho đơn thanh toán');
      }

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
      let payosPaymentLink: string | undefined = undefined;
      let payosOrderCode: number | undefined = undefined;
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
      } else if (dto.paymentMethod === 'payos') {
        payosOrderCode = Date.now() % 9000000000000000;
        // description không quá 25 ký tự
        const description = `TT DH ${payosOrderCode}`;
        try {
          const payosRes = await this.payosService.createPaymentLink({
            orderCode: payosOrderCode,
            amount,
            description,
            returnUrl: dto.returnUrl || `${process.env.FRONTEND_URL}/return`,
            cancelUrl: dto.cancelUrl || `${process.env.FRONTEND_URL}/cancel`,
            buyerName: dto.name,
            buyerEmail: dto.email,
            buyerPhone: dto.phone,
            buyerAddress: dto.address,
          });
          paymentMethodInfo = payosRes;
          payosPaymentLink = payosRes?.payosPaymentLink;
        } catch (error) {
          console.error('Error creating PayOS payment link:', error);
          throw new BadRequestException('Không thể tạo link thanh toán PayOS. Vui lòng thử lại sau.');
        }
      }

      // ✅ Tạo _id trước để dùng cho slug
      const tempId = new this.checkoutModel()._id;
      const slug = dto.slug || this.generateSlug(dto.name, tempId.toString());

      console.log('Generated slug for checkout:', slug);

      let created;
      if (dto.paymentMethod === 'payos') {
        created = await this.checkoutModel.create({
          _id: tempId,
          ...dto,
          slug,
          paymentMethod: dto.paymentMethod || 'cash',
          paymentStatus: dto.paymentStatus || 'pending',
          orderCode: payosOrderCode, // Lưu đúng orderCode số cho PayOS
          paymentMethodInfo,
        });
      } else {
        created = await this.checkoutModel.create({
          _id: tempId,
          ...dto,
          slug,
          paymentMethod: dto.paymentMethod || 'cash',
          paymentStatus: dto.paymentStatus || 'pending',
          orderCode: dto.orderCode || order.slug,
          paymentMethodInfo,
        });
      }

      console.log('Checkout created successfully:', created._id);

      // Gửi email xác nhận đơn hàng sau khi tạo checkout
      try {
        // Lấy thông tin đơn hàng với sản phẩm
        const order = await this.orderModel
          .findById(dto.orderId)
          .populate('orderItems.product')
          .exec();

        if (order) {
          // Lấy danh sách sản phẩm
          const products = order.orderItems.map(item => item.product as unknown as Product);

          // Gửi email xác nhận đơn hàng
          await this.orderEmailService.sendOrderConfirmationEmail(
            order,
            created,
            products,
            true, // sendToUser
            true  // sendToAdmin
          );
          console.log('✅ Order confirmation email sent successfully');
        }
      } catch (emailError) {
        console.error('❌ Error sending order confirmation email:', emailError);
        // Không throw error để không ảnh hưởng đến flow tạo checkout
      }

      // Always return a plain object with optional payosPaymentLink
      const createdObj = created.toObject();
      return payosPaymentLink ? { ...createdObj, payosPaymentLink } : createdObj;
    } catch (error) {
      console.error('Error in checkout creation:', error);

      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      // Xử lý lỗi Mongoose validation
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map((err: any) => err.message);
        console.error('Validation errors:', validationErrors);
        throw new BadRequestException(`Lỗi xác thực dữ liệu: ${validationErrors.join(', ')}`);
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

    const previousStatus = found.paymentStatus;
    found.paymentStatus = status;
    await found.save();

    // Gửi email thông báo thanh toán thành công nếu status chuyển sang paid
    if (status === 'paid' && previousStatus !== 'paid') {
      try {
        await this.sendPaymentSuccessEmail(found.orderId.toString(), found._id.toString(), true, true);
        console.log('✅ Payment success email sent successfully');
      } catch (emailError) {
        console.error('❌ Error sending payment success email:', emailError);
        // Không throw error để không ảnh hưởng đến flow cập nhật
      }
    }

    return found;
  }

  // Thêm hàm cập nhật trạng thái thanh toán cho checkout theo orderCode
  async updateCheckoutPaymentStatusByOrderCode(orderCode: string, status: 'pending' | 'paid' | 'failed', paymentMethodInfo?: any) {
    const checkout = await this.checkoutModel.findOne({ orderCode })
    if (checkout) {
      const previousStatus = checkout.paymentStatus;

      // Nếu có paymentMethodInfo từ webhook, lấy status thực tế từ đó
      if (paymentMethodInfo && paymentMethodInfo.data && paymentMethodInfo.data.status) {
        if (paymentMethodInfo.data.status === 'PAID') {
          checkout.paymentStatus = 'paid'
        } else if (paymentMethodInfo.data.status === 'FAILED') {
          checkout.paymentStatus = 'failed'
        } else {
          checkout.paymentStatus = 'pending'
        }
        checkout.paymentMethodInfo = paymentMethodInfo
      } else {
        checkout.paymentStatus = status
      }

      await checkout.save()

      // Gửi email thông báo thanh toán thành công nếu status chuyển từ pending/failed sang paid
      if (checkout.paymentStatus === 'paid' && previousStatus !== 'paid') {
        await this.sendPaymentSuccessEmail(checkout.orderId.toString(), checkout._id.toString(), true, true);
      }

      return checkout
    }
    return null
  }

  /**
   * Gửi email thông báo thanh toán thành công
   * @param orderId - ID của đơn hàng
   * @param checkoutId - ID của checkout
   * @param sendToUser - Có gửi cho user không (mặc định true)
   * @param sendToAdmin - Có gửi cho admin không (mặc định true)
   */
  async sendPaymentSuccessEmail(
    orderId: string,
    checkoutId: string,
    sendToUser: boolean = true,
    sendToAdmin: boolean = true,
  ): Promise<void> {
    try {
      // Lấy thông tin đơn hàng với sản phẩm
      const order = await this.orderModel
        .findById(orderId)
        .populate('orderItems.product')
        .exec();

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }

      // Lấy thông tin checkout
      const checkout = await this.checkoutModel.findById(checkoutId).exec();
      if (!checkout) {
        throw new NotFoundException('Không tìm thấy thông tin thanh toán');
      }

      // Lấy danh sách sản phẩm
      const products = order.orderItems.map(item => item.product as unknown as Product);

      // Gửi email thông báo thanh toán thành công
      await this.orderEmailService.sendPaymentSuccessEmail(order, checkout, products, sendToUser, sendToAdmin);
    } catch (error) {
      console.error('Error sending payment success email:', error);
      // Không throw error để không ảnh hưởng đến flow thanh toán
    }
  }

  // ❌ Xoá đơn
  async remove(slug: string): Promise<{ message: string }> {
    const deleted = await this.checkoutModel.findOneAndDelete({ slug }).exec();
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy đơn để xoá');
    }
    return { message: 'Đơn đã được xoá' };
  }

  async findByUserId(userId: string): Promise<Checkout[]> {
    return this.checkoutModel.find({ userId }).exec();
  }
}
