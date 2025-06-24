import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

/**
 * DTO cho yêu cầu xác minh giao dịch MetaMask
 */
export class VerifyMetamaskTransactionDto {
  @IsNotEmpty()
  @IsString()
  transactionHash: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  walletAddress: string;

  @IsOptional()
  @IsString()
  network?: string;

  @IsOptional()
  chainId?: number | string;

  @IsOptional()
  @IsString()
  blockExplorer?: string;
}

/**
 * DTO cho yêu cầu tạo thông tin thanh toán MetaMask
 */
export class GenerateMetamaskPaymentInfoDto {
  @IsNotEmpty()
  @IsString()
  receivingAddress: string;

  @IsOptional()
  @IsString()
  currency?: string = 'BNB';

  @IsOptional()
  @IsString()
  network?: string = 'BSC';

  @IsOptional()
  @IsString()
  chainId?: string;
}