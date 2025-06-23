import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VietQRConfigController } from './controllers/vietqr-config.controller';
import { VietQRConfigService } from './services/vietqr-config.service';
import { VietQRConfig, VietQRConfigSchema } from './schemas/vietqr-config.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { Role, RoleSchema } from '../manager-permissions/schemas/role.schema';
import { RolePermission, RolePermissionSchema } from '../manager-permissions/schemas/role-permission.schema';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';
import { RoleService } from '../manager-permissions/services/role.service';
import { User, UserSchema } from '../users/schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VietQRConfig.name, schema: VietQRConfigSchema },
      { name: Role.name, schema: RoleSchema },
      { name: RolePermission.name, schema: RolePermissionSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    PermissionsModule,
    forwardRef(() => AuthModule),
    CommonModule,
  ],
  controllers: [VietQRConfigController],
  providers: [VietQRConfigService, RoleService],
  exports: [VietQRConfigService],
})
export class VietQRModule { }