import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateProductNameDto,
  UpdateProductCategoryDto,
  UpdateProductVariantsDto,
  UpdateProductSlugDto,
} from '../dtos/product.dto';
import { removeVietnameseTones } from '../../../common/utils/slug.utils';
import { normalizeForSearch } from '../../../common/utils/normalizeForSearch';
import { RedirectsService } from '../../redirects/services/redirects.service';
import { FRONTEND_ROUTES } from '../../../config/routes.config';
@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @Inject(forwardRef(() => RedirectsService))
    private readonly redirectsService: RedirectsService,
  ) { }

  /**
   * Tạo slug duy nhất dựa trên tên sản phẩm.
   * Nếu slug đã tồn tại, tự động thêm hậu tố (-1, -2, ...) cho đến khi slug là duy nhất.
   * @param name Tên sản phẩm.
   * @returns Slug duy nhất.
   */
  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = removeVietnameseTones(name);
    const count = await this.productModel.countDocuments({
      slug: new RegExp(`^${baseSlug}(-[0-9]+)?$`, 'i'),
    });
    return count > 0 ? `${baseSlug}-${count}` : baseSlug;
  }

  /**
   * Tạo sản phẩm mới với slug duy nhất.
   * Yêu cầu bắt buộc: name.
   * Các trường khác là tùy chọn, nếu không gửi thì giữ giá trị mặc định.
   * @param createProductDto DTO tạo sản phẩm.
   * @returns Sản phẩm mới được tạo.
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { name, basePrice, ...updateFields } = createProductDto;

    if (!name) {
      throw new BadRequestException('Tên sản phẩm là bắt buộc.');
    }

    if (!basePrice || basePrice <= 0) {
      throw new BadRequestException('Giá cơ bản phải lớn hơn 0.');
    }

    const generatedSlug = await this.generateUniqueSlug(name);

    try {
      const createdProduct = await this.productModel.create({
        ...updateFields,
        name,
        slug: generatedSlug,
        basePrice,
        variantAttributes: updateFields.variantAttributes || [],
        variants: updateFields.variants || [],
      });

      return createdProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new BadRequestException(error.message || 'Lỗi khi tạo sản phẩm');
    }
  }

  async findAll(page: number = 1): Promise<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const limit = 12;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.productModel
        .find()
        .select('name slug basePrice currentPrice discountPrice thumbnail hasVariants')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy danh sách sản phẩm theo danh mục chính (có phân trang).
   * @param mainCategory Danh mục chính cần tìm.
   * @param page Số trang (mặc định là 1).
   * @param limit Số sản phẩm mỗi trang (mặc định là 10).
   * @returns Danh sách sản phẩm phân trang.
   */
  async findByMainCategory(
    mainCategory: string,
    page: number = 1,
    limit: number = 12,
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Truy vấn dựa vào category.main nhưng hỗ trợ tìm kiếm với danh mục có nhiều giá trị
    const query = {
      'category.main': { $regex: new RegExp(mainCategory, 'i') }, // Không dùng \b
    };

    // Đếm tổng số sản phẩm theo truy vấn
    const total = await this.productModel.countDocuments(query).exec();
    const totalPages = Math.ceil(total / limit);

    // Truy vấn dữ liệu với phân trang và chỉ lấy các trường cần thiết
    const data = await this.productModel
      .find(query)
      .select('name slug basePrice currentPrice discountPrice thumbnail hasVariants publishedAt createdAt') // Chỉ lấy các trường cần thiết
      .sort({ publishedAt: -1, createdAt: -1 }) // 👈 Thêm dòng này để sản phẩm mới nhất lên đầu
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { data, total, page, totalPages };
  }

  async findBySubCategory(
    subCategory: string,
    page: number = 1,
    limit: number = 12,
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = { 'category.sub': subCategory };

    // Chạy hai truy vấn song song để tối ưu hiệu suất
    const [total, data] = await Promise.all([
      this.productModel.countDocuments(query).exec(),
      this.productModel
        .find(
          query,
          'name slug basePrice currentPrice discountPrice thumbnail hasVariants publishedAt createdAt',
        )
        .sort({ publishedAt: -1, createdAt: -1 }) // Sắp xếp sản phẩm mới nhất lên trước
        .lean() // Giúp truy vấn nhanh hơn
        .exec(),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Lấy danh sách sản phẩm theo danh mục chính (theo ID, có phân trang).
   * @param mainCategoryId ID của danh mục chính.
   * @param page Số trang (mặc định là 1).
   * @param limit Số sản phẩm mỗi trang (mặc định là 16).
   * @returns Danh sách sản phẩm phân trang.
   */
  async findByMainCategoryID(
    mainCategoryId: string, // Thay đổi tên tham số để rõ ràng hơn
    page: number = 1,
    limit: number = 12,
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Truy vấn dựa trên ID của danh mục chính
    const query = { 'category._id': mainCategoryId };

    // Đếm tổng số sản phẩm theo truy vấn
    const total = await this.productModel.countDocuments(query).exec();
    const totalPages = Math.ceil(total / limit);

    // Truy vấn dữ liệu với phân trang
    const data = await this.productModel
      .find(query)
      .select('name slug basePrice currentPrice discountPrice thumbnail hasVariants publishedAt createdAt') // Chỉ lấy các trường cần thiết
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { data, total, page, totalPages };
  }

  /**
   * Tìm sản phẩm theo slug.
   * @param slug Slug của sản phẩm.
   * @returns Sản phẩm tương ứng.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async findOne(slug: string): Promise<Product> {
    try {
      const product = await this.productModel
        .findOne({ slug })
        .select([
          'name',
          'slug',
          'sku',
          'description',
          'shortDescription',
          'basePrice',
          'importPrice',
          'currentPrice',
          'discountPrice',
          'thumbnail',
          'gallery',
          'isVisible',
          'isFeatured',
          'isNewArrival',
          'isBestSeller',
          'status',
          'category',
          'variantAttributes',
          'variants',
          'stock',
          'sold',
          'hasVariants',
          'createdAt',
          'updatedAt',
          'publishedAt'
        ])
        .lean()
        .exec();

      if (!product) {
        throw new NotFoundException(`Không tìm thấy sản phẩm với slug ${slug}`);
      }

      // Đảm bảo các mảng không bị null
      product.variantAttributes = product.variantAttributes || [];
      product.variants = product.variants || [];
      product.category = product.category || {
        main: '',
        sub: [],
        tags: []
      };

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Lỗi khi tìm sản phẩm: ${error.message}`,
      );
    }
  }

  /**
   * Lấy danh sách tất cả sản phẩm với thông tin cơ bản.
   * Chỉ trả về các trường: name, slug, basePrice, thumbnail, category.
   * Có phân trang với số lượng sản phẩm mỗi trang mặc định là 10 (có thể chỉnh sửa).
   * @param page Số trang (mặc định là 1).
   * @param limit Số sản phẩm mỗi trang (mặc định là 10).
   * @returns Mảng sản phẩm với thông tin cơ bản và thông tin phân trang.
   */
  async findAllBasicInfo(
    page: number = 1,
    limit: number = 12,
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const total = await this.productModel.countDocuments().exec();
    const data = await this.productModel
      .find()
      .select('name slug basePrice currentPrice discountPrice thumbnail hasVariants category publishedAt createdAt')
      // Sắp xếp dựa trên publishedAt giảm dần; nếu publishedAt không có thì dùng createdAt giảm dần
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() // ✅ Trả về JSON thay vì Document đầy đủ
      .exec();
    const totalPages = Math.ceil(total / limit);

    return { data, total, page, totalPages };
  }

  /**
   * Cập nhật sản phẩm dựa theo slug.
   * Cho phép cập nhật tất cả các trường, các trường không gửi giữ nguyên giá trị cũ.
   * Nếu trường slug được gửi, kiểm tra tính duy nhất.
   * Nếu trường name được gửi, chỉ cập nhật name (không tự động cập nhật slug theo name).
   * @param slug Slug hiện tại của sản phẩm.
   * @param updateProductDto DTO cập nhật.
   * @returns Sản phẩm đã cập nhật.
   */
  async update(
    slug: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { name, slug: newSlug } = updateProductDto;

    // Kiểm tra sản phẩm tồn tại
    const product = await this.findOne(slug);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm.');
    }

    // Nếu có cập nhật slug, kiểm tra slug mới không trùng
    if (newSlug && newSlug !== slug) {
      const existingProduct = await this.productModel
        .findOne({ slug: newSlug })
        .exec();
      if (existingProduct) {
        throw new BadRequestException('Slug đã tồn tại.');
      }
    }

    try {
      // Cập nhật sản phẩm
      const updatedProduct = await this.productModel
        .findOneAndUpdate(
          { slug },
          { $set: updateProductDto },
          { new: true }
        )
        .exec();

      if (!updatedProduct) {
        throw new NotFoundException('Không tìm thấy sản phẩm để cập nhật.');
      }

      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new BadRequestException(error.message || 'Lỗi khi cập nhật sản phẩm');
    }
  }

  /**
   * Cập nhật nhanh tên sản phẩm.
   * Chỉ cập nhật trường name mà không thay đổi slug hiện tại.
   * @param slug Slug hiện tại của sản phẩm.
   * @param updateDto DTO chứa tên mới.
   * @returns Sản phẩm đã cập nhật.
   */
  async updateName(
    slug: string,
    updateDto: UpdateProductNameDto,
  ): Promise<Product> {
    const { name } = updateDto;
    if (!name) {
      throw new BadRequestException('Tên sản phẩm không được để trống.');
    }

    try {
      const updatedProduct = await this.productModel
        .findOneAndUpdate(
          { slug },
          { $set: { name } },
          { new: true }
        )
        .exec();

      if (!updatedProduct) {
        throw new NotFoundException('Không tìm thấy sản phẩm để cập nhật.');
      }

      return updatedProduct;
    } catch (error) {
      console.error('Error updating product name:', error);
      throw new BadRequestException(error.message || 'Lỗi khi cập nhật tên sản phẩm');
    }
  }

  /**
   * Cập nhật nhanh danh mục sản phẩm.
   * @param slug Slug của sản phẩm.
   * @param updateDto DTO chứa thông tin danh mục mới.
   * @returns Sản phẩm đã cập nhật.
   * @throws BadRequestException nếu danh mục chính không được để trống.
   */
  async updateCategory(
    slug: string,
    updateDto: UpdateProductCategoryDto,
  ): Promise<Product> {
    try {
      // Validate category data
      if (!updateDto.category || !updateDto.category.main) {
        throw new BadRequestException('Danh mục chính là bắt buộc.');
      }

      // Ensure arrays are initialized
      updateDto.category.sub = updateDto.category.sub || [];
      updateDto.category.tags = updateDto.category.tags || [];

      const product = await this.productModel
        .findOneAndUpdate(
          { slug },
          {
            $set: {
              category: updateDto.category,
              updatedAt: new Date(),
            },
          },
          { new: true }
        )
        .select([
          'name',
          'slug',
          'category',
          'updatedAt'
        ])
        .lean()
        .exec();

      if (!product) {
        throw new NotFoundException(`Không tìm thấy sản phẩm với slug ${slug}`);
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Lỗi khi cập nhật danh mục: ${error.message}`,
      );
    }
  }

  /**
   * Cập nhật nhanh biến thể sản phẩm.
   * @param slug Slug của sản phẩm.
   * @param updateDto DTO chứa danh sách variantCombinations mới.
   * @returns Sản phẩm đã cập nhật.
   */
  async updateVariants(
    slug: string,
    updateDto: UpdateProductVariantsDto,
  ): Promise<Product> {
    try {
      // Validate input
      if (!updateDto.variantAttributes && !updateDto.variants) {
        throw new BadRequestException('Cần cung cấp thông tin biến thể hoặc tổ hợp biến thể.');
      }

      // Validate variants data if provided
      const variants = updateDto.variants || [];
      variants.forEach(variant => {
        if (!variant.variantName || !variant.combination || variant.combination.length === 0) {
          throw new BadRequestException('Mỗi biến thể cần có tên và ít nhất một tổ hợp thuộc tính.');
        }

        // Ensure SKU is unique if provided
        if (variant.sku) {
          const existingSku = variants.filter(v => v.sku === variant.sku);
          if (existingSku.length > 1) {
            throw new BadRequestException(`SKU ${variant.sku} đã được sử dụng cho biến thể khác.`);
          }
        }

        // Validate stock information
        if (variant.variantStock !== undefined && variant.variantStock < 0) {
          throw new BadRequestException('Số lượng tồn kho không thể âm.');
        }
      });

      const product = await this.productModel
        .findOneAndUpdate(
          { slug },
          {
            $set: {
              variantAttributes: updateDto.variantAttributes || [],
              variants: variants,
              updatedAt: new Date(),
            },
          },
          { new: true }
        )
        .select([
          'name',
          'slug',
          'variantAttributes',
          'variants',
          'updatedAt'
        ])
        .lean()
        .exec();

      if (!product) {
        throw new NotFoundException(`Không tìm thấy sản phẩm với slug ${slug}`);
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Lỗi khi cập nhật biến thể: ${error.message}`,
      );
    }
  }

  /**
   * Cập nhật nhanh slug sản phẩm (kiểm tra trùng).
   * @param slug Slug hiện tại của sản phẩm.
   * @param updateDto DTO chứa slug mới.
   * @returns Sản phẩm đã cập nhật.
   * @throws BadRequestException nếu slug mới trống hoặc đã tồn tại.
   */
  // async updateSlug(
  //   slug: string,
  //   updateDto: UpdateProductSlugDto,
  // ): Promise<Product> {
  //   const { newSlug } = updateDto;
  //   if (!newSlug) {
  //     throw new BadRequestException('Slug mới không được để trống.');
  //   }

  //   const duplicate = await this.productModel.findOne({ slug: newSlug });
  //   if (duplicate) {
  //     throw new BadRequestException(
  //       'Slug đã tồn tại, vui lòng chọn slug khác.',
  //     );
  //   }

  //   const product = await this.findOne(slug);
  //   if (newSlug === slug) {
  //     return product;
  //   }
  //   product.slug = newSlug;
  //   return (product as ProductDocument).save();
  // }
  /**
   * Cập nhật slug của sản phẩm đồng thời tạo redirect từ slug cũ sang slug mới
   */
  async updateSlug(
    slug: string,
    updateDto: UpdateProductSlugDto,
  ): Promise<Product> {
    const product = await this.productModel.findOne({ slug }).exec();

    if (!product) {
      throw new NotFoundException(
        `Không tìm thấy sản phẩm với slug ${slug}`,
      );
    }

    const { newSlug } = updateDto;
    const oldSlug = product.slug;

    // Kiểm tra xem slug mới có hợp lệ không
    if (!newSlug || newSlug.trim() === '') {
      throw new BadRequestException('Slug mới không được để trống!');
    }

    // Kiểm tra xem slug mới đã tồn tại chưa
    const existingProduct = await this.productModel
      .findOne({ slug: newSlug })
      .exec();
    if (existingProduct) {
      throw new BadRequestException(
        `Slug "${newSlug}" đã được sử dụng bởi sản phẩm khác!`,
      );
    }

    try {
      // Cập nhật slug mới
      const updatedProduct = await this.productModel
        .findOneAndUpdate(
          { slug: oldSlug },
          { $set: { slug: newSlug } },
          { new: true },
        )
        .exec();

      // Kiểm tra xem sản phẩm có được cập nhật thành công không
      if (!updatedProduct) {
        throw new NotFoundException(`Không thể cập nhật sản phẩm với slug ${oldSlug}`);
      }

      // Nếu RedirectsService được import, tạo redirect từ slug cũ sang slug mới
      if (this.redirectsService) {
        try {
          // Sử dụng cấu hình đường dẫn từ routes.config thay vì hard-coding
          const oldPath = FRONTEND_ROUTES.PRODUCTS.DETAIL(oldSlug);
          const newPath = FRONTEND_ROUTES.PRODUCTS.DETAIL(newSlug);

          // Tạo redirect trong hệ thống
          await this.redirectsService.create({
            oldPath,
            newPath,
            type: 'product',
            isActive: true,
            statusCode: 301,
          });

          console.log(`Đã tạo redirect từ ${oldPath} sang ${newPath}`);
        } catch (redirectError) {
          console.error('Lỗi khi tạo redirect:', redirectError);
        }
      }

      return updatedProduct;
    } catch (error) {
      throw new BadRequestException(
        `Lỗi khi cập nhật slug: ${error.message}`,
      );
    }
  }
  /**
   * Tìm kiếm sản phẩm theo tên (có phân trang).
   * @param searchTerm Từ khóa tìm kiếm.
   * @param page Số trang (mặc định là 1).
   * @param limit Số sản phẩm mỗi trang (mặc định là 16).
   * @returns Danh sách sản phẩm phù hợp với từ khóa tìm kiếm.
   */
  async searchByName(
    searchTerm: string,
    page: number = 1,
    limit: number = 16,
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // ✅ Chuẩn hóa từ khóa và tách từ
    const normalized = normalizeForSearch(searchTerm);
    const keywords = normalized.split(/\s+/).filter(Boolean);

    // ✅ Lấy toàn bộ sản phẩm với thêm trường SKU
    const allProducts = await this.productModel
      .find()
      .select('name slug basePrice thumbnail sku')
      .lean();

    // ✅ Lọc sản phẩm với tìm kiếm chính xác hơn
    const filtered = allProducts.filter((product) => {
      const normalizedName = normalizeForSearch(product.name);
      const nameWords = normalizedName.split(/\s+/);
      const sku = (product.sku || '').toLowerCase();

      // Kiểm tra từng keyword
      return keywords.every((keyword) => {
        // 1. Kiểm tra match chính xác với SKU
        if (sku && sku === keyword) return true;

        // 2. Kiểm tra SKU có chứa keyword
        if (sku && sku.includes(keyword)) return true;

        // 3. Kiểm tra match trong tên sản phẩm
        return nameWords.some(word => {
          // Match chính xác
          if (word === keyword) return true;

          // Match một phần từ, nhưng phải đủ dài để tránh match nhầm
          // Chỉ match nếu độ dài từ khóa >= 4 ký tự hoặc là số
          if (keyword.length >= 4 || /\d/.test(keyword)) {
            return word.includes(keyword);
          }

          return false;
        });
      });
    });

    // ✅ Sắp xếp kết quả theo độ phù hợp
    const scoredResults = filtered.map(product => {
      let score = 0;
      const normalizedName = normalizeForSearch(product.name);
      const nameWords = normalizedName.split(/\s+/);
      const sku = (product.sku || '').toLowerCase();

      keywords.forEach(keyword => {
        // Điểm cho match SKU
        if (sku === keyword) score += 100; // Match chính xác SKU được ưu tiên cao nhất
        else if (sku.includes(keyword)) score += 50;

        // Điểm cho match tên sản phẩm
        nameWords.forEach(word => {
          if (word === keyword) score += 10; // Match chính xác từ
          else if (keyword.length >= 4 && word.includes(keyword)) score += 5; // Match một phần từ (từ 4 ký tự)
          else if (/\d/.test(keyword) && word.includes(keyword)) score += 5; // Match số
        });
      });

      return { product, score };
    });

    // Sắp xếp theo điểm số và lấy phân trang
    const sortedResults = scoredResults
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);

    const total = sortedResults.length;
    const pagedData = sortedResults.slice(skip, skip + limit);

    return {
      data: pagedData,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Xóa sản phẩm theo slug.
   * @param slug Slug của sản phẩm cần xóa.
   * @returns Sản phẩm đã xóa.
   * @throws NotFoundException nếu không tìm thấy sản phẩm.
   */
  async remove(slug: string): Promise<Product> {
    const product = await this.productModel.findOneAndDelete({ slug });
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm để xóa.');
    }
    return product;
  }
}
