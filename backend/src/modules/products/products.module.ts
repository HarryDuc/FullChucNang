import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // ✅ Import MongooseModule để kết nối MongoDB
import { ProductController } from './controllers/products.controller';
import { ProductService } from './services/products.service';
import { Product, ProductSchema } from './schemas/product.schema'; // ✅ Import Schema
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../../common/common.module';
import { RoleService } from '../manager-permissions/services/role.service';
import { Role, RoleSchema } from '../manager-permissions/schemas/role.schema';
import { RolePermission, RolePermissionSchema } from '../manager-permissions/schemas/role-permission.schema';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Role.name, schema: RoleSchema },
      { name: RolePermission.name, schema: RolePermissionSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
    PermissionsModule,
    forwardRef(() => AuthModule),
    CommonModule,
  ],
  controllers: [ProductController], // ✅ Đăng ký controller
  providers: [ProductService, RoleService], // ✅ Đăng ký service và repository
})
export class ProductsModule { }
