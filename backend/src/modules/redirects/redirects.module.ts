import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Redirect, RedirectSchema } from './schemas/redirect.schema';
import { RedirectsService } from './services/redirects.service';
import { RedirectsController } from './controllers/redirects.controller';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { ProductsModule } from '../products/products.module';
import { PostModule } from '../posts/posts.module';
import { Auth, AuthSchema } from '../auth/schemas/auth.schema';
import { RoleService } from '../manager-permissions/services/role.service';
import { Role, RoleSchema } from '../manager-permissions/schemas/role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Redirect.name, schema: RedirectSchema },
      { name: Auth.name, schema: AuthSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    forwardRef(() => AuthModule),
    PermissionsModule,
    forwardRef(() => ProductsModule),
    forwardRef(() => PostModule),
  ],
  controllers: [RedirectsController],
  providers: [RedirectsService, RoleService],
  exports: [RedirectsService],
})
export class RedirectsModule {}