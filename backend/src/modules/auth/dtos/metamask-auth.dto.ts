import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 🦊 **DTO for MetaMask Nonce Request**
 * Used to request a nonce for the wallet address to sign
 */
export class MetamaskNonceDto {
  @IsNotEmpty({ message: 'Wallet address is required' })
  @IsString({ message: 'Wallet address must be a string' })
  address: string;
}

/**
 * 🦊 **DTO for MetaMask Authentication**
 * Used when the user signs the message with their MetaMask wallet
 */
export class MetamaskAuthDto {
  @IsNotEmpty({ message: 'Wallet address is required' })
  @IsString({ message: 'Wallet address must be a string' })
  address: string;

  @IsNotEmpty({ message: 'Signature is required' })
  @IsString({ message: 'Signature must be a string' })
  signature: string;
}

/**
 * 🦊 **DTO for MetaMask Account Linking**
 * Used when linking a MetaMask wallet to an existing account
 */
export class LinkMetamaskDto {
  @IsNotEmpty({ message: 'Wallet address is required' })
  @IsString({ message: 'Wallet address must be a string' })
  address: string;

  @IsNotEmpty({ message: 'Signature is required' })
  @IsString({ message: 'Signature must be a string' })
  signature: string;
}