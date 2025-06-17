import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VoucherController } from './controllers/voucher.controller';
import { VoucherService } from './services/voucher.service';
import { Voucher, VoucherSchema } from './schemas/voucher.schema';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Voucher.name, schema: VoucherSchema },
    ]),
    forwardRef(() => AuthModule),
    PermissionsModule,
  ],
  controllers: [VoucherController],
  providers: [VoucherService],
  exports: [VoucherService],
})
export class VoucherModule { }
