import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryPostController } from './controllers/categories-post.controller';
import { CategoryPostService } from './services/categories-post.service';
import { CategoryPostRepository } from './repositories/categories-post.repository';
import {
  CategoryPost,
  CategoryPostSchema,
} from './schemas/categories-post.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../../common/common.module';
import { Role, RoleSchema } from '../manager-permissions/schemas/role.schema';
import { RolePermission, RolePermissionSchema } from '../manager-permissions/schemas/role-permission.schema';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';
import { RoleService } from '../manager-permissions/services/role.service';
import { User, UserSchema } from '../users/schemas/users.schema';
@Module({
  imports: [
    // Kết nối schema CategoryPost với Mongoose
    MongooseModule.forFeature([
      { name: CategoryPost.name, schema: CategoryPostSchema },
      { name: Role.name, schema: RoleSchema },
      { name: RolePermission.name, schema: RolePermissionSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuthModule),
    PermissionsModule,
    CommonModule,
  ],
  controllers: [CategoryPostController],
  providers: [CategoryPostService, CategoryPostRepository, RoleService],
  exports: [CategoryPostService, CategoryPostRepository],
})
export class CategoryPostModule { }
