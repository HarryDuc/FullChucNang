import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScriptController } from './controllers/script.controller';
import { ScriptService } from './services/script.service';
import { Script, ScriptSchema } from './schemas/script.schema';
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
      { name: Script.name, schema: ScriptSchema },
      { name: Role.name, schema: RoleSchema },
      { name: RolePermission.name, schema: RolePermissionSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
    PermissionsModule,
    forwardRef(() => AuthModule),
    CommonModule,
  ],
  controllers: [ScriptController],
  providers: [ScriptService, RoleService],
  exports: [ScriptService],
})
export class ScriptModule { }
