import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Address, AddressDocument } from '../schemas/address.schema';
import { CreateAddressDto } from '../dtos/address.dto';

@Injectable()
export class AddressRepository {
  private readonly logger = new Logger(AddressRepository.name);
  
  constructor(
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
  ) {}

  async findByUserId(userId: string): Promise<Address[]> {
    return this.addressModel.find({ userId }).exec();
  }

  async findById(id: string, userId: string): Promise<Address | null> {
    try {
      const objectId = new Types.ObjectId(id);
      return this.addressModel.findOne({ _id: objectId, userId }).exec();
    } catch (error) {
      this.logger.error(`Lỗi khi tìm địa chỉ với id ${id}: ${error.message}`);
      return null;
    }
  }

  async create(userId: string, createAddressDto: CreateAddressDto): Promise<Address> {
    this.logger.log(`Đang tạo địa chỉ cho userId: ${userId}`);
    
    if (createAddressDto.isDefault) {
      // Nếu địa chỉ mới là mặc định, cập nhật tất cả địa chỉ khác thành không mặc định
      await this.addressModel.updateMany(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }
    
    // Tạo dữ liệu địa chỉ mới với userId là tham số riêng biệt
    const addressData = {
      userId: userId,
      name: createAddressDto.name,
      phone: createAddressDto.phone,
      province: createAddressDto.province,
      district: createAddressDto.district,
      ward: createAddressDto.ward,
      address: createAddressDto.address,
      isDefault: createAddressDto.isDefault || false,
    };
    
    this.logger.log(`Dữ liệu địa chỉ: ${JSON.stringify(addressData)}`);
    
    const newAddress = new this.addressModel(addressData);
    return newAddress.save();
  }

  async update(id: string, userId: string, updateData: Partial<Address>): Promise<Address | null> {
    try {
      const objectId = new Types.ObjectId(id);
      
      if (updateData.isDefault) {
        // Nếu cập nhật thành địa chỉ mặc định, cập nhật tất cả địa chỉ khác thành không mặc định
        await this.addressModel.updateMany(
          { userId, isDefault: true },
          { isDefault: false }
        );
      }
      
      return this.addressModel
        .findOneAndUpdate({ _id: objectId, userId }, updateData, { new: true })
        .exec();
    } catch (error) {
      this.logger.error(`Lỗi khi cập nhật địa chỉ với id ${id}: ${error.message}`);
      return null;
    }
  }

  async delete(id: string, userId: string): Promise<Address | null> {
    try {
      const objectId = new Types.ObjectId(id);
      return this.addressModel.findOneAndDelete({ _id: objectId, userId }).exec();
    } catch (error) {
      this.logger.error(`Lỗi khi xóa địa chỉ với id ${id}: ${error.message}`);
      return null;
    }
  }

  async setDefault(id: string, userId: string): Promise<Address | null> {
    try {
      const objectId = new Types.ObjectId(id);
      
      // Cập nhật tất cả địa chỉ thành không mặc định
      await this.addressModel.updateMany(
        { userId },
        { isDefault: false }
      );
      
      // Đặt địa chỉ được chọn thành mặc định
      return this.addressModel
        .findOneAndUpdate(
          { _id: objectId, userId },
          { isDefault: true },
          { new: true }
        )
        .exec();
    } catch (error) {
      this.logger.error(`Lỗi khi đặt địa chỉ mặc định với id ${id}: ${error.message}`);
      return null;
    }
  }
} 