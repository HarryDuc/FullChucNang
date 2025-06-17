import { Injectable } from '@nestjs/common';
import { generateVietQRUrl } from '../../../common/utils/generateVietQRUrl';
import { VietQRConfigService } from 'src/modules/vietqr/services/vietqr-config.service';

@Injectable()
export class BankTransferService {
  constructor(private readonly vietQRConfigService: VietQRConfigService) { }

  async generateTransferInfo(orderCode: string, amount: number) {
    const config = await this.vietQRConfigService.getConfig();
    if (!config) {
      throw new Error('❌ Chưa cấu hình VietQR. Vui lòng thiết lập cấu hình trước.');
    }

    const qrImageUrl = await generateVietQRUrl(amount, orderCode, this.vietQRConfigService);

    return {
      qrImageUrl,
      bankName: config.bankName,
      accountNumber: config.accountNumber,
      accountName: config.accountName,
      amount,
      note: orderCode,
    };
  }
}
