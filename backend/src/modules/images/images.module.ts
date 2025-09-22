import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ImagesController } from './controllers/images.controller';
import { ImagesService } from './services/images.service';
import { Image, ImageSchema } from './schemas/image.schema';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { User, UserSchema } from '../users/schemas/users.schema';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import { removeVietnameseTones } from './utils/image.utils';
import { randomBytes } from 'crypto';
import { getR2Config } from './utils/r2.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Image.name, schema: ImageSchema },
      { name: User.name, schema: UserSchema },
    ]),
    MulterModule.registerAsync({
      useFactory: () => {
        const r2Config = getR2Config();
        
        if (r2Config.isR2Enabled) {
          return {
            storage: memoryStorage(),
          };
        }

        return {
          storage: diskStorage({
            destination: (req, file, cb) => {
              const now = new Date();
              const year = now.getFullYear();
              const month = String(now.getMonth() + 1).padStart(2, '0');
              const uploadPath = `uploads/images/${year}/${month}`;
              
              // Create directory if it doesn't exist
              const fs = require('fs');
              if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
              }
              
              cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
              const originalName = file.originalname
                .split('.')
                .slice(0, -1)
                .join('.');
              const sanitizedFileName = removeVietnameseTones(originalName);
              const fileExt = extname(file.originalname);
              const randomString = randomBytes(4).toString('hex');
              const finalFileName = `${sanitizedFileName}-${randomString}${fileExt}`;
              cb(null, finalFileName);
            },
          }),
        };
      },
    }),
    forwardRef(() => AuthModule),
    CommonModule,
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
