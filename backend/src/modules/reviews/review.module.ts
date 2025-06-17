import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewController } from './controllers/review.controller';
import { ReviewService } from './services/review.service';
import { Review, ReviewSchema } from './schemas/review.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Checkout, CheckoutSchema } from '../checkouts/schemas/checkout.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Checkout.name, schema: CheckoutSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    PermissionsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule { }