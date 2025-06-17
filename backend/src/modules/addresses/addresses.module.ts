// addresses.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressService } from './services/address.service';
import { AddressRepository } from './repositories/address.repository';
import { AddressController } from './controllers/address.controller';
import { Address, AddressSchema } from './schemas/address.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Address.name, schema: AddressSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [AddressController],
  providers: [AddressService, AddressRepository],
  exports: [AddressService],
})
export class AddressesModule {} 