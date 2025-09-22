import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { Order } from '../schemas/order.schema';
import { Checkout } from '../../checkouts/schemas/checkout.schema';
import { Product } from '../../products/schemas/product.schema';
import { EmailConfig } from '../schemas/email-config.schema';

/**
 * Service xử lý gửi email cho đơn hàng
 * - Gửi email xác nhận khi đơn hàng được tạo
 * - Gửi email thông báo khi thanh toán thành công
 */
@Injectable()
export class OrderEmailService {
  private readonly logger = new Logger(OrderEmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    @InjectModel(EmailConfig.name) private emailConfigModel: Model<EmailConfig>,
  ) { }

  /**
   * Lấy cấu hình email hiện tại
   * @returns Cấu hình email
   */
  private async getEmailConfig(): Promise<EmailConfig> {
    let config = await this.emailConfigModel.findOne().exec();
    if (!config) {
      // Tạo cấu hình mặc định nếu chưa có
      config = new this.emailConfigModel({
        sendUserOrderConfirmation: true,
        sendUserPaymentSuccess: true,
        sendAdminOrderNotification: true,
        sendAdminPaymentSuccess: true,
        adminEmails: [process.env.ADMIN_EMAIL],
        adminDashboardUrl: process.env.FRONTEND_URL + '/admin',
        adminOrdersUrl: process.env.FRONTEND_URL + '/admin/orders',
        defaultAdminEmail: process.env.ADMIN_EMAIL,
        emailEnabled: true,
      });
      await config.save();
    }
    return config;
  }

