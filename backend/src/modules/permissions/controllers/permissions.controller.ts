import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { PermissionsService } from '../services/permissions.service';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { UpdateUserPermissionsDto } from '../dtos/update-user-permissions.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PermissionGuard } from '../guards/permission.guard';
import { RequirePermission } from '../../../common/decorators/permission.decorator';

@Controller('permissionsapi')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('permissions', 'read')
  async findAll() {
    const permissions = await this.permissionsService.findAll();
    return {
      success: true,
      permissions: permissions.map(p => ({
        id: (p as any).id || (p as any)._id.toString(),
        resource: p.resource,
        action: p.action
      }))
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('permissions', 'create')
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const permission = await this.permissionsService.create(createPermissionDto);
    return {
      success: true,
      permission: {
        id: (permission as any).id || (permission as any)._id.toString(),
        resource: permission.resource,
        action: permission.action
      }
    };
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @RequirePermission('permissions', 'read')
  async getUserPermissions(@Param('userId') userId: string) {
    const permissions = await this.permissionsService.getUserPermissions(userId);
    return {
      success: true,
      permissions: permissions.map(p => ({
        id: p._id.toString(),
        resource: p.resource,
        action: p.action,
        source: p.source
      }))
    };
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