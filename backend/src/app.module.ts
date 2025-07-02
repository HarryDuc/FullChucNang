import { CategoriesProductModule } from './modules/categories-product/categories-product.module';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { APP_GUARD } from '@nestjs/core';

// Import các module chính
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module'; // ✅ Module quản lý sản phẩm
import { ImagesModule } from './modules/images/images.module';
import { VariantModule } from './modules/variants/variant.module';
import { OrderModule } from './modules/orders/order.module'; // 🛒 Module quản lý đơn hàng
import { CheckoutModule } from './modules/checkouts/checkout.module'; // 💳 Module quản lý thanh toán
import { AddressesModule } from './modules/addresses/addresses.module'; // 📍 Module quản lý địa chỉ
import { CategoryPostModule } from './modules/categories-post/categories-post.module'; // ✅ Module quản lý danh mục bài viết
import { PostModule } from './modules/posts/posts.module';
import { PayPalModule } from './modules/paypal/paypal.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

// Import MailerModule để xử lý email
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { VerifyModule } from './modules/verify/verify.module';
import { ContactListModule } from './modules/info-website/info-website.module';
import { ContactModule } from './modules/contact/contact.module';
import { BannerModule } from './modules/banner/banner.module';
import { ScriptModule } from './modules/script/script.module';
import { CreatePageModule } from './modules/create-page/create-page.module';
import { ReviewModule } from './modules/reviews/review.module';
import { VoucherModule } from './modules/vouchers/voucher.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RedirectMiddleware } from './modules/redirects/middlewares/redirect.middleware'; // ✅ Middleware xử lý redirect
import { RedirectsModule } from './modules/redirects/redirects.module';

@Module({
  imports: [
    // ✅ Đọc biến môi trường từ file `.env`
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ✅ Cấu hình Multer để hỗ trợ upload file
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads', // ✅ Lưu ảnh vào thư mục `uploads/`
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
    }),

    // ✅ Import các module chính
    AddressesModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    PostModule,
    ProductsModule, // ✅ Import module quản lý sản phẩm
    ImagesModule, // ✅ Import module xử lý upload file
    // VariantModule, // ✅ Import module quản lý biến thể sản phẩm
    CategoriesProductModule, // ✅ Import module quản lý danh mục sản phẩm
    OrderModule, // 🛒 Import module quản lý đơn hàng
    CheckoutModule, // 💳 Import module quản lý thanh toán
    AddressesModule, // 📍 Import module quản lý địa chỉ
    CategoryPostModule, // ✅ Import module quản lý danh mục bài viết
    ContactListModule,
    ContactModule,
    BannerModule,
    ScriptModule,
    CreatePageModule,
    ReviewModule,
    VoucherModule,
    PermissionsModule,
    PayPalModule, // 💰 Import module thanh toán PayPal
    RedirectsModule, // ✅ Import module quản lý redirect URLs

    // ✅ Cấu hình MailerModule để gửi email
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
        debug: true,
      },
      defaults: {
        from: `"Katsun Decor" <${process.env.MAIL_USER}>`,
      },
      template: {
        dir: join(__dirname, '..', 'src', 'modules', 'verify', 'templates'), // ✅ Sửa đường dẫn chính xác
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),

    VerifyModule, // ✅ Import module xác minh tài khoản
  ],
  // providers: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: JwtAuthGuard,
  //   },
  //   {
  //     provide: APP_GUARD,
  //     useClass: RolesGuard,
  //   },
  // ],
})
export class AppModule {   /**
  * Cấu hình middleware xử lý redirect URL
  * Middleware này sẽ chạy trước tất cả các route để kiểm tra xem URL có cần redirect không
  */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RedirectMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.GET }); // Áp dụng cho tất cả các GET request
  }
}
