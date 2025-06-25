import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VoucherService, CheckVoucherResponse } from '../services/voucher.service';
import { CreateVoucherDto } from '../dtos/create-voucher.dto';
import { Voucher } from '../schemas/voucher.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PermissionGuard } from 'src/modules/permissions/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';

@Controller('vouchersapi')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('vouchers', 'create')
  async create(@Body() createVoucherDto: CreateVoucherDto): Promise<Voucher> {
    return this.voucherService.create(createVoucherDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('vouchers', 'read')
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.voucherService.findAll(page, limit, isActive);
  }

  @Get('valid')
  async findValidVouchers(
    @Query('productSlug') productSlug?: string,
    @Query('userId') userId?: string,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    return this.voucherService.findValidVouchers(productSlug, userId, paymentMethod);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.voucherService.findOne(id);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    return this.voucherService.findByCode(code);
  }

  @Get('check/:code')
  async checkVoucherValidity(
    @Param('code') code: string,
    @Query('productSlug') productSlug?: string,
    @Query('userId') userId?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('totalAmount') totalAmount?: number,
  ): Promise<CheckVoucherResponse> {
    return this.voucherService.checkVoucherValidity(code, {
      productSlug,
      userId,
      paymentMethod,
      totalAmount: totalAmount ? Number(totalAmount) : undefined,
    });
  }

  @Post('use/:code')
  @UseGuards(JwtAuthGuard)
  async useVoucher(@Param('code') code: string) {
    return this.voucherService.useVoucher(code);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('vouchers', 'update')
  async update(
    @Param('id') id: string,
    @Body() updateVoucherDto: Partial<CreateVoucherDto>,
  ) {
    return this.voucherService.update(id, updateVoucherDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('vouchers', 'delete')
  async remove(@Param('id') id: string) {
    return this.voucherService.remove(id);
  }
}