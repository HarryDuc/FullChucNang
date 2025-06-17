import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VietQRConfig, VietQRConfigDocument } from '../schemas/vietqr-config.schema';
import { VietQRConfigDto, UpdateVietQRConfigDto } from '../dtos/vietqr-config.dto';

@Injectable()
export class VietQRConfigService {
  constructor(
    @InjectModel(VietQRConfig.name)
    private vietQRConfigModel: Model<VietQRConfigDocument>,
  ) { }

  async getConfig(): Promise<VietQRConfig | null> {
    return this.vietQRConfigModel.findOne({ active: true }).exec();
  }

  async getAllConfigs(): Promise<VietQRConfig[]> {
    return this.vietQRConfigModel.find().sort({ createdAt: -1 }).exec();
  }

  async createConfig(config: VietQRConfigDto): Promise<VietQRConfig> {
    // Nếu config mới được set active, deactivate tất cả configs khác
    if (config.active) {
      await this.deactivateAllConfigs();
    }

    const newConfig = new this.vietQRConfigModel({
      ...config,
      active: config.active || false,
    });
    return newConfig.save();
  }

  async updateConfig(configId: string, config: UpdateVietQRConfigDto): Promise<VietQRConfig | null> {
    const existingConfig = await this.vietQRConfigModel.findById(configId).exec();
    if (!existingConfig) {
      throw new Error('VietQR configuration not found');
    }

    // Nếu config được update thành active, deactivate tất cả configs khác
    if (config.active) {
      await this.deactivateAllConfigs();
    }

    return this.vietQRConfigModel
      .findByIdAndUpdate(configId, config, { new: true })
      .exec();
  }

  async setActive(configId: string): Promise<VietQRConfig | null> {
    // Deactivate tất cả configs
    await this.deactivateAllConfigs();

    // Set active cho config được chọn
    return this.vietQRConfigModel
      .findByIdAndUpdate(configId, { active: true }, { new: true })
      .exec();
  }

  private async deactivateAllConfigs(): Promise<void> {
    await this.vietQRConfigModel.updateMany({}, { active: false }).exec();
  }
}