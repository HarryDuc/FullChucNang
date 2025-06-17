import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../services/permissions.service';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
    private jwtService: JwtService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<{ resource: string; action: string }>(
      'permission',
      context.getHandler(),
    );

    if (!requiredPermission) {
      this.logger.debug('No permission required for this route, proceeding...');
      return true;
    }

    const { resource, action } = requiredPermission;
    this.logger.debug(
      `Checking permission: resource=${resource}, action=${action}`,
    );

    const request = context.switchToHttp().getRequest();

    // Kiểm tra JWT token trước
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('Missing or invalid authorization header');
      throw new UnauthorizedException('Authentication required');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Xác thực JWT token
      const user = this.jwtService.verify<JwtPayload>(token);

      // Thêm user vào request để các handler khác có thể sử dụng
      request.user = user;

      const userId = user.userId;
      const userRole = user.role;

      // Admin role always has all permissions
      if (userRole === 'admin') {
        this.logger.debug('User has admin role, access granted');
        return true;
      }

      // Check specific permission using the PermissionsService
      const hasPermission = await this.permissionsService.checkUserPermission(
        userId,
        resource,
        action
      );

      if (hasPermission) {
        this.logger.debug('Permission check passed, access granted');
        return true;
      } else {
        this.logger.warn(
          `Permission denied for user ${userId}: ${resource}:${action}`,
        );
        throw new UnauthorizedException(
          `You don't have permission to ${action} ${resource}`,
        );
      }
    } catch (error) {
      this.logger.error(`Authentication or permission error: ${error.message}`);
      throw new UnauthorizedException('Invalid token or insufficient permissions');
    }
  }
}