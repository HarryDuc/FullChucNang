export class VietQRConfigDto {
  bankBin: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  template: string;
  active?: boolean;
}

export class UpdateVietQRConfigDto {
  bankBin?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  template?: string;
  active?: boolean;
}