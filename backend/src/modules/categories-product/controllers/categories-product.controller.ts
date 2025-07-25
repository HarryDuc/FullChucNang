import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CategoriesProductService } from '../services/categories-product.service';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { PermissionGuard } from 'src/modules/permissions/guards/permission.guard';

/**
 * 📌 Controller để quản lý danh mục sản phẩm.
 */
@Controller('categories-productsapi')
export class CategoriesProductController {
  constructor(private readonly categoriesService: CategoriesProductService) { }

  /**
   * ✅ 1. API Tạo danh mục mới (hỗ trợ tạo danh mục con ngay lập tức)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('categories-product', 'create')
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }
  
  @Post(':id/filters')
  async setFiltersForCategory(
    @Param('id') id: string,
    @Body('filters') filters: Record<string, string[]>,
  ) {
    return this.categoriesService.setFiltersForCategory(id, filters);
  }

  @Get(':id/filters')
  async getFiltersByCategory(@Param('id') id: string) {
    return this.categoriesService.getFiltersByCategory(id);
  }

  /**
   * ✅ 2. API Lấy tất cả danh mục (Không phân trang - Level = 0)
   */
  @Get()
  async getAll() {
    return this.categoriesService.getAllCategories();
  }

  /**
   * ✅ 3. API Lấy danh mục theo ID để lấy tên danh mục cha
   */
  @Get('id/:id')
  async getById(@Param('id') id: string) {
    return this.categoriesService.getCategoryById(id);
  }

  /**
   * ✅ Route lấy thông tin đơn giản của những danh mục cha (active và level = 0)
   */
  @Get('main')
  async getSimpleParentCategories() {
    return await this.categoriesService.getSimpleParentCategories();
  }

  /**
   * ✅ Route lấy thông tin đơn giản của tất cả danh mục con theo id của danh mục cha (active)
   */
  @Get('/sub/:parentId')
  async getSubCategoriesByParentId(@Param('parentId') parentId: string) {
    return await this.categoriesService.getSubCategoriesByParentId(parentId);
  }

  /**
   * ✅ 4. API Lấy danh mục theo slug
   * - Nếu là danh mục cha → Trả về tree toàn bộ con
   * - Nếu là danh mục phụ → Trả về category và các sub con 1 cấp
   */
  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.categoriesService.getCategoryBySlug(slug);
  }

  /**
   * ✅ 5. API Cập nhật danh mục theo slug
   */
  @Put(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('categories-product', 'update')
  async update(
    @Param('slug') slug: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(slug, updateCategoryDto);
  }

  /**
   * ✅ 6. API Xóa danh mục theo slug
   */
  @Delete(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('categories-product', 'delete')
  async delete(@Param('slug') slug: string) {
    return this.categoriesService.deleteCategory(slug);
  }
}
