import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VoucherController } from './controllers/voucher.controller';
import { VoucherService } from './services/voucher.service';
import { Voucher, VoucherSchema } from './schemas/voucher.schema';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { CommonModule } from 'src/common/common.module';
import { Role, RoleSchema } from '../manager-permissions/schemas/role.schema';
import { RolePermission, RolePermissionSchema } from '../manager-permissions/schemas/role-permission.schema';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';
import { RoleService } from '../manager-permissions/services/role.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Voucher.name, schema: VoucherSchema },
      { name: Role.name, schema: RoleSchema },
      { name: RolePermission.name, schema: RolePermissionSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
    forwardRef(() => AuthModule),
    PermissionsModule,
    CommonModule,
  ],
  controllers: [VoucherController],
  providers: [VoucherService, RoleService],
  exports: [VoucherService],
})
export class VoucherModule { }
