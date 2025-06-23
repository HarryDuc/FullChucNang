import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../services/permissions.service';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { Auth } from '../../auth/schemas/auth.schema';
import { RoleService } from '../../manager-permissions/services/role.service';
import { getModelToken } from '@nestjs/mongoose';

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
    private jwtService: JwtService,
    @Inject(getModelToken(Auth.name)) private authModel: Model<Auth>,
    @Inject(forwardRef(() => RoleService)) private roleService: RoleService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredResource = this.reflector.get<string>('resource', context.getHandler());
    const requiredAction = this.reflector.get<string>('action', context.getHandler());

    if (!requiredResource || !requiredAction) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      console.debug('[PermissionGuard] No user ID found in request');
      return false;
    }

    // Check if user has admin role
    if (request.user?.role === 'admin') {
      console.debug('[PermissionGuard] User has admin role, access granted');
      return true;
    }

    // Check both direct and role-based permissions
    const hasPermission = await this.permissionsService.checkUserPermission(
      userId,
      requiredResource,
      requiredAction
    );

    console.debug(`[PermissionGuard] Checking permission: resource=${requiredResource}, action=${requiredAction}, result=${hasPermission}`);
    return hasPermission;
  }
}