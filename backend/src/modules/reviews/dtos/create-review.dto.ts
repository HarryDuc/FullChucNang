import { IsString, IsNumber, IsEmail, Min, Max, IsOptional, IsArray, IsMongoId } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  productSlug: string;

  @IsMongoId()
  userId: string;

  @IsString()
  userName: string;

  @IsEmail()
  userEmail: string;

  @IsString()
  @IsOptional()
  userAvatar?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attributes?: string[];
}