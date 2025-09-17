import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Query,
  Get,
} from '@nestjs/common';
import { PayosService } from './payos.service';
import { OrderService } from '../orders/services/order.service';
import { CheckoutService } from '../checkouts/services/checkout.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('payos')
export class PayosController {
  constructor(
    private readonly payosService: PayosService,
    private readonly orderService: OrderService,
    private readonly checkoutService: CheckoutService,
  ) {}

  @Post('webhook')
  @Public()
  async handleWebhook(@Body() payload: any) {
    console.log('--- PAYOS WEBHOOK RECEIVED ---');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    const { data, signature } = payload;
    const isValid = this.payosService.verifyPayosSignature(data, signature);
    if (!isValid) {
      console.error('Invalid signature for webhook:', signature);
      throw new HttpException('Invalid signature', HttpStatus.FORBIDDEN);
    }
    if (data.code === '00' && data.orderCode) {
      console.log(
        'Webhook orderCode:',
        data.orderCode,
        'status:',
        data.status || data?.data?.status,
      );
      // Cập nhật đơn hàng trong DB theo orderCode số
      await this.orderService.updatePaymentStatusByOrderCode(data.orderCode, {
        paymentMethod: 'payos',
        paymentInfo: data,
      });
      // Cập nhật trạng thái checkout
      const result =
        await this.checkoutService.updateCheckoutPaymentStatusByOrderCode(
          data.orderCode,
          'paid', // default, sẽ lấy thực tế từ paymentMethodInfo nếu có
          data, // truyền toàn bộ paymentMethodInfo (data từ webhook)
        );
      if (!result) {
        console.error(
          'Không tìm thấy checkout để cập nhật với orderCode:',
          data.orderCode,
        );
      } else {
        console.log(
          'Đã cập nhật trạng thái checkout thành công cho orderCode:',
          data.orderCode,
        );
      }
    } else {
      console.error('Webhook thiếu code hoặc orderCode:', data);
    }
    return { status: 'ok' };
  }

  @Get('check-payment-status')
  async checkPaymentStatus(@Query('orderCode') orderCode: string) {
    // Tìm checkout theo orderCode
    const checkout = await this.payosService.findByOrderCode(Number(orderCode));
    if (!checkout) return { status: 'not_found' };
    return { status: checkout.paymentStatus };
  }
}
