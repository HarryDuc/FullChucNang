import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { VietQRConfigService } from '../services/vietqr-config.service';
import { VietQRConfigDto, UpdateVietQRConfigDto } from '../dtos/vietqr-config.dto';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionGuard } from 'src/modules/permissions/guards/permission.guard';

@Controller('vietqr-configsapi')
export class VietQRConfigController {
  constructor(private readonly vietQRConfigService: VietQRConfigService) { }

  @Get()
  async getActiveConfig() {
    return this.vietQRConfigService.getConfig();
  }

  @Get('all')
  async getAllConfigs() {
    return this.vietQRConfigService.getAllConfigs();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('vietqr-config', 'create')
  async createConfig(@Body() config: VietQRConfigDto) {
    return this.vietQRConfigService.createConfig(config);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('vietqr-config', 'update')
  async updateConfig(
    @Param('id') id: string,
    @Body() config: UpdateVietQRConfigDto,
  ) {
    return this.vietQRConfigService.updateConfig(id, config);
  }

  @Put(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('vietqr-config', 'update')
  async setActive(@Param('id') id: string) {
    return this.vietQRConfigService.setActive(id);
  }
}