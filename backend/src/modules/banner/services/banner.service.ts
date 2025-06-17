import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from '../schemas/banner.schema';
import { CreateBannerDto, UpdateBannerDto, UpdateBannerOrderDto } from '../dtos/banner.dto';

@Injectable()
export class BannerService {
  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
  ) { }

  /**
   * Tạo banner mới
   */
  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    const createdBanner = new this.bannerModel(createBannerDto);
    return createdBanner.save();
  }

  /**
   * Lấy tất cả banner theo loại và trạng thái
   */
  async findAll(type?: string, isActive?: boolean): Promise<Banner[]> {
    const query: any = {};

    if (type) {
      query.type = type;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    return this.bannerModel.find(query).sort({ order: 1 }).exec();
  }

  /**
   * Lấy banner theo ID
   */
  async findOne(id: string): Promise<BannerDocument> {
    const banner = await this.bannerModel.findById(id).exec();
    if (!banner) {
      throw new NotFoundException('Banner không tồn tại');
    }
    return banner;
  }

  /**
   * Cập nhật banner
   */
  async update(id: string, updateBannerDto: UpdateBannerDto): Promise<Banner> {
    const existingBanner = await this.bannerModel
      .findByIdAndUpdate(id, updateBannerDto, { new: true })
      .exec();

    if (!existingBanner) {
      throw new NotFoundException('Banner không tồn tại');
    }

    return existingBanner;
  }

  /**
   * Cập nhật thứ tự banner
   */
  async updateOrder(id: string, updateOrderDto: UpdateBannerOrderDto): Promise<Banner> {
    const banner = await this.findOne(id);
    banner.order = updateOrderDto.order;
    return banner.save();
  }

  /**
   * Xóa banner
   */
  async remove(id: string): Promise<Banner> {
    const deletedBanner = await this.bannerModel.findByIdAndDelete(id).exec();
    if (!deletedBanner) {
      throw new NotFoundException('Banner không tồn tại');
    }
    return deletedBanner;
  }

  /**
   * Lấy banner theo loại và trạng thái active
   */
  async getActiveBannersByType(type: string): Promise<Banner[]> {
    return this.bannerModel
      .find({ type, isActive: true })
      .sort({ order: 1 })
      .exec();
  }

  /**
   * Cập nhật trạng thái active/inactive của banner
   */
  async toggleActive(id: string): Promise<Banner> {
    const banner = await this.findOne(id);
    banner.isActive = !banner.isActive;
    return banner.save();
  }
}