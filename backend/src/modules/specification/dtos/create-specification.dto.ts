import { IsString, IsArray, IsBoolean, IsNumber, IsOptional, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class TechnicalSpecDto {
  @IsString()
  name: string;

  @IsString()
  value: string;
}

export class SpecificationGroupDto {
  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechnicalSpecDto)
  @ArrayMinSize(1)
  specs: TechnicalSpecDto[];
}

export class CreateSpecificationDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecificationGroupDto)
  @ArrayMinSize(1)
  groups: SpecificationGroupDto[];

  // @IsArray()
  // @IsString({ each: true })
  // @IsOptional()
  // categories?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
} 