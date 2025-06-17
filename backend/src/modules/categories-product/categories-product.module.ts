import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesProductController } from './controllers/categories-product.controller';
import { CategoriesProductService } from './services/categories-product.service';
import { Category, CategorySchema } from './schemas/category.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    forwardRef(() => AuthModule),
    PermissionsModule,
  ],
  controllers: [CategoriesProductController],
  providers: [CategoriesProductService],
  exports: [CategoriesProductService],
})
export class CategoriesProductModule {}
