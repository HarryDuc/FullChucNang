// 📁 src/modules/auth/controllers/metamask-auth.controller.ts

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { MetamaskAuthService } from '../services/metamask-auth.service';
import { MetamaskNonceDto, MetamaskAuthDto, LinkMetamaskDto } from '../dtos/metamask-auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

// Interface for request with user
interface RequestWithUser extends Request {
  user: {
    userId: string;
    email?: string;
    role?: string;
  };
}

@Controller('auth/metamask')
export class MetamaskAuthController {
  private readonly logger = new Logger(MetamaskAuthController.name);

  constructor(private readonly metamaskAuthService: MetamaskAuthService) { }

  /**
   * 🔢 Get a nonce to sign with MetaMask
   */
  @Post('nonce')
  async getNonce(@Body() dto: MetamaskNonceDto) {
    this.logger.log(`🔢 Getting nonce for address: ${dto.address}`);
    return this.metamaskAuthService.getNonce(dto);
  }

  /**
   * 🔐 Authenticate with MetaMask
   */
  @Post('authenticate')
  async authenticate(@Body() dto: MetamaskAuthDto) {
    try {
      this.logger.log(`🔐 Authenticating with MetaMask for address: ${dto.address}`);
      this.logger.debug(`Signature length: ${dto.signature.length}, first chars: ${dto.signature.substring(0, 10)}...`);

      const result = await this.metamaskAuthService.authenticate(dto);
      this.logger.log(`✅ Authentication successful for address: ${dto.address}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Authentication failed for address: ${dto.address}`, error.stack);
      throw error;
    }
  }

  /**
   * 🔗 Link a MetaMask wallet to the current user account
   */
  @Post('link')
  @UseGuards(JwtAuthGuard)
  async linkWallet(@Request() req: RequestWithUser, @Body() dto: LinkMetamaskDto) {
    const userId = req.user.userId;
    this.logger.log(`🔗 Linking wallet address ${dto.address} to user ${userId}`);
    return this.metamaskAuthService.linkWallet(userId, dto);
  }

  /**
   * 📋 Get all wallets for the current user
   */
  @Get('wallets')
  @UseGuards(JwtAuthGuard)
  async getUserWallets(@Request() req: RequestWithUser) {
    const userId = req.user.userId;
    this.logger.log(`📋 Getting wallets for user ${userId}`);
    return this.metamaskAuthService.getUserWallets(userId);
  }

  /**
   * 🚫 Remove a wallet from the current user account
   */
  @Delete('wallets/:address')
  @UseGuards(JwtAuthGuard)
  async removeWallet(@Request() req: RequestWithUser, @Param('address') address: string) {
    const userId = req.user.userId;
    this.logger.log(`🚫 Removing wallet ${address} from user ${userId}`);
    return this.metamaskAuthService.removeWallet(userId, address);
  }

  /**
   * ⭐ Set a wallet as the primary wallet for the current user
   */
  @Post('wallets/:address/primary')
  @UseGuards(JwtAuthGuard)
  async setPrimaryWallet(@Request() req: RequestWithUser, @Param('address') address: string) {
    const userId = req.user.userId;
    this.logger.log(`⭐ Setting ${address} as primary wallet for user ${userId}`);
    return this.metamaskAuthService.setPrimaryWallet(userId, address);
  }
}