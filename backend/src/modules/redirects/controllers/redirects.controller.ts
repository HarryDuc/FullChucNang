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
import { RedirectsService } from '../services/redirects.service';
import { CreateRedirectDto, UpdateRedirectDto } from '../dtos/redirect.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PermissionGuard } from 'src/modules/permissions/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';

@Controller('redirectsapi')
export class RedirectsController {
  constructor(private readonly redirectsService: RedirectsService) {}

  /**
   * Tạo một redirect mới
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('redirects', 'create')
  create(@Body() createRedirectDto: CreateRedirectDto) {
    return this.redirectsService.create(createRedirectDto);
  }

  /**
   * Tạo nhiều redirect cùng lúc
   */
  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('redirects', 'create')
  createBulk(@Body() redirects: CreateRedirectDto[]) {
    return this.redirectsService.createBulk(redirects);
  }

  /**
   * Lấy danh sách tất cả redirect (có phân trang và lọc)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('redirects', 'read')
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
    @Query('path') path?: string,
    @Query('statusCode') statusCode?: string,
  ) {
    return this.redirectsService.findAll(
      parseInt(page, 10),
      parseInt(limit, 10),
      type,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      path,
      statusCode ? parseInt(statusCode, 10) : undefined,
    );
  }

  /**
   * Kiểm tra một đường dẫn redirect (API để test)
   */
  @Get('check')
  checkRedirect(@Query('path') path: string) {
    if (!path) {
      return { message: 'Không tìm thấy đường dẫn redirect' };
    }
    return this.redirectsService.findRedirectByPath(path);
  }

  /**
   * Lấy thông tin chi tiết redirect theo ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('redirects', 'read')
  findOne(@Param('id') id: string) {
    return this.redirectsService.findOne(id);
  }

  /**
   * Cập nhật thông tin redirect
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('redirects', 'update')
  update(@Param('id') id: string, @Body() updateRedirectDto: UpdateRedirectDto) {
    return this.redirectsService.update(id, updateRedirectDto);
  }

  /**
   * Xóa redirect
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('redirects', 'delete')
  remove(@Param('id') id: string) {
    return this.redirectsService.remove(id);
  }
} 