import api from '@/common/utils/api';

export interface Permission {
  id: string;
  resource: string;
  action: string;
}

export interface UserPermission {
  permissionId: Permission;
  userId: string;
}

export class PermissionService {
  private static instance: PermissionService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL + '/permissions';
  }

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async initializePermissions(): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/initialize`, {}, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Error initializing permissions:', error);
      throw error;
    }
  }

  async getAllPermissions(): Promise<Permission[]> {
    try {
      // First try to initialize permissions
      try {
        await this.initializePermissions();
      } catch (initError) {
        console.warn('Permission initialization failed, might already be initialized:', initError);
      }

      // Then get all permissions
      const response = await api.get(`${this.baseUrl}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  }

  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    try {
      const response = await api.get(`${this.baseUrl}/user/${userId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  }

  async updateUserPermissions(userId: string, permissionIds: string[]): Promise<UserPermission[]> {
    try {
      const response = await api.put(
        `${this.baseUrl}/user/${userId}`,
        {
          userId,
          permissionIds
        },
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  }

  async assignAllPermissionsToUser(userId: string): Promise<UserPermission[]> {
    try {
      const response = await api.post(
        `${this.baseUrl}/admin/${userId}`,
        {},
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning all permissions to user:', error);
      throw error;
    }
  }
}