import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Banner, BannerSchema } from './schemas/banner.schema';
import { BannerController } from './controllers/banner.controller';
import { BannerService } from './services/banner.service';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    // Kết nối schema CategoryPost với Mongoose
    MongooseModule.forFeature([
      { name: Banner.name, schema: BannerSchema },
    ]),
    forwardRef(() => AuthModule),
    PermissionsModule,
  ],
  controllers: [BannerController],
  providers: [BannerService],
  exports: [BannerService],
})
export class BannerModule { }
