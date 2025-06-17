import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  province: string;

  @IsString()
  district: string;

  @IsString()
  ward: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  ward?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

// DTO để trả về trong response của API
export class AddressResponseDto {
  id: string; // _id của MongoDB
  userId: string;
  name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 