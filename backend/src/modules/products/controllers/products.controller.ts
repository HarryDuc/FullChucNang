import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from '../services/products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateProductNameDto,
  UpdateProductCategoryDto,
  UpdateProductVariantsDto,
  UpdateProductSlugDto,
  ProductFilterDto,
} from '../dtos/product.dto';
import { Product } from '../schemas/product.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PermissionGuard } from 'src/modules/permissions/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';

@Controller('productsapi')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  /**
   * Tạo sản phẩm mới.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('products', 'create')
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  /**
   * Lấy danh sách tất cả sản phẩm (có phân trang).
   */
  @Get()
  async findAll(@Query('page') page: string): Promise<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const pageNumber = parseInt(page || '1', 10);
    return this.productService.findAll(pageNumber);
  }

  /**
   * Lấy danh sách tất cả sản phẩm với thông tin cơ bản (có phân trang).
   * Chỉ trả về các trường: name, slug, thumbnail, category.
   * Query parameters:
   *  - page: Số trang (mặc định là 1)
   *  - limit: Số sản phẩm mỗi trang (mặc định là 10)
   */
  @Get('basic-info')
  async findAllBasicInfo(@Query('page') page?: string): Promise<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const pageNumber = page ? parseInt(page, 10) || 1 : 1;
    return this.productService.findAllBasicInfo(pageNumber);
  }

  /**
   * Lọc sản phẩm theo các tiêu chí (có phân trang)
   * @param filters Các tiêu chí lọc
   * @param page Trang hiện tại
   * @param limit Số sản phẩm mỗi trang
   */
  @Post('filter')
  async filterProducts(
    @Body() body: { filters: Record<string, any> },
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '12',
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.productService.searchProductsByFilters(body.filters, pageNumber, limitNumber);
  }

  /**
   * Lấy danh sách filter có sẵn của sản phẩm theo slug
   */
  @Get(':slug/filters')
  async getProductFilters(@Param('slug') slug: string) {
    return this.productService.getProductFilters(slug);
  }

  /**
   * Cập nhật filter cho sản phẩm
   */
  @Post(':slug/filters')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('products', 'update')
  async setProductFilters(
    @Param('slug') slug: string,
    @Body('filters') filters: Record<string, any>,
  ) {
    return this.productService.setProductFilters(slug, filters);
  }

  /**
   * Lấy danh sách filter khả dụng theo danh mục
   */
  @Get('category/:categoryId/filters')
  async getCategoryFilters(@Param('categoryId') categoryId: string) {
    return this.productService.getCategoryFilters(categoryId);
  }

  /**
   * Lọc sản phẩm theo danh mục và filter (có phân trang)
   */
  @Post('category/:categoryId/filter')
  async filterProductsByCategory(
    @Param('categoryId') categoryId: string,
    @Body() body: { filters: Record<string, any> },
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '12',
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Log request for debugging
    console.log('Filter request received:', {
      categoryId,
      body,
      page: pageNumber,
      limit: limitNumber
    });

    // Validate and normalize filter structure
    const filters = body.filters || {};

    // Ensure filterAttributes exists and has the correct structure
    if (!filters.filterAttributes && Object.keys(filters).length > 0) {
      // If filters were sent without the filterAttributes wrapper, wrap them
      console.log('Restructuring filters - wrapping in filterAttributes');
      filters.filterAttributes = { ...filters };

      // Remove any non-filter fields from the wrapped structure
      ['name', 'minPrice', 'maxPrice', 'hasVariants'].forEach(field => {
        if (filters.filterAttributes[field] !== undefined) {
          filters[field] = filters.filterAttributes[field];
          delete filters.filterAttributes[field];
        }
      });
    }

    console.log('Normalized filters:', filters);

    return this.productService.searchProductsByCategoryAndFilters(
      categoryId,
      filters,
      pageNumber,
      limitNumber,
    );
  }

  /**
   * API: Lấy danh sách sản phẩm theo danh mục chính (ID).
   * @param mainCategoryId ID danh mục chính (bắt buộc).
   * @param page Trang hiện tại (mặc định là 1).
   * @param limit Số sản phẩm mỗi trang (mặc định là 16).
   * @returns Danh sách sản phẩm theo danh mục.
   */
  @Get('by-categoryID')
  async getProductsByCategory(
    @Query('mainCategoryId') mainCategoryId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
  ) {
    if (!mainCategoryId) {
      return { message: 'Vui lòng cung cấp ID danh mục chính!' };
    }

    return this.productService.findByMainCategoryID(
      mainCategoryId,
      page,
      limit,
    );
  }

  /**
   * Tìm kiếm sản phẩm theo tên (có phân trang).
   * Query parameters:
   *  - q: Từ khóa tìm kiếm
   *  - page: Số trang (mặc định là 1)
   */
  @Get('search')
  async searchProducts(
    @Query('q') searchTerm: string,
    @Query('page') page?: string,
  ): Promise<{
    data: Pick<Product, 'name' | 'slug' | 'currentPrice' | 'discountPrice' | 'thumbnail'>[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    if (!searchTerm) {
      return {
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }

    const pageNumber = page ? parseInt(page, 10) || 1 : 1;
    return this.productService.searchByName(searchTerm, pageNumber);
  }

  @Get('visible-search')
  async visibleSearchProducts(
    @Query('q') searchTerm: string,
    @Query('page') page?: string,
  ): Promise<{
    data: Pick<Product, 'name' | 'slug' | 'currentPrice' | 'discountPrice' | 'thumbnail'>[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    if (!searchTerm) {
      return {
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }

    const pageNumber = page ? parseInt(page, 10) || 1 : 1;
    return this.productService.getVisibleProducts(searchTerm, pageNumber);
  }
  /**
   * Lấy thông tin sản phẩm theo slug.
   */
  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<Product> {
    return this.productService.findOne(slug);
  }

  /**
   * API lấy sản phẩm theo danh mục chính (có phân trang).
   * Đường dẫn: /productapi/bycategory/:mainCategory
   * Ví dụ: /productapi/bycategory/Decor%20Cao%20C%E1%BA%A5p?page=1
   * @param mainCategory Danh mục chính cần tìm.
   * @param page Số trang (mặc định là 1 nếu không truyền).
   */
  @Get('bycategory/:mainCategory')
  async findByCategory(
    @Param('mainCategory') mainCategory: string,
    @Query('page') page?: string,
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const decodedCategory = decodeURIComponent(mainCategory);
    const pageNumber = page ? parseInt(page, 10) || 1 : 1;
    return this.productService.findByMainCategory(decodedCategory, pageNumber);
  }

  /**
   * API lấy sản phẩm theo danh mục phụ (theo tên, có phân trang).
   * Đường dẫn: /productapi/bysubcategory/:subCategory
   * Ví dụ: /productapi/bysubcategory/Decor%20Sub?page=1
   * @param subCategory Tên danh mục phụ cần tìm.
   * @param page Số trang (mặc định là 1 nếu không truyền).
   */
  @Get('bysubcategory/:subCategory')
  async findBySubCategory(
    @Param('subCategory') subCategory: string,
    @Query('page') page?: string,
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const decodedSubCategory = decodeURIComponent(subCategory);
    const pageNumber = page ? parseInt(page, 10) || 1 : 1;
    return this.productService.findBySubCategory(
      decodedSubCategory,
      pageNumber,
    );
  }

  /**
   * Cập nhật toàn bộ thông tin của sản phẩm theo slug.
   */
  @Put(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('products', 'update')
  async update(
    @Param('slug') slug: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.update(slug, updateProductDto);
  }

  /**
   * Xóa sản phẩm theo slug.
   */
  @Delete(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('products', 'delete')
  async remove(@Param('slug') slug: string): Promise<Product> {
    return this.productService.remove(slug);
  }

  /**
   * Cập nhật nhanh tên sản phẩm.
   */
  @Patch(':slug/name')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager', 'staff')
  @RequirePermission('products', 'update')
  async updateName(
    @Param('slug') slug: string,
    @Body() updateProductNameDto: UpdateProductNameDto,
  ): Promise<Product> {
    return this.productService.updateName(slug, updateProductNameDto);
  }

  /**
   * Cập nhật nhanh danh mục sản phẩm.
   */
  @Patch(':slug/category')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('products', 'update')
  async updateCategory(
    @Param('slug') slug: string,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
  ): Promise<Product> {
    return this.productService.updateCategory(slug, updateProductCategoryDto);
  }

  /**
   * Cập nhật nhanh biến thể sản phẩm.
   */
  @Patch(':slug/variants')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager', 'staff')
  @RequirePermission('products', 'update')
  async updateVariants(
    @Param('slug') slug: string,
    @Body() updateProductVariantsDto: UpdateProductVariantsDto,
  ): Promise<Product> {
    return this.productService.updateVariants(slug, updateProductVariantsDto);
  }

  /**
   * Cập nhật nhanh slug sản phẩm.
   */
  @Patch(':slug/slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('products', 'update')
  async updateSlug(
    @Param('slug') slug: string,
    @Body() updateProductSlugDto: UpdateProductSlugDto,
  ): Promise<Product> {
    return this.productService.updateSlug(slug, updateProductSlugDto);
  }
}
