import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactListController } from './controllers/info-website.controller';
import { ContactListService } from './services/info-website.service';
import { ContactList, ContactListSchema } from './schemas/info-website.schema';
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
      { name: ContactList.name, schema: ContactListSchema },
      { name: Role.name, schema: RoleSchema },
      { name: RolePermission.name, schema: RolePermissionSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
    forwardRef(() => AuthModule),
    PermissionsModule,
    CommonModule,
  ],
  controllers: [ContactListController],
  providers: [ContactListService, RoleService],
  exports: [ContactListService],
})
export class ContactListModule { }