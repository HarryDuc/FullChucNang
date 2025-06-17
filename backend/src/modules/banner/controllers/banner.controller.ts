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
import { BannerService } from '../services/banner.service';
import { CreateBannerDto, UpdateBannerDto, UpdateBannerOrderDto } from '../dtos/banner.dto';
import { Banner } from '../schemas/banner.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PermissionGuard } from '../../permissions/guards/permission.guard';
import { RequirePermission } from '../../../common/decorators/permission.decorator';

@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('banner', 'create')
  async create(@Body() createBannerDto: CreateBannerDto): Promise<Banner> {
    return this.bannerService.create(createBannerDto);
  }

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<Banner[]> {
    return this.bannerService.findAll(type, isActive);
  }

  @Get('active/:type')
  async getActiveBannersByType(@Param('type') type: string): Promise<Banner[]> {
    return this.bannerService.getActiveBannersByType(type);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Banner> {
    return this.bannerService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('banner', 'update')
  async update(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
  ): Promise<Banner> {
    return this.bannerService.update(id, updateBannerDto);
  }

  @Patch(':id/order')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('banner', 'update')
  async updateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateBannerOrderDto,
  ): Promise<Banner> {
    return this.bannerService.updateOrder(id, updateOrderDto);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('banner', 'activate')
  async toggleActive(@Param('id') id: string): Promise<Banner> {
    return this.bannerService.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('banner', 'delete')
  async remove(@Param('id') id: string): Promise<Banner> {
    return this.bannerService.remove(id);
  }
}