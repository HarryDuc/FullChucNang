import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { VariantService } from '../services/variant.service';
import { CreateVariantDto, UpdateVariantDto } from '../dtos/variant.dto';
import { Variant } from '../schemas/variant.schema';

/**
 * ✅ Controller quản lý biến thể sản phẩm.
 *
 * 📌 Endpoints chính:
 * - [POST]    /variants           → Tạo mới biến thể.
 * - [GET]     /variants           → Lấy danh sách tất cả biến thể.
 * - [GET]     /variants/:slug     → Lấy biến thể theo slug.
 * - [PATCH]   /variants/:slug     → Cập nhật biến thể theo slug.
 * - [DELETE]  /variants/:slug     → Xóa biến thể theo slug.
 *
 * 📌 Các endpoint cập nhật nhanh:
 * - [PATCH]   /variants/:slug/name        → Cập nhật tên biến thể.
 * - [PATCH]   /variants/:slug/values      → Cập nhật thuộc tính biến thể.
 * - [PATCH]   /variants/:slug/slug        → Cập nhật slug biến thể.
 */
@Controller('variants')
export class VariantController {
  constructor(private readonly variantService: VariantService) {}

  /**
   * 📌 Tạo mới biến thể.
   */
  @Post()
  async create(@Body() createVariantDto: CreateVariantDto): Promise<Variant> {
    return this.variantService.create(createVariantDto);
  }

  /**
   * 📌 Lấy danh sách tất cả biến thể.
   */
  @Get()
  async findAll(): Promise<Variant[]> {
    return this.variantService.findAll();
  }

  /**
   * 📌 Lấy biến thể theo slug.
   */
  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<Variant> {
    return this.variantService.findOneBySlug(slug);
  }

  /**
   * 📌 Cập nhật biến thể theo slug.
   */
  @Patch(':slug')
  async update(
    @Param('slug') slug: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ): Promise<Variant> {
    return this.variantService.updateBySlug(slug, updateVariantDto);
  }

  /**
   * 📌 Xóa biến thể theo slug.
   */
  @Delete(':slug')
  async remove(@Param('slug') slug: string): Promise<{ message: string }> {
    return this.variantService.removeBySlug(slug);
  }

  /**
   * 📌 Cập nhật nhanh tên của biến thể.
   */
  @Patch(':slug/name')
  async updateVariantName(
    @Param('slug') slug: string,
    @Body('newVariantName') newVariantName: string,
  ): Promise<Variant> {
    return this.variantService.updateVariantName(slug, newVariantName);
  }

  /**
   * 📌 Cập nhật nhanh danh sách giá trị của biến thể.
   */
  @Patch(':slug/values')
  async updateValues(
    @Param('slug') slug: string,
    @Body('newValues') newValues: string[],
  ): Promise<Variant> {
    return this.variantService.updateVariantValues(slug, newValues);
  }

  /**
   * 📌 Cập nhật nhanh slug của biến thể.
   */
  @Patch(':slug/slug')
  async updateSlug(
    @Param('slug') slug: string,
    @Body('newSlug') newSlug: string,
  ): Promise<Variant> {
    return this.variantService.updateSlug(slug, newSlug);
  }
}
