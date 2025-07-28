import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDate,
  IsBoolean,
  IsEnum,
  IsUrl,
  Min,
  Max,
  IsObject,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

/**
 * DTO cho giá trị của thuộc tính biến thể
 */
export class VariantAttributeValueDto {
  @IsString()
  value: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsNumber()
  additionalPrice?: number;

  @IsOptional()
  @IsNumber()
  discountPrice?: number;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

/**
 * DTO cho thuộc tính biến thể
 */
export class VariantAttributeDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeValueDto)
  values: VariantAttributeValueDto[];
}

/**
 * DTO cho combination của biến thể
 */
export class VariantCombinationDto {
  @IsString()
  attributeName: string;

  @IsString()
  value: string;
}

/**
 * DTO cho biến thể sản phẩm
 */
export class ProductVariantDto {
  @IsString()
  variantName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantCombinationDto)
  combination: VariantCombinationDto[];

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  variantImportPrice?: number;

  @IsOptional()
  @IsNumber()
  variantCurrentPrice?: number;

  @IsOptional()
  @IsNumber()
  variantDiscountPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  variantStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  variantSold?: number;

  @IsOptional()
  @IsString()
  variantThumbnail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variantGalleries?: string[];
}

/**
 * DTO cho category info
 */
export class CategoryInfoDto {
  @IsString()
  main: string;

  @IsArray()
  @IsString({ each: true })
  sub: string[] = [];

  @IsArray()
  @IsString({ each: true })
  tags: string[] = [];

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsMongoId()
  mainCategoryId?: Types.ObjectId;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  subCategoryIds?: Types.ObjectId[];

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;
}

/**
 * DTO cho thông tin SEO
 */
export class SeoDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsUrl()
  ogImage?: string;
}

/**
 * DTO cho thông tin tồn kho
 */
export class StockInfoDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @IsEnum(['inStock', 'lowStock', 'outOfStock'])
  stockStatus?: string;
}

/**
 * DTO cho thông tin khuyến mãi
 */
export class PromotionDto {
  @IsOptional()
  @IsBoolean()
  isOnSale?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  saleStartDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  saleEndDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  salePercentage?: number;
}

/**
 * DTO để tạo sản phẩm mới
 */
export class SpecificationGroupDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechnicalSpecDto)
  specs: TechnicalSpecDto[];
}

export class SpecificationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecificationGroupDto)
  groups: SpecificationGroupDto[];
}

export class TechnicalSpecDto {
  @IsString()
  name: string;

  @IsString()
  value: string;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsOptional()
  @IsNumber()
  importPrice?: number;

  @IsOptional()
  @IsNumber()
  currentPrice?: number;

  @IsOptional()
  @IsNumber()
  discountPrice?: number;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryInfoDto)
  category?: CategoryInfoDto;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  sold: number;

  @IsBoolean()
  hasVariants: boolean;

  @IsBoolean()
  isSpecification?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => SpecificationDto)
  specification?: SpecificationDto;

  @IsOptional()
  @IsString()
  isSpecificationProduct?: string;

  @IsOptional()
  @IsString()
  specificationDescription?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  variantAttributes?: VariantAttributeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publishedAt?: Date;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isNewArrival?: boolean;

  @IsOptional()
  @IsBoolean()
  isBestSeller?: boolean;

  @IsEnum(['draft', 'published', 'archived', 'outOfStock', 'comingSoon'])
  status: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoDto)
  seo?: SeoDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  viewCount?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => StockInfoDto)
  stockInfo?: StockInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PromotionDto)
  promotion?: PromotionDto;
}

/**
 * DTO để cập nhật sản phẩm
 */
export class UpdateProductDto implements Partial<CreateProductDto> {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  importPrice?: number;

  @IsOptional()
  @IsNumber()
  currentPrice?: number;

  @IsOptional()
  @IsNumber()
  discountPrice?: number;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryInfoDto)
  category?: CategoryInfoDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sold?: number;

  @IsOptional()
  @IsBoolean()
  isSpecification?: boolean;

  @IsOptional()
  @IsString()
  isSpecificationProduct?: string;

  @IsOptional()
  @IsBoolean()
  hasVariants?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  variantAttributes?: VariantAttributeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publishedAt?: Date;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isNewArrival?: boolean;

  @IsOptional()
  @IsBoolean()
  isBestSeller?: boolean;

  @IsOptional()
  @IsEnum(['draft', 'published', 'archived', 'outOfStock', 'comingSoon'])
  status?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoDto)
  seo?: SeoDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  viewCount?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => StockInfoDto)
  stockInfo?: StockInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PromotionDto)
  promotion?: PromotionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SpecificationDto)
  specification?: SpecificationDto;

  @IsOptional()
  @IsString()
  specificationDescription?: string;

}

/**
 * DTO cập nhật nhanh tên sản phẩm
 */
export class UpdateProductNameDto {
  @IsString()
  name: string;
}

/**
 * DTO cập nhật nhanh danh mục sản phẩm
 */
export class UpdateProductCategoryDto {
  @ValidateNested()
  @Type(() => CategoryInfoDto)
  category: CategoryInfoDto;
}

/**
 * DTO cập nhật nhanh biến thể sản phẩm
 */
export class UpdateProductVariantsDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  variantAttributes?: VariantAttributeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];
}

/**
 * DTO cập nhật nhanh thuộc tính biến thể
 */
export class UpdateProductVariantAttributesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  variantAttributes: VariantAttributeDto[];
}

/**
 * DTO cập nhật nhanh slug sản phẩm
 */
export class UpdateProductSlugDto {
  @IsString()
  newSlug: string;
}

export class ProductFilterDto {
  @IsOptional()
  categoryId?: string;

  @IsOptional()
  priceMin?: number;

  @IsOptional()
  priceMax?: number;

  @IsOptional()
  @IsObject()
  filterAttributes?: Record<string, any>;
}
