import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname, join } from 'path';
import { ImagesService } from '../services/images.service';
import { Express } from 'express';
import { removeVietnameseTones } from '../utils/image.utils';
import { randomBytes } from 'crypto';
import * as fs from 'fs';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { getR2Config } from '../utils/r2.config';

@Controller('imagesapi')
export class ImagesController {
  private readonly r2Config;

  constructor(private readonly imagesService: ImagesService) {
    this.r2Config = getR2Config();
  }

  /**
   * ✅ Tạo thư mục theo ngày nếu chưa có
   */
  private static createUploadPath(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const uploadPath = join(
      __dirname,
      '../../../../uploads/images',
      year.toString(),
      month.toString(),
    );

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    return uploadPath;
  }

  private getStorageConfig() {
    if (this.r2Config.isR2Enabled) {
      return {
        storage: memoryStorage(),
      };
    }

    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, ImagesController.createUploadPath());
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
  }

  /**
   * ✅ API: Upload 1 ảnh
   */
  @Post('upload')
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file')
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.imagesService.handleFileUpload(file);
  }

  /**
   * ✅ API: Upload nhiều ảnh
   */
  @Post('upload-multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10)
  )
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.imagesService.handleMultipleFileUpload(files);
  }

  /**
   * ✅ API: Xóa ảnh theo slug
   */
  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  async deleteImage(@Param('slug') slug: string) {
    return this.imagesService.deleteImageBySlug(slug);
  }

  /**
   * ✅ API: Lấy tất cả ảnh
   */
  @Get()
  async getAllImages(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '40'
  ) {
    return this.imagesService.getAllImages(+page, +limit);
  }

  /**
   * ✅ API cho SunEditor upload ảnh
   */
  @Post('sunEditor')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file')
  )
  async handleEditorFileUpload(@UploadedFile() file: Express.Multer.File) {
    return this.imagesService.handleEditorFileUpload(file);
  }
}
