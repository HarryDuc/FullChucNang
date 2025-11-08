import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image } from '../schemas/image.schema';
import { removeVietnameseTones } from '../utils/image.utils';
import * as fs from 'fs';
import * as path from 'path';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createR2Client, getR2Config } from '../utils/r2.config';

export interface PaginatedImages {
  images: Image[];
  total: number;
  hasMore: boolean;
}

@Injectable()
export class ImagesService {
  private r2Client;
  private r2Config;

  constructor(@InjectModel(Image.name) private imageModel: Model<Image>) {
    this.r2Config = getR2Config();
    if (this.r2Config.isR2Enabled) {
      this.r2Client = createR2Client();
    }
  }

  /**
   * ✅ Tạo slug duy nhất (không đổi tên file)
   */
  async generateUniqueSlug(originalName: string): Promise<string> {
    const baseSlug = removeVietnameseTones(
      originalName.split('.').slice(0, -1).join('-'),
    );

    let count = 1;
    let slug = baseSlug;

    while (await this.imageModel.exists({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    return slug;
  }

  /**
   * ✅ Generate unique filename
   */
  private generateUniqueFilename(originalName: string, slug: string): string {
    const fileExt = path.extname(originalName);
    const timestamp = Date.now();
    return `${slug}-${timestamp}${fileExt}`;
  }

  /**
   * ✅ Upload file to R2
   */
  private async uploadToR2(file: Express.Multer.File, filename: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.r2Config.bucketName,
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Thêm metadata để tối ưu cho image
        Metadata: {
          'original-name': file.originalname,
          'file-size': file.size.toString(),
          'upload-time': new Date().toISOString(),
        },
      });

      await this.r2Client.send(command);
      return `${this.r2Config.cdnUrl}/${filename}`;
    } catch (error) {
      console.error('R2 Upload Error:', error);
      throw new Error(`Failed to upload to R2: ${error.message}`);
    }
  }

  /**
   * ✅ Lưu thông tin file vào database
   */
  async saveImageToDB(file: Express.Multer.File): Promise<Image> {
    if (!file) throw new Error('❌ Không tìm thấy file upload!');

    const slug = await this.generateUniqueSlug(file.originalname);
    let imageUrl: string;
    let location: string;

    if (this.r2Config.isR2Enabled) {
      // For R2 storage, generate a unique filename and upload to R2
      const filename = this.generateUniqueFilename(file.originalname, slug);
      imageUrl = await this.uploadToR2(file, filename);
      location = imageUrl; // Use the same CDN URL for both imageUrl and location
    } else {
      // For local storage, use the existing file path
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      imageUrl = `/uploads/images/${year}/${month}/${file.filename}`;
      location = `${process.env.SERVER_URL}${imageUrl}`;
    }

    const image = new this.imageModel({
      originalName: file.originalname,
      imageUrl,
      location,
      slug,
      alt: slug,
      caption: '',
      description: '',
    });

    return image.save();
  }

  /**
   * ✅ Xử lý upload 1 ảnh
   */
  async handleFileUpload(file: Express.Multer.File): Promise<Image> {
    return this.saveImageToDB(file);
  }

  /**
   * ✅ Xử lý upload nhiều ảnh
   */
  async handleMultipleFileUpload(files: Express.Multer.File[]): Promise<Image[]> {
    if (!files || files.length === 0) {
      throw new Error('❌ Không có ảnh nào để tải lên!');
    }
    return Promise.all(files.map((file) => this.saveImageToDB(file)));
  }

