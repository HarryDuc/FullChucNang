import { Module, forwardRef } from '@nestjs/common';
import { VerifyService } from './services/verify.service';
import { VerifyController } from './controller/verify.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MailerModule,
    forwardRef(() => UsersModule)
  ],
  controllers: [VerifyController],
  providers: [VerifyService],
  exports: [VerifyService],
})
export class VerifyModule { }
