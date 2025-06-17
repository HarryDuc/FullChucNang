import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PermissionsService } from '../../modules/permissions/services/permissions.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu không có quy định về role, cho phép truy cập
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    // Kiểm tra xem người dùng có role được yêu cầu hay không
    const hasRequiredRole = requiredRoles.some(role => user.role === role);
    if (hasRequiredRole) {
      return true;
    }

    // Nếu không có role được yêu cầu, kiểm tra xem người dùng có quyền cụ thể không
    try {
      // Lấy resource và action từ route handler (path và method)
      const request = context.switchToHttp().getRequest();
      const path = request.route.path;
      const method = request.method;

      // Xác định resource và action từ path và method
      const resourceAction = this.mapPathMethodToResourceAction(path, method);

      if (resourceAction) {
        // Kiểm tra xem người dùng có quyền tương ứng không
        const hasPermission = await this.permissionsService.checkUserPermission(
          user.userId,
          resourceAction.resource,
          resourceAction.action
        );

        return hasPermission;
      }
    } catch (error) {
      console.error('Error checking user permissions:', error);
    }

    return false;
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