  /**
   * ✅ Xóa ảnh theo slug
   */
  async deleteImageBySlug(slug: string): Promise<{ message: string }> {
    const image = await this.imageModel.findOne({ slug }).select('imageUrl');

    if (!image) {
      throw new NotFoundException(`Không tìm thấy ảnh với slug: ${slug}`);
    }

    if (this.r2Config.isR2Enabled) {
      if (image.imageUrl.startsWith(this.r2Config.cdnUrl)) {
        const key = image.imageUrl.replace(`${this.r2Config.cdnUrl}/`, '');
        try {
          await this.r2Client.send(
            new DeleteObjectCommand({
              Bucket: this.r2Config.bucketName,
              Key: key,
            })
          );
        } catch (error) {
          console.error('Failed to delete from R2:', error);
        }
      }
    } else {
      // Handle local file deletion
      const imageUrlParts = image.imageUrl.split('/');
      const year = imageUrlParts[imageUrlParts.length - 3];
      const month = imageUrlParts[imageUrlParts.length - 2];
      const filename = imageUrlParts[imageUrlParts.length - 1];

      const filePath = path.join(
        __dirname,
        `../../../../uploads/images/${year}/${month}/${filename}`,
      );

      try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        await fs.promises.unlink(filePath);
      } catch (err: unknown) {
        if (
          (err as { code?: string }).code !== 'ENOENT' &&
          err instanceof Error
        ) {
          throw new Error(`Lỗi khi xóa file: ${err.message}`);
        }
      }
    }

    await this.imageModel.deleteOne({ slug });
    return { message: `Đã xóa ảnh thành công` };
  }

  /**
   * ✅ Xóa ảnh theo URL (không cần slug)
   */
  async deleteByUrl(url: string): Promise<{ message: string }> {
    // Tìm bản ghi để xóa trong DB nếu có
    const image = await this.imageModel.findOne({ imageUrl: url }).select('_id imageUrl');

    if (this.r2Config.isR2Enabled) {
      if (url.startsWith(this.r2Config.cdnUrl)) {
        const key = url.replace(`${this.r2Config.cdnUrl}/`, '');
        try {
          await this.r2Client.send(
            new DeleteObjectCommand({
              Bucket: this.r2Config.bucketName,
              Key: key,
            })
          );
        } catch (error) {
          console.error('Failed to delete from R2:', error);
        }
      }
    } else {
      // Handle local file deletion
      const imageUrlParts = url.split('/');
      const year = imageUrlParts[imageUrlParts.length - 3];
      const month = imageUrlParts[imageUrlParts.length - 2];
      const filename = imageUrlParts[imageUrlParts.length - 1];

      const filePath = path.join(
        __dirname,
        `../../../../uploads/images/${year}/${month}/${filename}`,
      );

      try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        await fs.promises.unlink(filePath);
      } catch (err: unknown) {
        if ((err as { code?: string }).code !== 'ENOENT' && err instanceof Error) {
          throw new Error(`Lỗi khi xóa file: ${err.message}`);
        }
      }
    }

    // Xóa bản ghi DB nếu tồn tại
    if (image?._id) {
      await this.imageModel.deleteOne({ _id: image._id });
    }

    return { message: `Đã xóa ảnh thành công` };
  }

  /**
   * ✅ Lấy danh sách hình ảnh có phân trang
   */
  async getAllImages(page: number = 1, limit: number = 60): Promise<PaginatedImages> {
    const skip = (page - 1) * limit;

    const [images, total] = await Promise.all([
      this.imageModel.find()
        .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo, mới nhất lên đầu
        .skip(skip)
        .limit(limit)
        .exec(),
      this.imageModel.countDocuments()
    ]);

    const hasMore = total > skip + images.length;

    return {
      images,
      total,
      hasMore
    };
  }

  /**
   * ✅ Xử lý upload ảnh từ SunEditor
   */
  async handleEditorFileUpload(
    file: Express.Multer.File,
  ): Promise<{ result: { url: string; name: string; size: number }[] }> {
    if (!file) {
      throw new Error('❌ Không tìm thấy file upload!');
    }

    const savedImage = await this.saveImageToDB(file);

    return {
      result: [
        {
          url: savedImage.location,
          name: file.originalname,
          size: file.size,
        },
      ],
    };
  }


  /**
   * ✅ Tìm ảnh theo ID
   */
  async findById(id: string): Promise<Image> {
    const image = await this.imageModel.findById(id).exec();
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    return image;
  }

  /**
   * ✅ Upload ảnh (alias cho handleFileUpload)
   */
  async uploadImage(file: Express.Multer.File): Promise<Image> {
    return this.handleFileUpload(file);
  }

}
