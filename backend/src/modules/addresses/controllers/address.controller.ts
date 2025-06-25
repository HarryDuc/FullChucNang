import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Logger, BadRequestException } from '@nestjs/common';
import { AddressService } from '../services/address.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateAddressDto, UpdateAddressDto } from '../dtos/address.dto';

@Controller('addressesapi')
@UseGuards(JwtAuthGuard)
export class AddressController {
  private readonly logger = new Logger(AddressController.name);

  constructor(private readonly addressService: AddressService) {}

  @Get()
  async getUserAddresses(@Request() req) {
    this.logger.log(`Lấy danh sách địa chỉ cho user: ${JSON.stringify(req.user)}`);
    return this.addressService.getUserAddresses(req.user.userId);
  }

  @Get(':id')
  async getAddressById(@Request() req, @Param('id') id: string) {
    this.logger.log(`Lấy thông tin địa chỉ ${id} cho user: ${JSON.stringify(req.user)}`);
    return this.addressService.getAddressById(id, req.user.userId);
  }

  @Post()
  async createAddress(
    @Request() req,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    this.logger.log(`Thêm địa chỉ mới cho user: ${JSON.stringify(req.user)}`);

    try {
      const newAddress = await this.addressService.createAddress(req.user.userId, createAddressDto);
      return newAddress;
    } catch (error) {
      this.logger.error(`Lỗi khi thêm địa chỉ mới: ${error.message}`);
      throw error;
    }
  }

  @Put(':id')
  async updateAddress(
    @Request() req,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    this.logger.log(`Cập nhật địa chỉ ${id} cho user: ${JSON.stringify(req.user)}`);
    return this.addressService.updateAddress(id, req.user.userId, updateAddressDto);
  }

  @Delete(':id')
  async deleteAddress(@Request() req, @Param('id') id: string) {
    await this.addressService.deleteAddress(id, req.user.userId);
    return { message: 'Địa chỉ đã được xóa thành công' };
  }

  @Put(':id/default')
  async setDefaultAddress(@Request() req, @Param('id') id: string) {
    this.logger.log(`Đặt địa chỉ ${id} làm mặc định cho user: ${JSON.stringify(req.user)}`);
    return this.addressService.setDefaultAddress(id, req.user.userId);
  }
}