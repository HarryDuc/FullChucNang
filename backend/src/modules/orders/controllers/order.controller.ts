import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto, UpdateOrderDto } from '../dtos/order.dto';
import { Order } from '../schemas/order.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PermissionGuard } from 'src/modules/permissions/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { Public } from 'src/common/decorators/public.decorator';

/**
 * OrderController định nghĩa các endpoint cho thao tác CRUD trên đơn hàng.
 * - Sử dụng slug làm định danh duy nhất thay vì _id.
 */
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  /**
   * Tạo mới đơn hàng.
   * Endpoint: POST /orders
   * @param createOrderDto - DTO chứa dữ liệu đơn hàng.
   * @returns Order - Đơn hàng đã được tạo.
   */
  @Post()
  @Public()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.create(createOrderDto);
  }

  /**
   * Lấy danh sách tất cả các đơn hàng.
   * Endpoint: GET /orders
   * @returns Mảng Order.
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager', 'staff')
  @RequirePermission('orders', 'read')
  async findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  /**
   * Lấy thông tin đơn hàng theo slug.
   * Endpoint: GET /orders/:slug
   * @param slug - Định danh duy nhất của đơn hàng.
   * @returns Order tương ứng.
   */
  @Get(':slug')
  @Public()
  async findOne(@Param('slug') slug: string): Promise<Order> {
    return this.orderService.findOne(slug);
  }

  /**
   * Cập nhật thông tin đơn hàng theo slug.
   * Endpoint: PUT /orders/:slug
   * @param slug - Định danh của đơn hàng.
   * @param updateOrderDto - DTO chứa dữ liệu cập nhật.
   * @returns Order đã được cập nhật.
   */
  @Put(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager', 'staff')
  @RequirePermission('orders', 'update')
  async update(
    @Param('slug') slug: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.orderService.update(slug, updateOrderDto);
  }

  /**
   * Cập nhật trạng thái đơn hàng.
   * Endpoint: PUT /orders/:slug/status
   * @param slug - Định danh của đơn hàng.
   * @param status - Trạng thái mới của đơn hàng.
   * @returns Order đã được cập nhật.
   */
  @Put(':slug/status')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager', 'staff')
  @RequirePermission('orders', 'update')
  async updateStatus(
    @Param('slug') slug: string,
    @Body('status') status: string,
  ): Promise<Order> {
    return this.orderService.update(slug, { status });
  }

  /**
   * Xóa đơn hàng theo slug.
   * Endpoint: DELETE /orders/:slug
   * @param slug - Định danh của đơn hàng.
   * @returns Thông báo xác nhận xóa.
   */
  @Delete(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('orders', 'delete')
  async remove(@Param('slug') slug: string): Promise<{ message: string }> {
    return this.orderService.remove(slug);
  }

  /**
   * Cập nhật thông tin thanh toán cho đơn hàng.
   * Endpoint: POST /orders/:slug/update-payment-status
   * @param slug - Định danh của đơn hàng.
   * @param paymentInfo - Thông tin thanh toán.
   * @returns Order đã được cập nhật.
   */
  @Post(':slug/update-payment-status')
  @Public()
  async updatePaymentStatus(
    @Param('slug') slug: string,
    @Body() paymentInfo: any,
  ): Promise<Order> {
    return this.orderService.updatePaymentStatus(slug, paymentInfo);
  }
}
