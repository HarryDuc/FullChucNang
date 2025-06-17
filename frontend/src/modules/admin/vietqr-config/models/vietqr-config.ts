export interface VietQRConfig {
  _id: string;
  bankBin: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  template: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVietQRConfigDto {
  bankBin: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  template: string;
  active?: boolean;
}

export interface UpdateVietQRConfigDto {
  bankBin?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  template?: string;
  active?: boolean;
}