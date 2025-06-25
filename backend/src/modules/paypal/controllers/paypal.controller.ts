import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaypalPaymentService } from '../services/paypal.service';
import { CreatePaypalOrderDto } from '../dtos';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('paypalsapi')
export class PaypalController {
  constructor(private readonly paypalService: PaypalPaymentService) { }

  @Post('create-order')
  @Public()
  async createOrder(@Body() createOrderDto: CreatePaypalOrderDto) {
    console.log('Creating PayPal order:', createOrderDto);
    try {
      const result = await this.paypalService.initiateOrder(createOrderDto);
      return result;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  }

  @Get('order/:orderId')
  @Roles('user')
  async getOrderDetails(@Param('orderId') orderId: string) {
    return this.paypalService.getOrderDetails(orderId);
  }

  @Post('order/:orderId/capture')
  @Public()
  async capturePayment(
    @Param('orderId') orderId: string,
    @Body() paymentSource: any,
  ) {
    console.log('Capturing PayPal payment for order:', orderId);
    try {
      const result = await this.paypalService.capturePaymentForOrder(orderId, paymentSource);
      return result;
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      throw error;
    }
  }

  @Post('order/:orderId/authorize')
  @Roles('user')
  async authorizePayment(
    @Param('orderId') orderId: string,
    @Body() paymentSource: any,
  ) {
    return this.paypalService.authorizePaymentForOrder(orderId, paymentSource);
  }

  @Post('webhooks')
  @Public()
  async handleWebhook(@Body() webhookData: any) {
    console.log('Received PayPal webhook:', webhookData);
    // TODO: Implement webhook handling
    // This endpoint should be public and verify PayPal webhook signature
    return { received: true };
  }
}