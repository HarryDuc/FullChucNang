import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
import { RedirectsModule } from '../redirects/redirects.module';
import { FilterModule } from '../filters/filter.module';
import { CategoriesProductModule } from '../categories-product/categories-product.module';
import { Category, CategorySchema } from '../categories-product/schemas/category.schema';
import { Filter, FilterSchema } from '../filters/schemas/filter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Role.name, schema: RoleSchema },
      { name: RolePermission.name, schema: RolePermissionSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Filter.name, schema: FilterSchema },
      { name: Category.name, schema: CategorySchema }
    ]),
    PermissionsModule,
    forwardRef(() => AuthModule),
    CommonModule,
    forwardRef(() => RedirectsModule),
    FilterModule,
    CategoriesProductModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, RoleService],
  exports: [ProductService],
})
export class ProductsModule {}
