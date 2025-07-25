import { IsString, IsArray, IsOptional, IsEnum, ValidateNested, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class RangeOptionDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsNumber()
  @Min(0)
  min: number;

  @IsNumber()
  @Min(0)
  max: number;
}

export class CreateFilterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['select', 'checkbox', 'range', 'text', 'number'])
  type: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RangeOptionDto)
  rangeOptions?: RangeOptionDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];
}

export class UpdateFilterDto extends CreateFilterDto {}
