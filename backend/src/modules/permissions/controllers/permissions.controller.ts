import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { PermissionsService } from '../services/permissions.service';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { UpdateUserPermissionsDto } from '../dtos/update-user-permissions.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PermissionGuard } from '../guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('permissions', 'read')
  async getAllPermissions() {
    return await this.permissionsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('permissions', 'create')
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return await this.permissionsService.create(createPermissionDto);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('permissions', 'read')
  async getUserPermissions(@Param('userId') userId: string) {
    try {
      console.log('Getting permissions for user:', userId);
      return await this.permissionsService.getUserPermissions(userId);
    } catch (error) {
      console.error('Error getting user permissions:', error);
      throw error;
    }
  }

  @Put('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('permissions', 'update')
  async updateUserPermissions(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserPermissionsDto
  ) {
    try {
      console.log('Updating permissions for user:', userId);
      console.log('With data:', updateDto);
      return await this.permissionsService.updateUserPermissions({
        userId,
        permissionIds: updateDto.permissionIds
      });
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  }

  @Post('initialize')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('permissions', 'create')
  async initializeDefaultPermissions() {
    return await this.permissionsService.initializeDefaultPermissions();
  }

  @Post('admin/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('permissions', 'update')
  async assignAllPermissionsToAdmin(@Param('userId') userId: string) {
    try {
      console.log('Assigning all permissions to admin user:', userId);

      // First, ensure all permissions are initialized
      await this.permissionsService.initializeDefaultPermissions();

      // Get all permissions and assign them to the user
      const allPermissions = await this.permissionsService.findAll();
      const permissionIds = allPermissions.map(p => (p as any)._id.toString());

      return await this.permissionsService.updateUserPermissions({
        userId,
        permissionIds
      });
    } catch (error) {
      console.error('Error assigning admin permissions:', error);
      throw error;
    }
  }
}