import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { MetamaskPaymentService } from '../services/metamask-payment.service';
import {
  VerifyMetamaskTransactionDto,
  GenerateMetamaskPaymentInfoDto,
} from '../dtos/metamask-payment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('checkoutapi/metamask')
export class MetamaskPaymentController {
  private readonly logger = new Logger(MetamaskPaymentController.name);

  constructor(private readonly metamaskPaymentService: MetamaskPaymentService) { }

  /**
   * Xác nhận giao dịch MetaMask
   */
  @Post(':slug/verify')
  @Public() // Cho phép xác nhận mà không cần xác thực (vì có thể được gọi từ frontend không có token)
  async verifyTransaction(
    @Param('slug') slug: string,
    @Body() verifyDto: VerifyMetamaskTransactionDto,
  ) {
    this.logger.log(`Nhận yêu cầu xác minh giao dịch MetaMask cho ${slug}`);
    this.logger.log(`Thông tin giao dịch: Hash=${verifyDto.transactionHash}, Amount=${verifyDto.amount}, Network=${verifyDto.network || 'BSC'}`);

    // Truyền thêm các thông tin mạng
    return this.metamaskPaymentService.verifyTransaction(
      slug,
      verifyDto.transactionHash,
      verifyDto.amount,
      verifyDto.walletAddress,
      {
        network: verifyDto.network || 'BSC',
        chainId: verifyDto.chainId,
        blockExplorer: verifyDto.blockExplorer
      }
    );
  }

  /**
   * Tạo thông tin thanh toán MetaMask
   */
  @Post(':slug/payment-info')
  @UseGuards(JwtAuthGuard) // Yêu cầu xác thực để tạo thông tin thanh toán
  async generatePaymentInfo(
    @Param('slug') slug: string,
    @Body() generateDto: GenerateMetamaskPaymentInfoDto,
  ) {
    this.logger.log(`Tạo thông tin thanh toán MetaMask cho ${slug}`);
    return this.metamaskPaymentService.generatePaymentInfo(
      slug,
      generateDto.receivingAddress,
    );
  }
}