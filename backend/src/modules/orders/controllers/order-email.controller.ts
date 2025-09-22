import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { OrderService } from '../services/order.service';

/**
 * Controller để test và quản lý email đơn hàng
 * Chỉ dành cho admin hoặc testing
 */
@Controller('ordersapi/email')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') // Chỉ admin mới có thể gửi email thủ công
export class OrderEmailController {
  constructor(private readonly orderService: OrderService) { }

  /**
   * Gửi email xác nhận đơn hàng
   * POST /ordersapi/email/send-confirmation
   */
  @Post('send-confirmation')
  async sendOrderConfirmationEmail(
    @Body() body: {
      orderId: string;
      checkoutId: string;
      sendToUser?: boolean;
      sendToAdmin?: boolean;
    },
  ) {
    const { orderId, checkoutId, sendToUser = true, sendToAdmin = true } = body;
    await this.orderService.sendOrderConfirmationEmail(
      orderId,
      checkoutId,
      sendToUser,
      sendToAdmin,
    );
    return { message: 'Email xác nhận đơn hàng đã được gửi' };
  }

  /**
   * Gửi email thông báo thanh toán thành công
   * POST /ordersapi/email/send-payment-success
   */
  @Post('send-payment-success')
  async sendPaymentSuccessEmail(
    @Body() body: {
      orderId: string;
      checkoutId: string;
      sendToUser?: boolean;
      sendToAdmin?: boolean;
    },
  ) {
    const { orderId, checkoutId, sendToUser = true, sendToAdmin = true } = body;
    await this.orderService.sendPaymentSuccessEmail(
      orderId,
      checkoutId,
      sendToUser,
      sendToAdmin,
    );
    return { message: 'Email thông báo thanh toán thành công đã được gửi' };
  }
}