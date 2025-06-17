import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VietQRConfigController } from './controllers/vietqr-config.controller';
import { VietQRConfigService } from './services/vietqr-config.service';
import { VietQRConfig, VietQRConfigSchema } from './schemas/vietqr-config.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VietQRConfig.name, schema: VietQRConfigSchema },
    ]),
    PermissionsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [VietQRConfigController],
  providers: [VietQRConfigService],
  exports: [VietQRConfigService],
})
export class VietQRModule { }