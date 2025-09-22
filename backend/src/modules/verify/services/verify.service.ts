import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VerifyService {
  private verificationCodes: Map<string, { code: string; timestamp: number }> =
    new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) { }

  async sendVerificationEmail(email: string): Promise<void> {
    if (!email) {
      throw new BadRequestException('Email không hợp lệ.');
    }

    try {
      console.log('🚀 Sending verification email to:', email);
      const verificationCode = this.generateVerificationCode();
      console.log('✨ Generated verification code:', verificationCode);

      // Lưu mã với timestamp
      this.verificationCodes.set(email, {
        code: verificationCode,
        timestamp: Date.now(),
      });

      console.log('📧 Sending email...');
      await this.mailerService.sendMail({
        to: email,
        subject: 'Xác thực tài khoản',
        template: './verification',
        context: { verificationCode },
      });

      console.log('✅ Verification email sent successfully to:', email);
    } catch (error: unknown) {
      console.error('❌ Error sending verification email:', error);
      throw new InternalServerErrorException('Gửi email thất bại.');
    }
  }

  async verifyEmail(email: string, code: string): Promise<boolean> {
    if (!email || !code) {
      throw new BadRequestException('Email hoặc mã xác thực không hợp lệ.');
    }

    const storedData = this.verificationCodes.get(email);

    if (!storedData) {
      console.warn('❌ No verification code found for:', email);
      throw new BadRequestException(
        'Mã xác thực không tồn tại hoặc đã hết hạn',
      );
    }

    const isExpired = Date.now() - storedData.timestamp > 5 * 60 * 1000;
    if (isExpired) {
      console.warn('⏳ Verification code expired for:', email);
      this.verificationCodes.delete(email);
      throw new BadRequestException(
        'Mã xác thực đã hết hạn, vui lòng yêu cầu gửi lại mã mới',
      );
    }

    const isValid = storedData.code === code;
    if (!isValid) {
      console.warn('❌ Invalid verification code for:', email);
      throw new BadRequestException(
        'Mã xác thực không chính xác, vui lòng kiểm tra và nhập lại',
      );
    }

    // Xác thực thành công thì xóa mã
    this.verificationCodes.delete(email);
    console.log('✅ Email verified successfully:', email);

    return true;
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 📧 Gửi email chứa cả link và OTP để đặt lại mật khẩu
   */
  async sendPasswordResetEmail(email: string, token: string, otp: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Đặt lại mật khẩu',
      template: 'password-reset-combined',
      context: {
        resetLink,
        otp,
      },
    });
  }
}
