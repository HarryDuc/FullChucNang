import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';
import { PayPalModule } from '../paypal/paypal.module';
import { CheckoutModule } from '../checkouts/checkout.module';
import { CommonModule } from 'src/common/common.module';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';
import { Role } from '../manager-permissions/schemas/role.schema';
import { RolePermission, RolePermissionSchema } from '../manager-permissions/schemas/role-permission.schema';
import { RoleSchema } from '../manager-permissions/schemas/role.schema';
import { RoleService } from '../manager-permissions/services/role.service';
/**
 * OrderModule đăng ký các thành phần cần thiết cho quản lý đơn hàng:
 * - OrderSchema: Định nghĩa cấu trúc dữ liệu của đơn hàng.
 * - OrderController: Định nghĩa các endpoint CRUD.
 * - OrderService: Xử lý logic nghiệp vụ cho đơn hàng.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Role.name, schema: RoleSchema },
      { name: RolePermission.name, schema: RolePermissionSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
    forwardRef(() => AuthModule),
    PermissionsModule,
    forwardRef(() => PayPalModule),
    CheckoutModule,
    CommonModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, RoleService],
  exports: [OrderService],
})
export class OrderModule { }