  /**
   * Gửi email xác nhận đơn hàng khi đơn hàng được tạo
   * @param order - Thông tin đơn hàng
   * @param checkout - Thông tin thanh toán
   * @param products - Danh sách sản phẩm trong đơn hàng
   * @param sendToUser - Có gửi cho user không (mặc định true)
   * @param sendToAdmin - Có gửi cho admin không (mặc định true)
   */
  async sendOrderConfirmationEmail(
    order: Order,
    checkout: Checkout,
    products: Product[],
    sendToUser: boolean = true,
    sendToAdmin: boolean = true,
  ): Promise<void> {
    try {
      const config = await this.getEmailConfig();

      // Kiểm tra xem email có được bật không
      if (!config.emailEnabled) {
        this.logger.log('📧 Email is disabled globally, skipping order confirmation email');
        return;
      }

      this.logger.log(`📧 Sending order confirmation email for order: ${order.slug}`);

      // Chuẩn bị dữ liệu cho template
      const orderData = {
        orderCode: order.slug,
        customerName: checkout.name,
        customerEmail: checkout.email,
        customerPhone: checkout.phone,
        customerAddress: checkout.address,
        orderDate: (order as any).createdAt?.toLocaleDateString('vi-VN'),
        orderTime: (order as any).createdAt?.toLocaleTimeString('vi-VN'),
        subtotalPrice: order.subtotalPrice?.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }),
        discountAmount: order.discountAmount?.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }),
        totalPrice: order.totalPrice?.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }),
        paymentMethod: this.getPaymentMethodText(checkout.paymentMethod),
        paymentStatus: this.getPaymentStatusText(checkout.paymentStatus),
        orderItems: order.orderItems.map((item, index) => {
          // Kiểm tra item.product có tồn tại không
          if (!item.product) {
            return {
              index: index + 1,
              productName: 'Sản phẩm không xác định',
              variant: item.variant || '',
              quantity: item.quantity || 1,
              price: '0 ₫',
              total: '0 ₫',
            };
          }

          const product = products.find(p => (p as any)._id?.toString() === item.product.toString());
          return {
            index: index + 1,
            productName: product?.name || 'Sản phẩm không xác định',
            variant: item.variant || '',
            quantity: item.quantity || 1,
            price: (item.price || 0).toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }),
            total: ((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }),
          };
        }),
        voucherCode: order.voucherCode || 'Không có',
        hasDiscount: order.discountAmount > 0,
      };

      // Gửi email cho user nếu được bật
      if (sendToUser && config.sendUserOrderConfirmation) {
        await this.mailerService.sendMail({
          to: checkout.email,
          subject: `Xác nhận đơn hàng #${order.slug}`,
          template: './order-confirmation',
          context: orderData,
        });
        this.logger.log(`✅ Order confirmation email sent successfully to user: ${checkout.email}`);
      }

      // Gửi email cho admin nếu được bật
      if (sendToAdmin && config.sendAdminOrderNotification) {
        const adminData = {
          ...orderData,
          orderStatus: order.status,
          adminOrderUrl: `${config.adminOrdersUrl}/${order.slug}`,
          adminOrdersUrl: config.adminOrdersUrl,
          adminDashboardUrl: config.adminDashboardUrl,
          paymentMethodInfo: checkout.paymentMethodInfo ? JSON.stringify(checkout.paymentMethodInfo) : '',
        };

        // Gửi email cho tất cả admin
        const adminEmails = config.adminEmails.length > 0 ? config.adminEmails : [config.defaultAdminEmail];
        for (const adminEmail of adminEmails) {
          await this.mailerService.sendMail({
            to: adminEmail,
            subject: `🚨 Đơn hàng mới #${order.slug} - ${checkout.name} - ${orderData.totalPrice}`,
            template: './admin-order-notification',
            context: adminData,
          });
          this.logger.log(`✅ Admin notification email sent successfully to: ${adminEmail}`);
        }
      }
    } catch (error) {
      this.logger.error(`❌ Error sending order confirmation email:`, error);
      throw error;
    }
  }

  /**
   * Gửi email thông báo thanh toán thành công
   * @param order - Thông tin đơn hàng
   * @param checkout - Thông tin thanh toán
   * @param products - Danh sách sản phẩm trong đơn hàng
   * @param sendToUser - Có gửi cho user không (mặc định true)
   * @param sendToAdmin - Có gửi cho admin không (mặc định true)
   */
  async sendPaymentSuccessEmail(
    order: Order,
    checkout: Checkout,
    products: Product[],
    sendToUser: boolean = true,
    sendToAdmin: boolean = true,
  ): Promise<void> {
    try {
      const config = await this.getEmailConfig();

      // Kiểm tra xem email có được bật không
      if (!config.emailEnabled) {
        this.logger.log('📧 Email is disabled globally, skipping payment success email');
        return;
      }

      this.logger.log(`📧 Sending payment success email for order: ${order.slug}`);

      // Chuẩn bị dữ liệu cho template
      const paymentData = {
        orderCode: order.slug,
        customerName: checkout.name,
        customerEmail: checkout.email,
        customerPhone: checkout.phone,
        customerAddress: checkout.address,
        paymentDate: new Date().toLocaleDateString('vi-VN'),
        paymentTime: new Date().toLocaleTimeString('vi-VN'),
        totalPrice: order.totalPrice?.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }),
        paymentMethod: this.getPaymentMethodText(checkout.paymentMethod),
        orderItems: order.orderItems.map((item, index) => {
          // Kiểm tra item.product có tồn tại không
          if (!item.product) {
            return {
              index: index + 1,
              productName: 'Sản phẩm không xác định',
              variant: item.variant || '',
              quantity: item.quantity || 1,
              price: '0 ₫',
              total: '0 ₫',
            };
          }

          const product = products.find(p => (p as any)._id?.toString() === item.product.toString());
          return {
            index: index + 1,
            productName: product?.name || 'Sản phẩm không xác định',
            variant: item.variant || '',
            quantity: item.quantity || 1,
            price: (item.price || 0).toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }),
            total: ((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }),
          };
        }),
        nextSteps: this.getNextStepsText(checkout.paymentMethod),
      };

      // Gửi email cho user nếu được bật
      if (sendToUser && config.sendUserPaymentSuccess) {
        await this.mailerService.sendMail({
          to: checkout.email,
          subject: `Thanh toán thành công đơn hàng #${order.slug}`,
          template: './payment-success',
          context: paymentData,
        });
        this.logger.log(`✅ Payment success email sent successfully to user: ${checkout.email}`);
      }

      // Gửi email cho admin nếu được bật
      if (sendToAdmin && config.sendAdminPaymentSuccess) {
        const adminData = {
          ...paymentData,
          orderStatus: order.status,
          adminOrderUrl: `${config.adminOrdersUrl}/${order.slug}`,
          adminOrdersUrl: config.adminOrdersUrl,
          adminDashboardUrl: config.adminDashboardUrl,
        };

        // Gửi email cho tất cả admin
        const adminEmails = config.adminEmails.length > 0 ? config.adminEmails : [config.defaultAdminEmail];
        for (const adminEmail of adminEmails) {
          await this.mailerService.sendMail({
            to: adminEmail,
            subject: `💰 Thanh toán thành công #${order.slug} - ${checkout.name} - ${paymentData.totalPrice}`,
            template: './admin-payment-success',
            context: adminData,
          });
          this.logger.log(`✅ Admin payment success email sent successfully to: ${adminEmail}`);
        }
      }
    } catch (error) {
      this.logger.error(`❌ Error sending payment success email:`, error);
      throw error;
    }
  }

  /**
   * Chuyển đổi phương thức thanh toán thành text tiếng Việt
   */
  private getPaymentMethodText(paymentMethod: string): string {
    const methods = {
      cash: 'Thanh toán khi nhận hàng',
      payos: 'Thanh toán qua PayOS',
      bank: 'Chuyển khoản ngân hàng',
      paypal: 'Thanh toán qua PayPal',
      metamask: 'Thanh toán qua MetaMask',
    };
    return methods[paymentMethod] || 'Phương thức thanh toán khác';
  }

  /**
   * Chuyển đổi trạng thái thanh toán thành text tiếng Việt
   */
  private getPaymentStatusText(paymentStatus: string): string {
    const statuses = {
      pending: 'Chờ thanh toán',
      paid: 'Đã thanh toán',
      failed: 'Thanh toán thất bại',
    };
    return statuses[paymentStatus] || 'Không xác định';
  }

  /**
   * Lấy hướng dẫn bước tiếp theo dựa trên phương thức thanh toán
   */
  private getNextStepsText(paymentMethod: string): string[] {
    const steps = {
      cash: [
        'Chúng tôi sẽ liên hệ với bạn để xác nhận đơn hàng',
        'Đơn hàng sẽ được chuẩn bị và giao trong 2-3 ngày làm việc',
        'Bạn sẽ thanh toán khi nhận hàng',
      ],
      payos: [
        'Thanh toán đã được xác nhận thành công',
        'Đơn hàng đang được chuẩn bị và sẽ giao trong 2-3 ngày làm việc',
        'Chúng tôi sẽ gửi thông tin vận chuyển qua SMS/Email',
      ],
      bank: [
        'Chúng tôi đang xác minh giao dịch chuyển khoản',
        'Sau khi xác minh, đơn hàng sẽ được chuẩn bị và giao trong 2-3 ngày làm việc',
        'Bạn sẽ nhận được thông tin vận chuyển qua SMS/Email',
      ],
      paypal: [
        'Thanh toán qua PayPal đã được xác nhận',
        'Đơn hàng đang được chuẩn bị và sẽ giao trong 2-3 ngày làm việc',
        'Chúng tôi sẽ gửi thông tin vận chuyển qua SMS/Email',
      ],
      metamask: [
        'Thanh toán qua MetaMask đã được xác nhận',
        'Đơn hàng đang được chuẩn bị và sẽ giao trong 2-3 ngày làm việc',
        'Chúng tôi sẽ gửi thông tin vận chuyển qua SMS/Email',
      ],
    };
    return steps[paymentMethod] || [
      'Đơn hàng đang được xử lý',
      'Chúng tôi sẽ liên hệ với bạn sớm nhất',
    ];
  }

  /**
   * Lấy cấu hình email hiện tại (public method)
   */
  async getEmailConfiguration(): Promise<EmailConfig> {
    return this.getEmailConfig();
  }

  /**
   * Cập nhật cấu hình email
   * @param configData - Dữ liệu cấu hình mới
   */
  async updateEmailConfiguration(configData: Partial<EmailConfig>): Promise<EmailConfig> {
    const config = await this.getEmailConfig();
    Object.assign(config, configData);
    await config.save();
    this.logger.log('📧 Email configuration updated successfully');
    return config;
  }

  /**
   * Bật/tắt email toàn bộ hệ thống
   * @param enabled - Bật hay tắt
   */
  async toggleEmailSystem(enabled: boolean): Promise<EmailConfig> {
    return this.updateEmailConfiguration({ emailEnabled: enabled });
  }

  /**
   * Bật/tắt email cho user
   * @param orderConfirmation - Bật/tắt email xác nhận đơn hàng
   * @param paymentSuccess - Bật/tắt email thanh toán thành công
   */
  async toggleUserEmails(orderConfirmation: boolean, paymentSuccess: boolean): Promise<EmailConfig> {
    return this.updateEmailConfiguration({
      sendUserOrderConfirmation: orderConfirmation,
      sendUserPaymentSuccess: paymentSuccess,
    });
  }

  /**
   * Bật/tắt email cho admin
   * @param orderNotification - Bật/tắt thông báo đơn hàng mới
   * @param paymentSuccess - Bật/tắt thông báo thanh toán thành công
   */
  async toggleAdminEmails(orderNotification: boolean, paymentSuccess: boolean): Promise<EmailConfig> {
    return this.updateEmailConfiguration({
      sendAdminOrderNotification: orderNotification,
      sendAdminPaymentSuccess: paymentSuccess,
    });
  }

  /**
   * Thêm email admin mới
   * @param email - Email admin mới
   */
  async addAdminEmail(email: string): Promise<EmailConfig> {
    const config = await this.getEmailConfig();
    if (!config.adminEmails.includes(email)) {
      config.adminEmails.push(email);
      await config.save();
      this.logger.log(`📧 Admin email added: ${email}`);
    }
    return config;
  }

  /**
   * Xóa email admin
   * @param email - Email admin cần xóa
   */
  async removeAdminEmail(email: string): Promise<EmailConfig> {
    const config = await this.getEmailConfig();
    config.adminEmails = config.adminEmails.filter(e => e !== email);
    await config.save();
    this.logger.log(`📧 Admin email removed: ${email}`);
    return config;
  }

  /**
   * Test gửi email xác nhận đơn hàng
   * @param orderId - ID đơn hàng
   * @param checkoutId - ID checkout
   * @param sendToUser - Gửi cho user
   * @param sendToAdmin - Gửi cho admin
   */
  async testOrderConfirmationEmail(
    orderId: string,
    checkoutId: string,
    sendToUser: boolean = true,
    sendToAdmin: boolean = true,
  ): Promise<void> {
    try {
      // Tạo dữ liệu test
      const testOrder = {
        _id: orderId || '507f1f77bcf86cd799439011', // ObjectId hợp lệ mặc định
        slug: `TEST-${Date.now()}`,
        orderItems: [
          {
            product: 'test-product-id',
            price: 100000,
            quantity: 1,
            totalPrice: 100000,
            variant: 'Test variant',
          },
        ],
        totalPrice: 100000,
        status: 'pending',
        createdAt: new Date(),
      } as any;

      const testCheckout = {
        _id: checkoutId || '507f1f77bcf86cd799439012', // ObjectId hợp lệ mặc định
        name: 'Khách hàng test',
        email: 'test@example.com',
        phone: '0123456789',
        address: 'Địa chỉ test',
        paymentStatus: 'pending',
        paymentMethodInfo: { method: 'test' },
      } as any;

      const testProducts = [
        {
          _id: 'test-product-id',
          name: 'Sản phẩm test',
          price: 100000,
        },
      ] as any[];

      // Gửi email test
      await this.sendOrderConfirmationEmail(testOrder, testCheckout, testProducts, sendToUser, sendToAdmin);

      this.logger.log(`✅ Test order confirmation email sent successfully`);
    } catch (error) {
      this.logger.error(`❌ Error sending test order confirmation email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test gửi email thanh toán thành công
   * @param orderId - ID đơn hàng
   * @param checkoutId - ID checkout
   * @param sendToUser - Gửi cho user
   * @param sendToAdmin - Gửi cho admin
   */
  async testPaymentSuccessEmail(
    orderId: string,
    checkoutId: string,
    sendToUser: boolean = true,
    sendToAdmin: boolean = true,
  ): Promise<void> {
    try {
      // Tạo dữ liệu test
      const testOrder = {
        _id: orderId || '507f1f77bcf86cd799439011', // ObjectId hợp lệ mặc định
        slug: `TEST-${Date.now()}`,
        orderItems: [
          {
            product: 'test-product-id',
            price: 100000,
            quantity: 1,
            totalPrice: 100000,
            variant: 'Test variant',
          },
        ],
        totalPrice: 100000,
        status: 'confirmed',
        createdAt: new Date(),
      } as any;

      const testCheckout = {
        _id: checkoutId || '507f1f77bcf86cd799439012', // ObjectId hợp lệ mặc định
        name: 'Khách hàng test',
        email: 'test@example.com',
        phone: '0123456789',
        address: 'Địa chỉ test',
        paymentStatus: 'paid',
        paymentMethodInfo: { method: 'test' },
      } as any;

      const testProducts = [
        {
          _id: 'test-product-id',
          name: 'Sản phẩm test',
          price: 100000,
        },
      ] as any[];

      // Gửi email test
      await this.sendPaymentSuccessEmail(testOrder, testCheckout, testProducts, sendToUser, sendToAdmin);

      this.logger.log(`✅ Test payment success email sent successfully`);
    } catch (error) {
      this.logger.error(`❌ Error sending test payment success email: ${error.message}`);
      throw error;
    }
  }
}