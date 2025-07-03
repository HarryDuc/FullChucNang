import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image } from '../schemas/image.schema';
import { removeVietnameseTones } from '../utils/image.utils';
import * as fs from 'fs';
import * as path from 'path';
import { exiftool } from 'exiftool-vendored';

export interface PaginatedImages {
  images: Image[];
  total: number;
  hasMore: boolean;
}

@Injectable()
export class ImagesService {
  constructor(@InjectModel(Image.name) private imageModel: Model<Image>) {
    // Create tmp directory if it doesn't exist
    const tmpDir = path.join(__dirname, '../../tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
  }

  /**
   * ✅ Extract metadata from image file
   */
  private async extractMetadata(filePath: string): Promise<Record<string, any>> {
    try {
      const metadata = await exiftool.read(filePath);
      return metadata;
    } catch (error) {
      console.error('Error extracting metadata:', error);
      return {};
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

    // ✅ Kiểm tra xem slug đã tồn tại chưa
    while (await this.imageModel.exists({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    return slug;
  }

  /**
   * ✅ Lưu thông tin file vào database (tên file không thay đổi)
   */
  async saveImageToDB(file: Express.Multer.File, useTable?: string, useId?: string): Promise<Image> {
    if (!file) throw new Error('❌ Không tìm thấy file upload!');

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // ✅ Lưu đường dẫn đúng với thư mục năm/tháng
    const imageUrl = `/uploads/${year}/${month}/${file.filename}`;
    const filePath = path.join(__dirname, `../../../../uploads/${year}/${month}/${file.filename}`);

    const slug = await this.generateUniqueSlug(file.originalname);

    // Extract metadata
    const metadata = await this.extractMetadata(filePath);

    const image = new this.imageModel({
      originalName: file.originalname,
      imageUrl,
      slug,
      alt: slug,
      caption: '',
      description: '',
      size: file.size,
      useTable,
      useId,
      metadata,
    });

    return image.save();
  }

  /**
   * ✅ Xử lý upload 1 ảnh
   */
  async handleFileUpload(file: Express.Multer.File, useTable?: string, useId?: string): Promise<Image> {
    return this.saveImageToDB(file, useTable, useId);
  }

  /**
   * ✅ Xử lý upload nhiều ảnh
   */
  async handleMultipleFileUpload(
    files: Express.Multer.File[],
    useTable?: string,
    useId?: string,
  ): Promise<Image[]> {
    if (!files || files.length === 0) {
      throw new Error('❌ Không có ảnh nào để tải lên!');
    }
    return Promise.all(files.map((file) => this.saveImageToDB(file, useTable, useId)));
  }

  /**
   * ✅ Xóa ảnh theo slug
   */
  async deleteImageBySlug(slug: string): Promise<{ message: string }> {
    // ✅ Truy vấn trước để lấy thông tin ảnh
    const image = await this.imageModel.findOne({ slug }).select('imageUrl');

    if (!image) {
      throw new NotFoundException(`Không tìm thấy ảnh với slug: ${slug}`);
    }

    // ✅ Phân tích URL để lấy year, month, filename
    const imageUrlParts = image.imageUrl.split('/');
    const year = imageUrlParts[imageUrlParts.length - 3]; // Lấy phần năm
    const month = imageUrlParts[imageUrlParts.length - 2]; // Lấy phần tháng
    const filename = imageUrlParts[imageUrlParts.length - 1]; // Lấy tên file

    // ✅ Chỉnh lại đường dẫn file theo đúng cấu trúc thư mục
    const filePath = path.join(
      __dirname,
      `../../../../uploads/${year}/${month}/${filename}`,
    );

    try {
      await fs.promises.access(filePath, fs.constants.F_OK); // Kiểm tra file tồn tại
      await fs.promises.unlink(filePath);
    } catch (err: unknown) {
      if (
        (err as { code?: string }).code !== 'ENOENT' &&
        err instanceof Error
      ) {
        throw new Error(`Lỗi khi xóa file: ${err.message}`);
      }
    }

    // ✅ Xóa record trong database
    await this.imageModel.deleteOne({ slug });

    return { message: `Đã xóa ảnh: ${filename}` };
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
   * ✅ Xử lý upload ảnh từ SunEditor và lưu vào database
   */
  async handleEditorFileUpload(
    file: Express.Multer.File,
    useTable?: string,
    useId?: string,
  ): Promise<{ result: { url: string; name: string; size: number }[] }> {
    if (!file) {
      throw new Error('❌ Không tìm thấy file upload!');
    }

    const savedImage = await this.saveImageToDB(file, useTable, useId);

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
}
