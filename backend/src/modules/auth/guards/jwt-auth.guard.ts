import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

// Định nghĩa kiểu payload của JWT
interface JwtPayload {
  userId: string; // Đổi từ "id" thành "userId"
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// Định nghĩa kiểu Request có user
interface RequestWithUser extends Request {
  user?: JwtPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    // Kiểm tra xem route có được đánh dấu là public không
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.log('🔓 Public route, skipping JWT check');
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('⚠️ Không tìm thấy token hoặc sai định dạng.');
      throw new UnauthorizedException('Token không hợp lệ hoặc thiếu');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify<JwtPayload>(token);
      request.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
      // Lưu user vào request để các middleware/controller khác có thể sử dụng
      this.logger.log(`✅ Xác thực thành công: ID ${decoded.userId}`);

      return true;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`❌ Lỗi xác thực token: ${error.message}`);
      } else {
        this.logger.error(`❌ Lỗi xác thực token: Không xác định`);
      }
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
