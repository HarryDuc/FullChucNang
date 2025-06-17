import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { AddressRepository } from '../repositories/address.repository';
import { Address } from '../schemas/address.schema';
import { CreateAddressDto, UpdateAddressDto, AddressResponseDto } from '../dtos/address.dto';
import { Types } from 'mongoose';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);
  
  constructor(private readonly addressRepository: AddressRepository) {}

  async getUserAddresses(userId: string): Promise<AddressResponseDto[]> {
    const addresses = await this.addressRepository.findByUserId(userId);
    return addresses.map(address => this.toResponseDto(address));
  }

  async getAddressById(id: string, userId: string): Promise<AddressResponseDto> {
    try {
      this.validateObjectId(id);
      const address = await this.addressRepository.findById(id, userId);
      if (!address) {
        throw new NotFoundException(`Không tìm thấy địa chỉ với id ${id}`);
      }
      return this.toResponseDto(address);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`ID địa chỉ không hợp lệ: ${id}`);
    }
  }

  async createAddress(userId: string, createAddressDto: CreateAddressDto): Promise<AddressResponseDto> {
    const address = await this.addressRepository.create(userId, createAddressDto);
    return this.toResponseDto(address);
  }

  async updateAddress(id: string, userId: string, updateAddressDto: UpdateAddressDto): Promise<AddressResponseDto> {
    this.validateObjectId(id);
    const updatedAddress = await this.addressRepository.update(id, userId, updateAddressDto);
    if (!updatedAddress) {
      throw new NotFoundException(`Không tìm thấy địa chỉ với id ${id}`);
    }
    return this.toResponseDto(updatedAddress);
  }

  async deleteAddress(id: string, userId: string): Promise<void> {
    this.validateObjectId(id);
    const deletedAddress = await this.addressRepository.delete(id, userId);
    if (!deletedAddress) {
      throw new NotFoundException(`Không tìm thấy địa chỉ với id ${id}`);
    }
  }

  async setDefaultAddress(id: string, userId: string): Promise<AddressResponseDto> {
    this.validateObjectId(id);
    const address = await this.addressRepository.setDefault(id, userId);
    if (!address) {
      throw new NotFoundException(`Không tìm thấy địa chỉ với id ${id}`);
    }
    return this.toResponseDto(address);
  }

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      this.logger.error(`ID không hợp lệ: ${id}`);
      throw new BadRequestException(`ID không hợp lệ: ${id}`);
    }
  }

  private toResponseDto(address: Address | any): AddressResponseDto {
    return {
      id: address._id ? address._id.toString() : address.id,
      userId: address.userId,
      name: address.name,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      address: address.address,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }
} 