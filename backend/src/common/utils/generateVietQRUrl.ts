import { VietQRConfigService } from '../../modules/vietqr/services/vietqr-config.service';

export async function generateVietQRUrl(
  amount: number,
  orderCode: string,
  vietQRConfigService: VietQRConfigService,
): Promise<string> {
  const config = await vietQRConfigService.getConfig();

  if (!config) {
    throw new Error(
      '❌ Chưa cấu hình VietQR. Vui lòng thiết lập cấu hình trước.',
    );
  }

  const { bankBin, accountNumber, accountName, template } = config;
  const addInfo = `${orderCode}`;
  const encodedAccountName = encodeURIComponent(accountName);
  const encodedAddInfo = encodeURIComponent(addInfo);

  return `https://api.vietqr.io/image/${bankBin}-${accountNumber}-${template}.jpg?amount=${amount}&accountName=${encodedAccountName}&addInfo=${encodedAddInfo}`;
}
