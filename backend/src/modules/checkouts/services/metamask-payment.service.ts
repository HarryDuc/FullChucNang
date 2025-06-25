import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Checkout } from '../schemas/checkout.schema';
import { Order } from '../../orders/schemas/order.schema';
import { ethers } from 'ethers';

@Injectable()
export class MetamaskPaymentService {
  private readonly logger = new Logger(MetamaskPaymentService.name);
  private readonly USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // BSC USDT Contract
  private readonly USDT_DECIMALS = 18;

  constructor(
    @InjectModel(Checkout.name) private checkoutModel: Model<Checkout>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) { }

  /**
   * Xác nhận giao dịch MetaMask với USDT
   * @param slug slug của checkout
   * @param transactionHash hash của giao dịch
   * @param amount số tiền thanh toán (USDT)
   * @param walletAddress địa chỉ ví
   */
  async verifyTransaction(
    slug: string,
    transactionHash: string,
    amount: number,
    walletAddress: string,
    networkInfo?: {
      network?: string;
      chainId?: string | number;
      blockExplorer?: string;
    }
  ): Promise<Checkout> {
    try {
      // Tìm thông tin checkout
      const checkout = await this.checkoutModel.findOne({ slug }).exec();
      if (!checkout) {
        throw new NotFoundException(`Checkout với slug ${slug} không tồn tại`);
      }

      // Tìm thông tin đơn hàng
      const order = await this.orderModel.findById(checkout.orderId).exec();
      if (!order) {
        throw new NotFoundException(
          `Đơn hàng với ID ${checkout.orderId} không tồn tại`,
        );
      }

      // Kiểm tra số tiền - Lưu ý: amount ở đây là số USDT, không phải VND
      // Không so sánh trực tiếp với order.totalPrice (VND) mà chỉ lưu lại thông tin
      this.logger.log(
        `Xác minh thanh toán: Số USDT nhận được: ${amount}, Số tiền đơn hàng (VND): ${order.totalPrice}`,
      );

      // Lưu thông tin thanh toán, nhận tất cả giao dịch đã được xác nhận
      // Sau này có thể kiểm tra lại số tiền thực tế bằng các API tỷ giá
      checkout.paymentMethodInfo = {
        ...checkout.paymentMethodInfo,
        transactionHash,
        walletAddress,
        amountInUSDT: amount,
        amountInVND: order.totalPrice,
        verificationTime: new Date(),
        verified: true,
        currency: 'USDT',
        tokenAddress: this.USDT_CONTRACT_ADDRESS,
        tokenDecimals: this.USDT_DECIMALS,
        network: networkInfo?.network || 'BSC',
        chainId: networkInfo?.chainId,
        blockExplorer: networkInfo?.blockExplorer || 'https://bscscan.com/',
      };

      // Cập nhật trạng thái thanh toán
      checkout.paymentStatus = 'paid';

      // Cập nhật trạng thái đơn hàng
      order.status = 'processing'; // hoặc trạng thái phù hợp

      // Lưu thay đổi
      await Promise.all([checkout.save(), order.save()]);

      this.logger.log(
        `Xác minh thanh toán USDT thành công cho đơn hàng ${order._id}`,
      );
      return checkout;
    } catch (error) {
      this.logger.error(
        `Lỗi khi xác minh giao dịch USDT: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Tạo thông tin thanh toán USDT cho checkout
   * @param slug slug của checkout
   * @param receivingAddress địa chỉ nhận tiền (của shop)
   */
  async generatePaymentInfo(
    slug: string,
    receivingAddress: string,
  ): Promise<any> {
    try {
      // Tìm thông tin checkout
      const checkout = await this.checkoutModel.findOne({ slug }).exec();
      if (!checkout) {
        throw new NotFoundException(`Checkout với slug ${slug} không tồn tại`);
      }

      // Tìm thông tin đơn hàng
      const order = await this.orderModel.findById(checkout.orderId).exec();
      if (!order) {
        throw new NotFoundException(
          `Đơn hàng với ID ${checkout.orderId} không tồn tại`,
        );
      }

      // Cập nhật thông tin phương thức thanh toán
      checkout.paymentMethod = 'metamask';
      checkout.paymentMethodInfo = {
        ...checkout.paymentMethodInfo,
        receivingAddress: receivingAddress,
        amount: order.totalPrice,
        currency: 'USDT',
        tokenAddress: this.USDT_CONTRACT_ADDRESS,
        tokenDecimals: this.USDT_DECIMALS,
        network: 'BSC',
        generatedAt: new Date(),
      };

      await checkout.save();

      return {
        success: true,
        receivingAddress,
        amount: order.totalPrice,
        orderCode: checkout.orderCode,
        tokenAddress: this.USDT_CONTRACT_ADDRESS,
        tokenDecimals: this.USDT_DECIMALS,
      };
    } catch (error) {
      this.logger.error(
        `Lỗi khi tạo thông tin thanh toán USDT: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}