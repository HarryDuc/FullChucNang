import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilterController } from './controllers/filter.controller';
import { FilterService } from './services/filter.service';
import { Filter, FilterSchema } from './schemas/filter.schema';
import { Category, CategorySchema } from '../categories-product/schemas/category.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Filter.name, schema: FilterSchema },
      { name: Category.name, schema: CategorySchema }
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [FilterController],
  providers: [FilterService],
  exports: [FilterService],
})
export class FilterModule {}
