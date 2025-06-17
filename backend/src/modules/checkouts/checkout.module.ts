import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckoutService } from './services/checkout.service';
import { CheckoutController } from './controllers/checkout.controller';
import { Checkout, CheckoutSchema } from './schemas/checkout.schema';
import { BankTransferService } from './services/bank-transfer.service';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { VietQRModule } from '../vietqr/vietqr.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Checkout.name, schema: CheckoutSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    VietQRModule,
    forwardRef(() => AuthModule),
    PermissionsModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService, BankTransferService],
})
export class CheckoutModule { }
