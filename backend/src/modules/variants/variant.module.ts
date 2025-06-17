// src/modules/variants/variant.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VariantController } from './controllers/variant.controller';
import { VariantService } from './services/variant.service';
import { Variant, VariantSchema, VariantType, VariantTypeSchema } from './schemas/variant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Variant.name, schema: VariantSchema },
      { name: VariantType.name, schema: VariantTypeSchema }
    ]),
  ],
  controllers: [VariantController],
  providers: [VariantService],
})
export class VariantModule { }
