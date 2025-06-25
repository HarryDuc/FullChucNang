import {
  Controller,
  Post,
  Body,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { VerifyService } from '../services/verify.service';
import { UsersService } from '../../users/services/users.service';
import { VerifyEmailDto, SendVerificationDto } from '../dto/verify.dto';

@Controller('verifysapi')
export class VerifyController {
  constructor(
    private readonly verifyService: VerifyService,
    private readonly userService: UsersService,
  ) {}

  @Post('send')
  async sendVerificationEmail(@Body() dto: SendVerificationDto) {
    console.log('📨 Verification email request received for:', dto.email);
    try {
      await this.verifyService.sendVerificationEmail(dto.email);
      console.log('✅ Verification email sent successfully');
      return {
        success: true,
        message: 'Mã xác thực đã được gửi đến email của bạn',
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('❌ Send verification error:', {
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyDto: VerifyEmailDto) {
    try {
      const isValid = await this.verifyService.verifyEmail(
        verifyDto.email,
        verifyDto.code,
      );
      if (!isValid) {
        throw new BadRequestException(
          'Mã xác thực không hợp lệ hoặc đã hết hạn',
        );
      }

      const user = await this.userService.findByEmail(verifyDto.email);
      if (!user) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      await this.userService.updateUser(user.id, { status: 'active' });

      return {
        success: true,
        message:
          'Xác thực email thành công. Tài khoản của bạn đã được kích hoạt.',
      };
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }
}
