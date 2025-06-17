import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PageController } from './controllers/page.controller';
import { PageService } from './services/page.service';
import { Page, PageSchema } from './schemas/page.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Page.name, schema: PageSchema }]),
    forwardRef(() => AuthModule),
    PermissionsModule,
  ],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService],
})
export class CreatePageModule { }
