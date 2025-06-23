import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesProductController } from './controllers/categories-product.controller';
import { CategoriesProductService } from './services/categories-product.service';
import { Category, CategorySchema } from './schemas/category.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { Role, RoleSchema } from '../manager-permissions/schemas/role.schema';
import { RolePermission, RolePermissionSchema } from '../manager-permissions/schemas/role-permission.schema';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';
import { RoleService } from '../manager-permissions/services/role.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Role.name, schema: RoleSchema },
      { name: RolePermission.name, schema: RolePermissionSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
    forwardRef(() => AuthModule),
    PermissionsModule,
    CommonModule,
  ],
  controllers: [CategoriesProductController],
  providers: [CategoriesProductService, RoleService],
  exports: [CategoriesProductService],
})
export class CategoriesProductModule {}
