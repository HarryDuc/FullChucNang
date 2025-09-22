import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { OrderEmailService } from '../services/order-email.service';
import { EmailConfig } from '../schemas/email-config.schema';

/**
 * Controller để quản lý cấu hình email
 * Chỉ dành cho admin
 */
@Controller('ordersapi/admin/email-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class EmailConfigController {
  constructor(private readonly orderEmailService: OrderEmailService) { }

  /**
   * Lấy cấu hình email hiện tại
   * GET /ordersapi/email-config
   */
  @Get()
  async getEmailConfiguration(): Promise<EmailConfig> {
    return this.orderEmailService.getEmailConfiguration();
  }

  /**
   * Cập nhật cấu hình email
   * PUT /ordersapi/email-config
   */
  @Put()
  async updateEmailConfiguration(
    @Body() configData: Partial<EmailConfig>,
  ): Promise<EmailConfig> {
    return this.orderEmailService.updateEmailConfiguration(configData);
  }

  /**
   * Bật/tắt toàn bộ hệ thống email
   * POST /ordersapi/email-config/toggle-system
   */
  @Post('toggle-system')
  async toggleEmailSystem(
    @Body() body: { enabled: boolean },
  ): Promise<EmailConfig> {
    return this.orderEmailService.toggleEmailSystem(body.enabled);
  }

  /**
   * Bật/tắt email cho user
   * POST /ordersapi/email-config/toggle-user
   */
  @Post('toggle-user')
  async toggleUserEmails(
    @Body() body: {
      orderConfirmation: boolean;
      paymentSuccess: boolean;
    },
  ): Promise<EmailConfig> {
    return this.orderEmailService.toggleUserEmails(
      body.orderConfirmation,
      body.paymentSuccess,
    );
  }

  /**
   * Bật/tắt email cho admin
   * POST /ordersapi/email-config/toggle-admin
   */
  @Post('toggle-admin')
  async toggleAdminEmails(
    @Body() body: {
      orderNotification: boolean;
      paymentSuccess: boolean;
    },
  ): Promise<EmailConfig> {
    return this.orderEmailService.toggleAdminEmails(
      body.orderNotification,
      body.paymentSuccess,
    );
  }

  /**
   * Thêm email admin
   * POST /ordersapi/email-config/admin-emails
   */
  @Post('admin-emails')
  async addAdminEmail(
    @Body() body: { email: string },
  ): Promise<EmailConfig> {
    return this.orderEmailService.addAdminEmail(body.email);
  }

  /**
   * Xóa email admin
   * DELETE /ordersapi/email-config/admin-emails/:email
   */
  @Post('admin-emails/remove')
  async removeAdminEmail(
    @Body() body: { email: string },
  ): Promise<EmailConfig> {
    return this.orderEmailService.removeAdminEmail(body.email);
  }

  /**
   * Test gửi email (chỉ dành cho testing)
   * POST /ordersapi/email-config/test
   */
  @Post('test')
  async testEmail(
    @Body() body: {
      orderId: string;
      checkoutId: string;
      type: 'confirmation' | 'payment-success';
      sendToUser?: boolean;
      sendToAdmin?: boolean;
    },
  ) {
    const { orderId, checkoutId, type, sendToUser = true, sendToAdmin = true } = body;

    if (type === 'confirmation') {
      await this.orderEmailService.testOrderConfirmationEmail(orderId, checkoutId, sendToUser, sendToAdmin);
    } else {
      await this.orderEmailService.testPaymentSuccessEmail(orderId, checkoutId, sendToUser, sendToAdmin);
    }

    return { message: 'Email test đã được gửi thành công' };
  }
}