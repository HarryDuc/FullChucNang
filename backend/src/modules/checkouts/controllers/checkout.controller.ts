import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CheckoutService } from '../services/checkout.service';
import { CreateCheckoutDto } from '../dtos/checkout.dto';
import { Checkout } from '../schemas/checkout.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { PermissionGuard } from 'src/modules/permissions/guards/permission.guard';

@Controller('checkoutapi') // 👉 Có thể đổi thành 'api/checkouts' nếu theo chuẩn toàn hệ thống
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) { }

  /**
   * 🛒 Tạo đơn thanh toán mới
   */
  @Post()
  async create(@Body() dto: CreateCheckoutDto): Promise<Checkout> {
    return this.checkoutService.create(dto);
  }

  /**
   * 📋 Lấy danh sách tất cả checkout
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager', 'staff')
  @RequirePermission('checkout', 'read')
  async findAll(): Promise<Checkout[]> {
    return this.checkoutService.findAll();
  }

  /**
   * 🔍 Lấy chi tiết đơn thanh toán theo slug
   */
  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<Checkout> {
    return this.checkoutService.findOne(slug);
  }

  /**
   * 🔄 Cập nhật thông tin thanh toán
   */
  @Put(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager', 'staff')
  @RequirePermission('checkout', 'update')
  async update(
    @Param('slug') slug: string,
    @Body() updateData: Partial<CreateCheckoutDto>,
  ): Promise<Checkout> {
    return this.checkoutService.update(slug, updateData);
  }

  /**
   * ✅ Cập nhật trạng thái thanh toán (paid | pending | failed)
   */
  @Put(':slug/payment-status')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager', 'staff')
  @RequirePermission('checkout', 'update')
  async updatePaymentStatus(
    @Param('slug') slug: string,
    @Body('paymentStatus') paymentStatus: 'pending' | 'paid' | 'failed',
  ): Promise<Checkout> {
    return this.checkoutService.updatePaymentStatus(slug, paymentStatus);
  }

  /**
   * ❌ Xoá đơn thanh toán
   */
  @Delete(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('checkout', 'delete')
  async remove(@Param('slug') slug: string): Promise<{ message: string }> {
    return this.checkoutService.remove(slug);
  }
}
