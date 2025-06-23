import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Permission, PermissionDocument } from '../schemas/permission.schema';
import { UserPermission, UserPermissionDocument } from '../schemas/user-permission.schema';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { UpdateUserPermissionsDto } from '../dtos/update-user-permissions.dto';
import { RolePermission } from '../../manager-permissions/schemas/role-permission.schema';
import { User } from '../../users/schemas/users.schema';

export interface PermissionWithSource {
  _id: Types.ObjectId;
  source: 'direct' | 'role';
  resource: string;
  action: string;
}

interface PopulatedPermission {
  _id: Types.ObjectId;
  resource: string;
  action: string;
}

interface PopulatedUserPermission {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  permissionId: PopulatedPermission;
}

interface PopulatedRolePermission {
  _id: Types.ObjectId;
  roleId: Types.ObjectId;
  permissionId: PopulatedPermission;
}

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    @InjectModel(UserPermission.name) private userPermissionModel: Model<UserPermissionDocument>,
    @InjectModel(RolePermission.name) private rolePermissionModel: Model<RolePermission>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) { }

  async findAll(): Promise<Permission[]> {
    return this.permissionModel.find().exec();
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const createdPermission = new this.permissionModel(createPermissionDto);
    return createdPermission.save();
  }

  async getUserPermissions(userId: string): Promise<PermissionWithSource[]> {
    try {
      const objectId = new Types.ObjectId(userId);
      console.log('Getting permissions for userId:', objectId.toString());

      // Get user's direct permissions
      const userPermissions = await this.userPermissionModel
        .find({ userId: objectId })
        .populate<{ permissionId: PopulatedPermission }>('permissionId')
        .lean<PopulatedUserPermission[]>()
        .exec();

      // Get user's role and role permissions
      const user = await this.userModel.findById(objectId).lean().exec();
      console.log('Found user:', user);

      let rolePermissions: PopulatedRolePermission[] = [];
      if (user?.roleId) {
        rolePermissions = await this.rolePermissionModel
          .find({ roleId: user.roleId })
          .populate<{ permissionId: PopulatedPermission }>('permissionId')
          .lean<PopulatedRolePermission[]>()
          .exec();
        console.log('Found role permissions:', rolePermissions);
      }

      // Combine and deduplicate permissions
      const allPermissions = [
        ...userPermissions.map(up => ({
          _id: up.permissionId._id,
          resource: up.permissionId.resource,
          action: up.permissionId.action,
          source: 'direct' as const
        })),
        ...rolePermissions.map(rp => ({
          _id: rp.permissionId._id,
          resource: rp.permissionId.resource,
          action: rp.permissionId.action,
          source: 'role' as const
        }))
      ];

      // Remove duplicates based on permission ID
      const uniquePermissions = allPermissions.filter((permission, index, self) =>
        index === self.findIndex((p) => p._id.toString() === permission._id.toString())
      );

      console.log('Combined unique permissions:', uniquePermissions);
      return uniquePermissions;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      throw error;
    }
  }

  async checkUserPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const allPermissions = await this.getUserPermissions(userId);

      // Check if any permission matches the required resource and action
      const hasPermission = allPermissions.some(permission =>
        permission.resource === resource && permission.action === action
      );

      console.log(`Checking permission for ${resource}:${action} - Result: ${hasPermission}`);
      return hasPermission;
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }

  async updateUserPermissions(updateDto: UpdateUserPermissionsDto): Promise<UserPermission[]> {
    try {
      const userId = new Types.ObjectId(updateDto.userId);
      const permissionIds = updateDto.permissionIds.map(id => new Types.ObjectId(id));

      console.log('Updating permissions for user:', userId.toString());
      console.log('New permission IDs:', permissionIds.map(id => id.toString()));

      // Delete all existing permissions for the user
      await this.userPermissionModel.deleteMany({ userId });

      if (permissionIds.length > 0) {
        // Create new permissions
        const userPermissions = permissionIds.map(permissionId => ({
          userId,
          permissionId,
        }));

        // Insert new permissions
        await this.userPermissionModel.insertMany(userPermissions);
      }

      // Return updated permissions with populated data
      const updatedPermissions = await this.userPermissionModel
        .find({ userId })
        .populate('permissionId')
        .exec();

      console.log('Updated permissions:', updatedPermissions);
      return updatedPermissions;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  }

  async initializeDefaultPermissions(): Promise<void> {
    const defaultPermissions = [
      // Banner Permissions
      { resource: 'banner', action: 'create' },
      { resource: 'banner', action: 'read' },
      { resource: 'banner', action: 'update' },
      { resource: 'banner', action: 'delete' },
      { resource: 'banner', action: 'activate' },

      // Categories Post Permissions
      { resource: 'categories-post', action: 'create' },
      { resource: 'categories-post', action: 'read' },
      { resource: 'categories-post', action: 'update' },
      { resource: 'categories-post', action: 'delete' },
      { resource: 'categories-post', action: 'list' },
      { resource: 'categories-post', action: 'publish' },
      { resource: 'categories-post', action: 'unpublish' },

      // Categories Product Permissions
      { resource: 'categories-product', action: 'create' },
      { resource: 'categories-product', action: 'read' },
      { resource: 'categories-product', action: 'update' },
      { resource: 'categories-product', action: 'delete' },

      // Checkout Permissions
      { resource: 'checkout', action: 'create' },
      { resource: 'checkout', action: 'read' },
      { resource: 'checkout', action: 'update' },
      { resource: 'checkout', action: 'delete' },

      // Contact Permissions
      { resource: 'contact', action: 'create' },
      { resource: 'contact', action: 'read' },
      { resource: 'contact', action: 'list' },
      { resource: 'contact', action: 'delete' },

      // Pages Permissions
      { resource: 'pages', action: 'create' },
      { resource: 'pages', action: 'read' },
      { resource: 'pages', action: 'update' },
      { resource: 'pages', action: 'delete' },

      // Images Permissions
      { resource: 'images', action: 'create' },
      { resource: 'images', action: 'read' },
      { resource: 'images', action: 'delete' },

      // Info Website Permissions
      { resource: 'info-website', action: 'create' },
      { resource: 'info-website', action: 'read' },
      { resource: 'info-website', action: 'update' },
      { resource: 'info-website', action: 'delete' },
      { resource: 'info-website', action: 'activate' },

      // Orders Permissions
      { resource: 'orders', action: 'create' },
      { resource: 'orders', action: 'read' },
      { resource: 'orders', action: 'update' },
      { resource: 'orders', action: 'delete' },

      // Permissions for Permissions Management
      { resource: 'permissions', action: 'create' },
      { resource: 'permissions', action: 'read' },
      { resource: 'permissions', action: 'update' },
      { resource: 'permissions', action: 'delete' },

      // Manager Permissions
      { resource: 'manager-permissions', action: 'create' },
      { resource: 'manager-permissions', action: 'read' },
      { resource: 'manager-permissions', action: 'update' },
      { resource: 'manager-permissions', action: 'delete' },

      // Posts Permissions
      { resource: 'posts', action: 'create' },
      { resource: 'posts', action: 'read' },
      { resource: 'posts', action: 'update' },
      { resource: 'posts', action: 'delete' },
      { resource: 'posts', action: 'list' },
      { resource: 'posts', action: 'publish' },
      { resource: 'posts', action: 'unpublish' },
      { resource: 'posts', action: 'feature' },
      { resource: 'posts', action: 'unfeature' },
      { resource: 'posts', action: 'approve' },
      { resource: 'posts', action: 'reject' },
      { resource: 'posts', action: 'export' },

      // Products Permissions
      { resource: 'products', action: 'create' },
      { resource: 'products', action: 'read' },
      { resource: 'products', action: 'update' },
      { resource: 'products', action: 'delete' },

      // Reviews Permissions (no specific permissions in controller but assuming standard CRUD)
      { resource: 'reviews', action: 'create' },
      { resource: 'reviews', action: 'read' },
      { resource: 'reviews', action: 'update' },
      { resource: 'reviews', action: 'delete' },

      // Script Permissions
      { resource: 'script', action: 'create' },
      { resource: 'script', action: 'read' },
      { resource: 'script', action: 'update' },
      { resource: 'script', action: 'delete' },

      // Users Permissions
      { resource: 'users', action: 'create' },
      { resource: 'users', action: 'read' },
      { resource: 'users', action: 'update' },
      { resource: 'users', action: 'delete' },
      { resource: 'users', action: 'list' },
      { resource: 'users', action: 'activate' },
      { resource: 'users', action: 'deactivate' },
      { resource: 'users', action: 'change-role' },
      { resource: 'users', action: 'reset-password' },

      // VietQR Config Permissions
      { resource: 'vietqr-config', action: 'create' },
      { resource: 'vietqr-config', action: 'read' },
      { resource: 'vietqr-config', action: 'update' },
      { resource: 'vietqr-config', action: 'delete' },

      // Vouchers Permissions
      { resource: 'vouchers', action: 'create' },
      { resource: 'vouchers', action: 'read' },
      { resource: 'vouchers', action: 'update' },
      { resource: 'vouchers', action: 'delete' },
    ];

    for (const permission of defaultPermissions) {
      const exists = await this.permissionModel.findOne(permission);
      if (!exists) {
        await this.create(permission);
      }
    }
  }
}
