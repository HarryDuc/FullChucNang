import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateContactDto {

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  sendNotificationToAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  sendConfirmationToCustomer?: boolean;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;
}
