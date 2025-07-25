import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpecificationController } from './controllers/specification.controller';
import { SpecificationService } from './services/specification.service';
import { Specification, SpecificationSchema } from './schemas/specification.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Specification.name, schema: SpecificationSchema },
    ]),
    forwardRef(() => AuthModule),  
  ],
  controllers: [SpecificationController],
  providers: [SpecificationService],
  exports: [SpecificationService],
})
export class SpecificationModule {}
