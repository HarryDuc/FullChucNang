import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image } from '../schemas/image.schema';
import { removeVietnameseTones } from '../utils/image.utils';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImagesService {
  constructor(@InjectModel(Image.name) private imageModel: Model<Image>) {}

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
  async saveImageToDB(file: Express.Multer.File): Promise<Image> {
    if (!file) throw new Error('❌ Không tìm thấy file upload!');

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // ✅ Lưu đường dẫn đúng với thư mục năm/tháng
    const imageUrl = `/uploads/${year}/${month}/${file.filename}`;

    const slug = await this.generateUniqueSlug(file.originalname);

    const image = new this.imageModel({
      originalName: file.originalname,
      imageUrl,
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
  async handleMultipleFileUpload(
    files: Express.Multer.File[],
  ): Promise<Image[]> {
    if (!files || files.length === 0) {
      throw new Error('❌ Không có ảnh nào để tải lên!');
    }
    return Promise.all(files.map((file) => this.saveImageToDB(file)));
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
   * ✅ Lấy danh sách tất cả hình ảnh
   */
  async getAllImages(): Promise<Image[]> {
    return this.imageModel.find();
  }

  /**
   * ✅ Xử lý upload ảnh từ SunEditor và lưu vào database
   *
   * Cập nhật xử lý trường hợp nhận file với field name dạng "file-0", "file-1", ...
   * và trả về URL đúng bằng cách sử dụng savedImage.imageUrl.
   */
  async handleEditorFileUpload(
    file: Express.Multer.File,
  ): Promise<{ result: { url: string; name: string; size: number }[] }> {
    if (!file) {
      throw new Error('❌ Không tìm thấy file upload!');
    }

    // ✅ Tạo slug duy nhất từ tên file gốc
    const slug = await this.generateUniqueSlug(file.originalname);

    // ✅ Xác định thư mục lưu trữ theo năm/tháng
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // ✅ Tạo đường dẫn đúng cấu trúc lưu trữ
    const imageUrl = `/uploads/${year}/${month}/${file.filename}`;

    // ✅ Lưu vào database với thông tin chuẩn hóa
    const image = new this.imageModel({
      originalName: file.originalname,
      imageUrl,
      slug,
      alt: slug,
      caption: '',
      description: '',
    });

    const savedImage = await image.save();

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
