import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryPostController } from './controllers/categories-post.controller';
import { CategoryPostService } from './services/categories-post.service';
import { CategoryPostRepository } from './repositories/categories-post.repository';
import {
  CategoryPost,
  CategoryPostSchema,
} from './schemas/categories-post.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // Kết nối schema CategoryPost với Mongoose
    MongooseModule.forFeature([
      { name: CategoryPost.name, schema: CategoryPostSchema },
    ]),
    forwardRef(() => AuthModule),
    PermissionsModule,
  ],
  controllers: [CategoryPostController],
  providers: [CategoryPostService, CategoryPostRepository],
  exports: [CategoryPostService, CategoryPostRepository],
})
export class CategoryPostModule {}
