import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { UpimgController } from './controllers/upimg.controller';
import { UpimgService } from './services/upimg.service';
import { UpimgRepository } from './repositories/upimg.repository';
import { Upimg, UpimgSchema } from './schemas/upimg.schema';
import { ImagesModule } from '../images/images.module';
import { getR2Config } from '../images/utils/r2.config';
import { memoryStorage, diskStorage } from 'multer';
import { extname } from 'path';
import { removeVietnameseTones } from '../images/utils/image.utils';
import { randomBytes } from 'crypto';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Upimg.name, schema: UpimgSchema }
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
    ImagesModule
  ],
  controllers: [UpimgController],
  providers: [UpimgService, UpimgRepository],
  exports: [UpimgService, UpimgRepository]
})
export class UpimgModule { }
