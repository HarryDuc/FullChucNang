// 📁 src/modules/auth/services/metamask-auth.service.ts

import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ethers } from 'ethers';
import { randomBytes } from 'crypto';
import { UsersService } from '../../users/services/users.service';
import { Wallet, WalletDocument } from '../schemas/wallet.schema';
import { MetamaskAuthDto, MetamaskNonceDto, LinkMetamaskDto } from '../dtos/metamask-auth.dto';
import { AuthService } from './auth.service';
import { User } from '../../users/schemas/users.schema';

@Injectable()
export class MetamaskAuthService {
  private readonly logger = new Logger(MetamaskAuthService.name);

  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) { }

  /**
   * 🔢 Generates or retrieves a nonce for a wallet address
   */
  async getNonce(dto: MetamaskNonceDto): Promise<{ success: boolean; message: string; data: { nonce: string } }> {
    try {
      // Check if the address is valid
      if (!ethers.utils.isAddress(dto.address)) {
        throw new BadRequestException('Invalid Ethereum address');
      }

      this.logger.log(`Getting nonce for address: ${dto.address}`);
      const checksumAddress = ethers.utils.getAddress(dto.address);
      let wallet = await this.walletModel.findOne({ address: checksumAddress });

      // Tạo một nonce mới
      const nonce = `Sign this message to authenticate with our service: ${randomBytes(16).toString('hex')}`;

      // Nếu ví đã tồn tại, cập nhật nonce
      if (wallet) {
        this.logger.log(`Updating nonce for existing wallet: ${checksumAddress}`);
        wallet.nonce = nonce;
        await wallet.save();
      } else {
        // Nếu ví chưa tồn tại, tạo một tạm thời (sẽ được lưu sau khi xác thực)
        this.logger.log(`Creating temporary nonce for new wallet: ${checksumAddress}`);
        // Lưu ví tạm thời với nonce này, khi xác thực sẽ gán user sau
        wallet = await this.walletModel.create({
          address: checksumAddress,
          nonce: nonce,
          // Không cần userId vì đây chỉ là tạm thời, sẽ được cập nhật khi xác thực
          // Ví này sẽ được cập nhật hoặc xóa nếu không được xác thực
          isPrimary: false,
        });
      }

      this.logger.log(`Generated nonce for ${checksumAddress}: ${nonce.substring(0, 20)}...`);

      return {
        success: true,
        message: 'Nonce generated successfully',
        data: { nonce }
      };
    } catch (error) {
      this.logger.error(`Error getting nonce: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 🔐 Authenticates a user using MetaMask signature
   */
  async authenticate(dto: MetamaskAuthDto): Promise<any> {
    try {
      // Check if the address is valid
      if (!ethers.utils.isAddress(dto.address)) {
        throw new BadRequestException('Invalid Ethereum address');
      }

      const checksumAddress = ethers.utils.getAddress(dto.address);
      let wallet = await this.walletModel.findOne({ address: checksumAddress });

      // If there's no wallet yet, this is a new user or an attempt to log in without a registered wallet
      if (!wallet) {
        this.logger.log(`🆕 No wallet found for address ${checksumAddress}, creating new user`);
        // Create a new user with this wallet address
        const newUser = await this.usersService.createUser({
          email: `${checksumAddress.toLowerCase()}@metamask.user`,
          password: randomBytes(32).toString('hex'), // Random password since login will be via MetaMask
          role: 'user',
          status: 'active',
        });

        // Create a new wallet document
        wallet = await this.walletModel.create({
          address: checksumAddress,
          userId: newUser._id,
          isPrimary: true,
          nonce: `Sign this message to authenticate with our service: ${randomBytes(16).toString('hex')}`,
        });
      } else if (!wallet.userId) {
        this.logger.log(`🔄 Found temporary wallet without userId for ${checksumAddress}, creating new user`);
        // Trường hợp tìm thấy ví tạm thời (được tạo trong getNonce)
        // Tạo user mới và cập nhật wallet
        const newUser = await this.usersService.createUser({
          email: `${checksumAddress.toLowerCase()}@metamask.user`,
          password: randomBytes(32).toString('hex'), // Random password since login will be via MetaMask
          role: 'user',
          status: 'active',
        });

        // Cập nhật wallet với userId mới và tránh lỗi kiểu dữ liệu
        await this.walletModel.findByIdAndUpdate(
          wallet._id,
          {
            userId: newUser._id,
            isPrimary: true
          }
        );

        this.logger.log(`✅ Updated temporary wallet with new userId for ${checksumAddress}`);
      }

      // Verify the signature
      try {
        this.logger.log(`🔍 Verifying signature for address: ${checksumAddress}`);
        this.logger.log(`🔑 Using nonce: "${wallet.nonce}"`);
        this.logger.log(`📝 Signature: ${dto.signature.substring(0, 20)}...`);

        // Khi ví chưa có nonce hoặc chưa từng được xác thực
        if (!wallet.nonce || wallet.nonce === '') {
          this.logger.log(`⚠️ No existing nonce found for wallet, skipping signature verification`);

          // Tạo nonce mới để sử dụng cho lần xác thực tiếp theo
          const newNonce = `Sign this message to authenticate with our service: ${randomBytes(16).toString('hex')}`;
          wallet.nonce = newNonce;
          await wallet.save();

          this.logger.log(`✅ First-time authentication allowed for ${checksumAddress}`);
        } else {
          // Use ethers to recover the signer from the signature
          const messageHash = ethers.utils.hashMessage(wallet.nonce);

          try {
            const recoveredAddress = ethers.utils.recoverAddress(messageHash, dto.signature);

            this.logger.log(`Signature verification details:
              Expected address: ${checksumAddress.toLowerCase()}
              Recovered address: ${recoveredAddress.toLowerCase()}
              Message used: "${wallet.nonce}"
              Signature length: ${dto.signature.length}
            `);

            if (recoveredAddress.toLowerCase() !== checksumAddress.toLowerCase()) {
              this.logger.error(`❌ Signature verification failed:
                Expected: ${checksumAddress.toLowerCase()}
                Received: ${recoveredAddress.toLowerCase()}
              `);
              throw new UnauthorizedException('Invalid signature. Please try again with the correct nonce.');
            }

            this.logger.log(`✅ Signature verified successfully for ${checksumAddress}`);
          } catch (sigError) {
            // Thử phương pháp xác thực thay thế khi phương pháp chính thất bại
            this.logger.warn(`⚠️ Primary signature verification failed, trying alternative method: ${sigError.message}`);

            // Thử trực tiếp với etherjs
            try {
              const signerAddress = ethers.utils.verifyMessage(wallet.nonce, dto.signature);

              if (signerAddress.toLowerCase() !== checksumAddress.toLowerCase()) {
                this.logger.error(`❌ Alternative signature verification also failed`);
                throw new UnauthorizedException('Invalid signature. Please try again with the correct nonce.');
              }

              this.logger.log(`✅ Alternative signature verification succeeded for ${checksumAddress}`);
            } catch (altError) {
              this.logger.error(`❌ All signature verification methods failed: ${altError.message}`);
              throw new UnauthorizedException(`Signature verification failed: ${altError.message}`);
            }
          }
        }
      } catch (error) {
        this.logger.error(`❌ Error verifying signature: ${error.message}`, error.stack);
        throw new UnauthorizedException(`Signature verification failed: ${error.message}`);
      }

      // Update the nonce after successful authentication
      const newNonce = `Sign this message to authenticate with our service: ${randomBytes(16).toString('hex')}`;
      wallet.nonce = newNonce;
      await wallet.save();

      // Get the user associated with the wallet
      const user = await this.usersService.getUserById(wallet.userId.toString());
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Create token directly using the private method through a workaround:
      // We'll use an internal token without going through the normal login flow
      // This bypasses password verification since we've already verified the MetaMask signature
      const token = await this.generateTokenForUser(user);

      return {
        success: true,
        message: 'MetaMask authentication successful',
        data: {
          token,
          user: {
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            avatar: user.avatar,
            walletAddress: checksumAddress,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Error authenticating with MetaMask: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate a token for a user after MetaMask authentication
   * This is a helper method to generate tokens without using the private AuthService method directly
   */
  private async generateTokenForUser(user: User): Promise<string> {
    try {
      // Create a JWT token with user info
      const payload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        avatar: user.avatar
      };

      // Tạo token trực tiếp sử dụng JwtService
      const token = this.authService['jwtService'].sign(payload);

      // Lưu token vào cơ sở dữ liệu
      await this.authService['tokenModel'].create({
        userId: user._id,
        email: user.email,
        role: user.role,
        token,
        deviceInfo: 'MetaMask Web',
        status: true,
      });

      this.logger.debug(`🔑 Token đã được tạo và lưu cho userId: ${user._id} qua MetaMask`);
      return token;
    } catch (error) {
      this.logger.error(`Error generating token: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 🔗 Links a MetaMask wallet to an existing user account
   */
  async linkWallet(userId: string, dto: LinkMetamaskDto): Promise<any> {
    try {
      // Check if the address is valid
      if (!ethers.utils.isAddress(dto.address)) {
        throw new BadRequestException('Invalid Ethereum address');
      }

      const checksumAddress = ethers.utils.getAddress(dto.address);

      // Check if the wallet is already linked to another account
      const existingWallet = await this.walletModel.findOne({ address: checksumAddress });
      if (existingWallet) {
        throw new BadRequestException('This wallet address is already linked to another account');
      }

      // Check if the user exists
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Create a nonce and verify signature
      const nonce = `Sign this message to link your wallet: ${randomBytes(16).toString('hex')}`;
      const messageHash = ethers.utils.hashMessage(nonce);
      const recoveredAddress = ethers.utils.recoverAddress(messageHash, dto.signature);

      if (recoveredAddress.toLowerCase() !== checksumAddress.toLowerCase()) {
        throw new UnauthorizedException('Invalid signature');
      }

      // Check if the user already has a primary wallet
      const hasPrimaryWallet = await this.walletModel.exists({
        userId: new Types.ObjectId(userId),
        isPrimary: true
      });

      // Create a new wallet document
      const newWallet = await this.walletModel.create({
        address: checksumAddress,
        userId: new Types.ObjectId(userId),
        isPrimary: !hasPrimaryWallet, // Only set as primary if user doesn't have one
        nonce: `Sign this message to authenticate with our service: ${randomBytes(16).toString('hex')}`,
      });

      return {
        success: true,
        message: 'Wallet linked successfully',
        data: {
          walletAddress: checksumAddress,
          isPrimary: newWallet.isPrimary,
        }
      };
    } catch (error) {
      this.logger.error(`Error linking wallet: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 📋 Gets all wallets for a user
   */
  async getUserWallets(userId: string): Promise<{ success: boolean; message: string; data: Wallet[] }> {
    try {
      const wallets = await this.walletModel.find({ userId: new Types.ObjectId(userId) }).exec();
      return {
        success: true,
        message: 'User wallets retrieved successfully',
        data: wallets
      };
    } catch (error) {
      this.logger.error(`Error getting user wallets: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 🚫 Removes a wallet from a user account
   */
  async removeWallet(userId: string, address: string): Promise<{ success: boolean, message: string }> {
    try {
      if (!ethers.utils.isAddress(address)) {
        throw new BadRequestException('Invalid Ethereum address');
      }

      const checksumAddress = ethers.utils.getAddress(address);

      const wallet = await this.walletModel.findOne({
        address: checksumAddress,
        userId: new Types.ObjectId(userId)
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found for this user');
      }

      // Don't allow removing primary wallet if it's the only one
      if (wallet.isPrimary) {
        const walletCount = await this.walletModel.countDocuments({ userId: new Types.ObjectId(userId) });
        if (walletCount <= 1) {
          throw new BadRequestException('Cannot remove the only wallet linked to this account');
        }
      }

      await this.walletModel.deleteOne({ _id: wallet._id });

      return {
        success: true,
        message: 'Wallet removed successfully'
      };
    } catch (error) {
      this.logger.error(`Error removing wallet: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * ⭐ Sets a wallet as the primary wallet for a user
   */
  async setPrimaryWallet(userId: string, address: string): Promise<{ success: boolean, message: string }> {
    try {
      if (!ethers.utils.isAddress(address)) {
        throw new BadRequestException('Invalid Ethereum address');
      }

      const checksumAddress = ethers.utils.getAddress(address);

      // Find the wallet to set as primary
      const wallet = await this.walletModel.findOne({
        address: checksumAddress,
        userId: new Types.ObjectId(userId)
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found for this user');
      }

      // First, unset all wallets as primary
      await this.walletModel.updateMany(
        { userId: new Types.ObjectId(userId) },
        { $set: { isPrimary: false } }
      );

      // Then set this wallet as primary
      wallet.isPrimary = true;
      await wallet.save();

      return {
        success: true,
        message: 'Primary wallet updated successfully'
      };
    } catch (error) {
      this.logger.error(`Error setting primary wallet: ${error.message}`, error.stack);
      throw error;
    }
  }
}