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
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ImagesService } from '../services/images.service';
import { Express } from 'express';
import { removeVietnameseTones } from '../utils/image.utils';
import { randomBytes } from 'crypto';
import * as fs from 'fs';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PermissionGuard } from 'src/modules/permissions/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';

@Controller('imagesapi')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) { }

  /**
   * ✅ Tạo thư mục theo ngày nếu chưa có
   */
  private static createUploadPath(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const uploadPath = join(
      __dirname,
      '../../../../uploads',
      year.toString(),
      month.toString(),
    );

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    return uploadPath;
  }

  /**
   * ✅ API: Upload 1 ảnh
   */
  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager', 'staff')
  @RequirePermission('images', 'create')
  @UseInterceptors(
    FileInterceptor('file', {
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
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.imagesService.handleFileUpload(file);
  }

  /**
   * ✅ API: Upload nhiều ảnh
   */
  @Post('upload-multiple')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager', 'staff')
  @RequirePermission('images', 'create')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
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
    }),
  )
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.imagesService.handleMultipleFileUpload(files);
  }

  /**
   * ✅ API: Xóa ảnh theo slug
   */
  @Delete(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('images', 'delete')
  async deleteImage(@Param('slug') slug: string) {
    return this.imagesService.deleteImageBySlug(slug);
  }

  /**
   * ✅ API: Lấy tất cả ảnh
   */
  @Get()
  async getAllImages() {
    return this.imagesService.getAllImages();
  }

  /**
   * ✅ API cho SunEditor upload ảnh
   * Sử dụng field 'image' và cùng quy tắc lưu file với API upload thông thường
   */
  @Post('sunEditor')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager', 'staff')
  @RequirePermission('images', 'create')
  @UseInterceptors(
    FileInterceptor('file', {
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
    }),
  )
  async handleEditorFileUpload(@UploadedFile() file: Express.Multer.File) {
    // Gọi hàm xử lý file upload trong service
    return this.imagesService.handleEditorFileUpload(file);
  }
}
