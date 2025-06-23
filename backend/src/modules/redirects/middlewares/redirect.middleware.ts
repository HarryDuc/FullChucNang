import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedirectsService } from '../services/redirects.service';

@Injectable()
export class RedirectMiddleware implements NestMiddleware {
  constructor(private readonly redirectsService: RedirectsService) {}

  /**
   * Middleware xử lý kiểm tra và chuyển hướng các URL
   */
  async use(req: Request, res: Response, next: NextFunction) {
    // Chỉ xử lý với các request GET
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Trích xuất đường dẫn từ URL (không gồm query params)
      const path = req.originalUrl.split('?')[0];
      
      // Kiểm tra trong database xem có redirect nào phù hợp không
      const redirect = await this.redirectsService.findRedirectByPath(path);
      
      // Nếu có redirect và đang active, thực hiện chuyển hướng
      if (redirect && redirect.isActive) {
        // Lấy query params từ request gốc (nếu có)
        const queryParams = req.originalUrl.includes('?') 
          ? req.originalUrl.split('?')[1] 
          : '';
        
        // Tạo URL đích với query params nếu có
        const targetUrl = queryParams 
          ? `${redirect.newPath}?${queryParams}` 
          : redirect.newPath;
          
        // Thực hiện redirect với mã trạng thái thích hợp
        return res.redirect(redirect.statusCode, targetUrl);
      }
    } catch (error) {
      console.error('Lỗi xử lý redirect:', error);
    }
    
    // Nếu không có redirect hoặc có lỗi, tiếp tục xử lý request bình thường
    return next();
  }
} 