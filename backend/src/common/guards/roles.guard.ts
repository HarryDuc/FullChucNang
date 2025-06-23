import { Injectable, CanActivate, ExecutionContext, forwardRef, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PermissionsService } from '../../modules/permissions/services/permissions.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth } from '../../modules/auth/schemas/auth.schema';
import { getModelToken } from '@nestjs/mongoose';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
    @Inject(getModelToken(Auth.name)) private authModel: Model<Auth>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    // If user has admin role, allow access
    if (user.role === 'admin') {
      return true;
    }

    // Get resource and action from route handler
    const request = context.switchToHttp().getRequest();
    const path = request.route.path;
    const method = request.method;

    // Map path and method to resource and action
    const resourceAction = this.mapPathMethodToResourceAction(path, method);
    if (!resourceAction) {
      return false;
    }

    try {
      // Always check permissions regardless of role type
      const hasPermission = await this.permissionsService.checkUserPermission(
        user.userId,
        resourceAction.resource,
        resourceAction.action
      );

      return hasPermission;
    } catch (error) {
      console.error('Error checking user permissions:', error);
      return false;
    }
  }

  /**
   * Ánh xạ path và method của request đến resource và action tương ứng
   */
  private mapPathMethodToResourceAction(path: string, method: string): { resource: string; action: string } | null {
    // Trích xuất resource từ path
    const pathSegments = path.split('/').filter(segment => segment !== '');
    if (pathSegments.length === 0) return null;

    let resource = pathSegments[0];
    // Xóa "api" nếu có
    resource = resource.replace(/api$/i, '');

    // Mapping từ HTTP method sang action
    let action: string;
    switch (method.toUpperCase()) {
      case 'GET':
        action = pathSegments.length > 1 ? 'read' : 'list';
        break;
      case 'POST':
        action = 'create';
        break;
      case 'PUT':
      case 'PATCH':
        action = 'update';
        break;
      case 'DELETE':
        action = 'delete';
        break;
      default:
        return null;
    }

    // Xử lý các trường hợp đặc biệt
    if (path.includes('/activate') || path.includes('/toggle-active')) {
      action = 'activate';
    } else if (path.includes('/deactivate')) {
      action = 'deactivate';
    } else if (path.includes('/publish')) {
      action = 'publish';
    } else if (path.includes('/unpublish')) {
      action = 'unpublish';
    }

    return { resource, action };
  }
}
