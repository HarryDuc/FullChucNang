import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // ✅ Import MongooseModule để kết nối MongoDB
import { ProductController } from './controllers/products.controller';
import { ProductService } from './services/products.service';
import { Product, ProductSchema } from './schemas/product.schema'; // ✅ Import Schema
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    PermissionsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [ProductController], // ✅ Đăng ký controller
  providers: [ProductService], // ✅ Đăng ký service và repository
})
export class ProductsModule { }
