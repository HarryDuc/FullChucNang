import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostController } from './controllers/posts.controller';
import { PostService } from './services/posts.service';
import { PostRepository } from './repositories/posts.repository';
import { Post, PostSchema } from './schemas/post.schema';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { CommonModule } from '../../common/common.module';
import { Role, RoleSchema } from '../manager-permissions/schemas/role.schema';
import { RolePermission, RolePermissionSchema } from '../manager-permissions/schemas/role-permission.schema';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';
import { RoleService } from '../manager-permissions/services/role.service';
import { User, UserSchema } from '../users/schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema },
    { name: Role.name, schema: RoleSchema },
    { name: RolePermission.name, schema: RolePermissionSchema },
    { name: Permission.name, schema: PermissionSchema },
    { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuthModule),
    PermissionsModule,
    CommonModule,
  ],
  controllers: [PostController],
  providers: [PostService, PostRepository, RoleService],
  exports: [PostService, PostRepository],
})
export class PostModule { }
