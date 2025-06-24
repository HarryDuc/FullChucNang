import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckoutService } from './services/checkout.service';
import { CheckoutController } from './controllers/checkout.controller';
import { Checkout, CheckoutSchema } from './schemas/checkout.schema';
import { BankTransferService } from './services/bank-transfer.service';
import { MetamaskPaymentService } from './services/metamask-payment.service';
import { MetamaskPaymentController } from './controllers/metamask-payment.controller';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { VietQRModule } from '../vietqr/vietqr.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';
import { PayPalModule } from '../paypal/paypal.module';
import { Role, RoleSchema } from '../manager-permissions/schemas/role.schema';
import { RolePermission, RolePermissionSchema } from '../manager-permissions/schemas/role-permission.schema';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';
import { RoleService } from '../manager-permissions/services/role.service';
import { AuthService } from '../auth/services/auth.service';
import { UsersService } from '../users/services/users.service';
import { Token, TokenSchema } from '../auth/schemas/token.schema';
import { Otp, OtpSchema } from '../auth/schemas/otp.schema';
import { Auth, AuthSchema } from '../auth/schemas/auth.schema';
import { VerifyService } from '../verify/services/verify.service';
import { UsersRepository } from '../users/repositories/users.repository';
import { User, UserSchema } from '../users/schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Checkout.name, schema: CheckoutSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Role.name, schema: RoleSchema },
      { name: RolePermission.name, schema: RolePermissionSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Token.name, schema: TokenSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: Auth.name, schema: AuthSchema },
      { name: User.name, schema: UserSchema },
    ]),
    VietQRModule,
    forwardRef(() => PayPalModule),
    forwardRef(() => AuthModule),
    PermissionsModule,
  ],
  controllers: [CheckoutController, MetamaskPaymentController],
  providers: [CheckoutService, BankTransferService, MetamaskPaymentService, RoleService, AuthService, UsersService, VerifyService, UsersRepository],
  exports: [CheckoutService],
})
export class CheckoutModule { }
