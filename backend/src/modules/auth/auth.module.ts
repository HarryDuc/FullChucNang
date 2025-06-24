// src/modules/auth/auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UsersModule } from '../users/users.module';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenModule } from './token.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/users.schema';
import { GoogleStrategy } from './strategies/google.strategy';
import { VerifyModule } from '../verify/verify.module';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ManagerPermissionsModule } from '../manager-permissions/manager-permissions.module';
import { Auth, AuthSchema } from './schemas/auth.schema';
import { MetamaskAuthService } from './services/metamask-auth.service';
import { MetamaskAuthController } from './controllers/metamask-auth.controller';
import { Wallet, WalletSchema } from './schemas/wallet.schema';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => VerifyModule),
    forwardRef(() => PermissionsModule), // Sử dụng forwardRef để tránh circular dependency
    forwardRef(() => ManagerPermissionsModule), // Add ManagerPermissionsModule with forwardRef
    TokenModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1d',
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: Auth.name, schema: AuthSchema },
      { name: Wallet.name, schema: WalletSchema }, // Add WalletSchema for MetaMask authentication
    ]),
  ],
  controllers: [AuthController, MetamaskAuthController], // Add MetamaskAuthController
  providers: [
    AuthService,
    TokenService,
    JwtStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    MetamaskAuthService, // Add MetamaskAuthService
  ],
  exports: [AuthService, TokenService, JwtStrategy, JwtModule, JwtAuthGuard, MetamaskAuthService], // Export MetamaskAuthService
})
export class AuthModule { }
