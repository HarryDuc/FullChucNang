import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
import { FilterService } from '../../filters/services/filter.service';
import { Category, CategoryDocument } from '../../categories-product/schemas/category.schema';

interface MongoQuery {
  [key: string]: any;
  $or?: any[];
  $and?: any[];
}

interface PriceRangeQuery {
  $or: Array<{
    [key: string]: any;
    discountPrice?: {
      $exists: boolean;
      $ne: null;
      $gte: number;
      $lte: number;
    };
    currentPrice?: {
      $exists: boolean;
      $ne: null;
      $gte: number;
      $lte: number;
    };
    importPrice?: {
      $exists: boolean;
      $ne: null;
      $gte: number;
      $lte: number;
    };
    'variants.variantCurrentPrice'?: {
      $exists: boolean;
      $elemMatch: {
        $gte: number;
        $lte: number;
      };
    };
    $and?: Array<{
      $or?: Array<{
        [key: string]: any;
      }>;
      [key: string]: any;
    }>;
  }>;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @Inject(forwardRef(() => RedirectsService))
    private redirectsService: RedirectsService,
    private filterService: FilterService,
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
    const { name, ...updateFields } = createProductDto;

    if (!name) {
      throw new BadRequestException('Tên sản phẩm là bắt buộc.');
    }

    const generatedSlug = await this.generateUniqueSlug(name);

    // Xử lý logic stock dựa trên hasVariants
    let stockValue = updateFields.stock;
    if (updateFields.hasVariants === true) {
      // Nếu có biến thể, stock có thể là undefined hoặc 0
      stockValue = updateFields.stock || 0;
    } else if (updateFields.hasVariants === false) {
      // Nếu không có biến thể, stock phải có giá trị
      if (updateFields.stock === undefined || updateFields.stock === null) {
        throw new BadRequestException('Stock là bắt buộc khi sản phẩm không có biến thể.');
      }
      stockValue = updateFields.stock;
    }

    try {
      // Log để debug
      console.log('Creating product with data:', {
        name,
        slug: generatedSlug,
        stock: stockValue,
        sold: updateFields.sold || 0,
        specification: updateFields.specification,
        specificationDescription: updateFields.specificationDescription,
        hasVariants: updateFields.hasVariants,
        variantAttributes: updateFields.variantAttributes || [],
        variants: updateFields.variants || [],
      });

      console.log('Full updateFields:', JSON.stringify(updateFields, null, 2));

      const productData = {
        ...updateFields,
        name,
        slug: generatedSlug,
        stock: stockValue,
        sold: updateFields.sold || 0,
        variantAttributes: updateFields.variantAttributes || [],
        variants: updateFields.variants || [],
      };

      // Xử lý specification riêng biệt để đảm bảo nested object được lưu đúng
      if (updateFields.specification) {
        productData.specification = updateFields.specification;
      }
      if (updateFields.specificationDescription) {
        productData.specificationDescription = updateFields.specificationDescription;
      }

      console.log('Final productData before create:', JSON.stringify(productData, null, 2));

      const createdProduct = await this.productModel.create(productData);

      console.log('Created product:', createdProduct);
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
        .select('name slug currentPrice discountPrice thumbnail hasVariants variants specification isVisible')
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
      .select('name slug currentPrice discountPrice thumbnail isVisible hasVariants variants publishedAt createdAt specification') // Chỉ lấy các trường cần thiết
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
          'name slug currentPrice discountPrice thumbnail isVisible hasVariants variants publishedAt createdAt specification',
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
      .select('name slug currentPrice discountPrice thumbnail isVisible hasVariants variants publishedAt createdAt specification') // Chỉ lấy các trường cần thiết
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
          'filterAttributes',
          'hasVariants',
          'specification',
          'specificationDescription',
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
      .select('name slug currentPrice discountPrice thumbnail isVisible hasVariants variants category publishedAt createdAt specification')
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
    const { slug: newSlug } = updateProductDto;

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

      // Validate and get category IDs
      const mainCategory = await this.categoryModel.findOne({ name: updateDto.category.main }).exec();
      if (!mainCategory) {
        throw new BadRequestException('Danh mục chính không tồn tại');
      }

      const subCategories = await Promise.all(
        (updateDto.category.sub || []).map(async (subName) => {
          const subCat = await this.categoryModel.findOne({ name: subName }).exec();
          if (!subCat) {
            throw new BadRequestException(`Danh mục con "${subName}" không tồn tại`);
          }
          return subCat;
        })
      );

      // Update category with IDs
      updateDto.category.mainCategoryId = mainCategory._id;
      updateDto.category.subCategoryIds = subCategories.map(sub => sub._id);
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
    data: Pick<Product, 'name' | 'slug' | 'currentPrice' | 'discountPrice' | 'thumbnail'>[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const allProducts = await this.productModel
      .find()
      .select('name slug currentPrice discountPrice thumbnail isVisible')
      .lean();

    // Chuẩn hóa searchTerm
    const { normalized: normalizedSearchTerm, withDiacritics: diacriticSearchTerm } = normalizeForSearch(searchTerm);
    const normalizedLower = normalizedSearchTerm.toLowerCase();
    const diacriticLower = diacriticSearchTerm.toLowerCase();

    // Cắt từ khóa tìm kiếm thành từng từ
    const searchWords = normalizedLower.split(' ').filter(Boolean);
    const diacriticWords = diacriticLower.split(' ').filter(Boolean);

    // 1. Ưu tiên tuyệt đối: Tìm sản phẩm có tên (không dấu hoặc có dấu) === từ khóa tìm kiếm (không dấu hoặc có dấu)
    const absoluteMatched = allProducts.filter(product => {
      const { normalized, withDiacritics } = normalizeForSearch(product.name);
      return (
        normalized.toLowerCase() === normalizedLower ||
        withDiacritics.toLowerCase() === diacriticLower
      );
    });

    if (absoluteMatched.length > 0) {
      // Trả về luôn, ưu tiên tuyệt đối
      const result = {
        data: absoluteMatched.slice(skip, skip + limit),
        total: absoluteMatched.length,
        page,
        totalPages: Math.ceil(absoluteMatched.length / limit),
      };

      return result;
    }

    // 2. Nếu searchTerm chỉ có 1 từ, ưu tiên tìm sản phẩm có từ đó là một từ riêng biệt trong tên sản phẩm
    if (searchWords.length === 1 && diacriticWords.length === 1) {
      const word = searchWords[0];
      const wordWithDiacritic = diacriticWords[0];

      // Tìm sản phẩm có từ khóa là một từ riêng biệt (không dấu hoặc có dấu)
      const exactWordMatched = allProducts.filter(product => {
        const { normalized, withDiacritics } = normalizeForSearch(product.name);
        const normTokens = normalized.toLowerCase().split(' ');
        const diaTokens = withDiacritics.toLowerCase().split(' ');
        return normTokens.includes(word) || diaTokens.includes(wordWithDiacritic);
      });

      if (exactWordMatched.length > 0) {
        // Trả về luôn, chỉ lấy sản phẩm có từ khóa là một từ riêng biệt
        const result = {
          data: exactWordMatched.slice(skip, skip + limit),
          total: exactWordMatched.length,
          page,
          totalPages: Math.ceil(exactWordMatched.length / limit),
        };

        return result;
      }
    }

    // 3. Tìm sản phẩm chứa tất cả các từ khóa (theo từng từ, không dấu hoặc có dấu)
    // Ví dụ: "so tay" -> ['so', 'tay'] -> tên sản phẩm phải chứa cả 2 từ (không dấu hoặc có dấu)
    const allWordsMatched = allProducts.filter(product => {
      const { normalized, withDiacritics } = normalizeForSearch(product.name);
      const norm = normalized.toLowerCase();
      const dia = withDiacritics.toLowerCase();

      // Mỗi từ trong searchWords hoặc diacriticWords phải xuất hiện trong tên sản phẩm (không dấu hoặc có dấu)
      return searchWords.every(word => norm.includes(word) || dia.includes(word));
    });

    if (allWordsMatched.length > 0) {
      // Sắp xếp theo số lượng từ khóa trùng khớp tuyệt đối (ưu tiên sản phẩm có từ trùng khớp hoàn toàn)
      const scored = allWordsMatched.map(product => {
        const { normalized, withDiacritics } = normalizeForSearch(product.name);
        const normTokens = normalized.toLowerCase().split(' ');
        const diaTokens = withDiacritics.toLowerCase().split(' ');

        // Số từ khóa trùng khớp tuyệt đối (không dấu hoặc có dấu)
        let exactCount = 0;
        for (const word of searchWords) {
          if (normTokens.includes(word)) exactCount += 1;
        }
        for (const word of diacriticWords) {
          if (diaTokens.includes(word)) exactCount += 1;
        }

        // Số từ khóa xuất hiện ở đầu tên sản phẩm
        let prefixCount = 0;
        for (const word of searchWords) {
          if (normTokens[0] === word) prefixCount += 1;
        }
        for (const word of diacriticWords) {
          if (diaTokens[0] === word) prefixCount += 1;
        }

        // Tổng điểm: exact match ưu tiên, sau đó prefix
        const score = exactCount * 10 + prefixCount * 2;
        return { ...product, score };
      });

      // Sắp xếp giảm dần theo score
      scored.sort((a, b) => b.score - a.score);

      const paged = scored.slice(skip, skip + limit).map(({ score, ...rest }) => rest);

      const result = {
        data: paged,
        total: scored.length,
        page,
        totalPages: Math.ceil(scored.length / limit),
      };

      return result;
    }

    // 4. Nếu vẫn không có, tìm sản phẩm chứa bất kỳ từ khóa nào (theo từng từ, không dấu hoặc có dấu)
    const anyWordMatched = allProducts.filter(product => {
      const { normalized, withDiacritics } = normalizeForSearch(product.name);
      const norm = normalized.toLowerCase();
      const dia = withDiacritics.toLowerCase();

      return (
        searchWords.some(word => norm.includes(word) || dia.includes(word)) ||
        diacriticWords.some(word => norm.includes(word) || dia.includes(word))
      );
    });

    if (anyWordMatched.length > 0) {
      // Sắp xếp theo số lượng từ khóa trùng khớp (ưu tiên nhiều từ khớp hơn)
      const scored = anyWordMatched.map(product => {
        const { normalized, withDiacritics } = normalizeForSearch(product.name);
        const norm = normalized.toLowerCase();
        const dia = withDiacritics.toLowerCase();

        let matchCount = 0;
        for (const word of searchWords) {
          if (norm.includes(word) || dia.includes(word)) matchCount += 1;
        }
        for (const word of diacriticWords) {
          if (norm.includes(word) || dia.includes(word)) matchCount += 1;
        }

        // Ưu tiên nếu từ khóa xuất hiện ở đầu tên sản phẩm
        let prefixCount = 0;
        for (const word of searchWords) {
          if (norm.startsWith(word) || dia.startsWith(word)) prefixCount += 1;
        }
        for (const word of diacriticWords) {
          if (norm.startsWith(word) || dia.startsWith(word)) prefixCount += 1;
        }

        // Tổng điểm: matchCount ưu tiên, sau đó prefix
        const score = matchCount * 5 + prefixCount * 2;
        return { ...product, score };
      });

      // Sắp xếp giảm dần theo score
      scored.sort((a, b) => b.score - a.score);

      const paged = scored.slice(skip, skip + limit).map(({ score, ...rest }) => rest);

      const result = {
        data: paged,
        total: scored.length,
        page,
        totalPages: Math.ceil(scored.length / limit),
      };

      return result;
    }

    // 5. Nếu vẫn không có, thực hiện fuzzy search (so sánh prefix từng từ)
    function generatePrefixes(word: string): string[] {
      const prefixes: string[] = [];
      for (let i = 1; i <= word.length; i++) {
        prefixes.push(word.slice(0, i));
      }
      return prefixes;
    }

    const fuzzyScored = allProducts.map(product => {
      const { normalized: normalizedProductName, withDiacritics: diacriticProductName } = normalizeForSearch(product.name);

      let score = 0;

      // Fuzzy cho không dấu
      for (const word of searchWords) {
        const prefixes = generatePrefixes(word);
        for (const prefix of prefixes) {
          if (normalizedProductName.toLowerCase().includes(prefix)) {
            score += 0.3;
            if (normalizedProductName.toLowerCase().startsWith(prefix)) score += 0.3;
            if (new RegExp(`\\b${prefix}\\b`).test(normalizedProductName.toLowerCase())) score += 0.2;
          }
        }
      }

      // Fuzzy cho có dấu
      for (const word of diacriticWords) {
        const prefixes = generatePrefixes(word);
        for (const prefix of prefixes) {
          if (diacriticProductName.toLowerCase().includes(prefix)) {
            score += 0.5;
            if (diacriticProductName.toLowerCase().startsWith(prefix)) score += 0.5;
            if (new RegExp(`\\b${prefix}\\b`).test(diacriticProductName.toLowerCase())) score += 0.3;
          }
        }
      }

      // Ưu tiên số lượng từ khóa khớp
      const keywordMatchCount =
        searchWords.filter(w => normalizedProductName.toLowerCase().includes(w)).length +
        diacriticWords.filter(w => diacriticProductName.toLowerCase().includes(w)).length;

      score += keywordMatchCount * 0.5;

      // Cộng thêm theo độ dài từ khóa khớp nhất
      const maxSearchWordLength = Math.max(...searchWords.map(w => w.length), 0);
      if (maxSearchWordLength >= 2) {
        score *= (1 + maxSearchWordLength * 0.1);
      }

      return {
        ...product,
        score,
      };
    });

    // Lọc sản phẩm có điểm > 0 và sắp xếp theo điểm giảm dần
    const filtered = fuzzyScored
      .filter(product => product.score > 0)
      .sort((a, b) => b.score - a.score);

    const total = filtered.length;
    const pagedData = filtered.slice(skip, skip + limit).map(({ score, ...rest }) => rest);

    const result = {
      data: pagedData,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    return result;
  }

  async getVisibleProducts(
    searchTerm: string,
    page: number = 1,
    limit: number = 16,
  ): Promise<{
    data: Pick<Product, 'name' | 'slug' | 'currentPrice' | 'discountPrice' | 'thumbnail'>[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const allProducts = await this.productModel
      .find({ isVisible: false })
      .select('name slug currentPrice discountPrice thumbnail isVisible')
      .lean();

    // Chuẩn hóa searchTerm
    const { normalized: normalizedSearchTerm, withDiacritics: diacriticSearchTerm } = normalizeForSearch(searchTerm);
    const normalizedLower = normalizedSearchTerm.toLowerCase();
    const diacriticLower = diacriticSearchTerm.toLowerCase();

    // Cắt từ khóa tìm kiếm thành từng từ
    const searchWords = normalizedLower.split(' ').filter(Boolean);
    const diacriticWords = diacriticLower.split(' ').filter(Boolean);

    // 1. Ưu tiên tuyệt đối: Tìm sản phẩm có tên (không dấu hoặc có dấu) === từ khóa tìm kiếm (không dấu hoặc có dấu)
    const absoluteMatched = allProducts.filter(product => {
      const { normalized, withDiacritics } = normalizeForSearch(product.name);
      return (
        normalized.toLowerCase() === normalizedLower ||
        withDiacritics.toLowerCase() === diacriticLower
      );
    });

    if (absoluteMatched.length > 0) {
      // Trả về luôn, ưu tiên tuyệt đối
      const result = {
        data: absoluteMatched.slice(skip, skip + limit),
        total: absoluteMatched.length,
        page,
        totalPages: Math.ceil(absoluteMatched.length / limit),
      };

      return result;
    }

    // 2. Nếu searchTerm chỉ có 1 từ, ưu tiên tìm sản phẩm có từ đó là một từ riêng biệt trong tên sản phẩm
    if (searchWords.length === 1 && diacriticWords.length === 1) {
      const word = searchWords[0];
      const wordWithDiacritic = diacriticWords[0];

      // Tìm sản phẩm có từ khóa là một từ riêng biệt (không dấu hoặc có dấu)
      const exactWordMatched = allProducts.filter(product => {
        const { normalized, withDiacritics } = normalizeForSearch(product.name);
        const normTokens = normalized.toLowerCase().split(' ');
        const diaTokens = withDiacritics.toLowerCase().split(' ');
        return normTokens.includes(word) || diaTokens.includes(wordWithDiacritic);
      });

      if (exactWordMatched.length > 0) {
        // Trả về luôn, chỉ lấy sản phẩm có từ khóa là một từ riêng biệt
        const result = {
          data: exactWordMatched.slice(skip, skip + limit),
          total: exactWordMatched.length,
          page,
          totalPages: Math.ceil(exactWordMatched.length / limit),
        };

        return result;
      }
    }

    // 3. Tìm sản phẩm chứa tất cả các từ khóa (theo từng từ, không dấu hoặc có dấu)
    // Ví dụ: "so tay" -> ['so', 'tay'] -> tên sản phẩm phải chứa cả 2 từ (không dấu hoặc có dấu)
    const allWordsMatched = allProducts.filter(product => {
      const { normalized, withDiacritics } = normalizeForSearch(product.name);
      const norm = normalized.toLowerCase();
      const dia = withDiacritics.toLowerCase();

      // Mỗi từ trong searchWords hoặc diacriticWords phải xuất hiện trong tên sản phẩm (không dấu hoặc có dấu)
      return searchWords.every(word => norm.includes(word) || dia.includes(word));
    });

    if (allWordsMatched.length > 0) {
      // Sắp xếp theo số lượng từ khóa trùng khớp tuyệt đối (ưu tiên sản phẩm có từ trùng khớp hoàn toàn)
      const scored = allWordsMatched.map(product => {
        const { normalized, withDiacritics } = normalizeForSearch(product.name);
        const normTokens = normalized.toLowerCase().split(' ');
        const diaTokens = withDiacritics.toLowerCase().split(' ');

        // Số từ khóa trùng khớp tuyệt đối (không dấu hoặc có dấu)
        let exactCount = 0;
        for (const word of searchWords) {
          if (normTokens.includes(word)) exactCount += 1;
        }
        for (const word of diacriticWords) {
          if (diaTokens.includes(word)) exactCount += 1;
        }

        // Số từ khóa xuất hiện ở đầu tên sản phẩm
        let prefixCount = 0;
        for (const word of searchWords) {
          if (normTokens[0] === word) prefixCount += 1;
        }
        for (const word of diacriticWords) {
          if (diaTokens[0] === word) prefixCount += 1;
        }

        // Tổng điểm: exact match ưu tiên, sau đó prefix
        const score = exactCount * 10 + prefixCount * 2;
        return { ...product, score };
      });

      // Sắp xếp giảm dần theo score
      scored.sort((a, b) => b.score - a.score);

      const paged = scored.slice(skip, skip + limit).map(({ score, ...rest }) => rest);

      const result = {
        data: paged,
        total: scored.length,
        page,
        totalPages: Math.ceil(scored.length / limit),
      };

      return result;
    }

    // 4. Nếu vẫn không có, tìm sản phẩm chứa bất kỳ từ khóa nào (theo từng từ, không dấu hoặc có dấu)
    const anyWordMatched = allProducts.filter(product => {
      const { normalized, withDiacritics } = normalizeForSearch(product.name);
      const norm = normalized.toLowerCase();
      const dia = withDiacritics.toLowerCase();

      return (
        searchWords.some(word => norm.includes(word) || dia.includes(word)) ||
        diacriticWords.some(word => norm.includes(word) || dia.includes(word))
      );
    });

    if (anyWordMatched.length > 0) {
      // Sắp xếp theo số lượng từ khóa trùng khớp (ưu tiên nhiều từ khớp hơn)
      const scored = anyWordMatched.map(product => {
        const { normalized, withDiacritics } = normalizeForSearch(product.name);
        const norm = normalized.toLowerCase();
        const dia = withDiacritics.toLowerCase();

        let matchCount = 0;
        for (const word of searchWords) {
          if (norm.includes(word) || dia.includes(word)) matchCount += 1;
        }
        for (const word of diacriticWords) {
          if (norm.includes(word) || dia.includes(word)) matchCount += 1;
        }

        // Ưu tiên nếu từ khóa xuất hiện ở đầu tên sản phẩm
        let prefixCount = 0;
        for (const word of searchWords) {
          if (norm.startsWith(word) || dia.startsWith(word)) prefixCount += 1;
        }
        for (const word of diacriticWords) {
          if (norm.startsWith(word) || dia.startsWith(word)) prefixCount += 1;
        }

        // Tổng điểm: matchCount ưu tiên, sau đó prefix
        const score = matchCount * 5 + prefixCount * 2;
        return { ...product, score };
      });

      // Sắp xếp giảm dần theo score
      scored.sort((a, b) => b.score - a.score);

      const paged = scored.slice(skip, skip + limit).map(({ score, ...rest }) => rest);

      const result = {
        data: paged,
        total: scored.length,
        page,
        totalPages: Math.ceil(scored.length / limit),
      };

      return result;
    }

    // 5. Nếu vẫn không có, thực hiện fuzzy search (so sánh prefix từng từ)
    function generatePrefixes(word: string): string[] {
      const prefixes: string[] = [];
      for (let i = 1; i <= word.length; i++) {
        prefixes.push(word.slice(0, i));
      }
      return prefixes;
    }

    const fuzzyScored = allProducts.map(product => {
      const { normalized: normalizedProductName, withDiacritics: diacriticProductName } = normalizeForSearch(product.name);

      let score = 0;

      // Fuzzy cho không dấu
      for (const word of searchWords) {
        const prefixes = generatePrefixes(word);
        for (const prefix of prefixes) {
          if (normalizedProductName.toLowerCase().includes(prefix)) {
            score += 0.3;
            if (normalizedProductName.toLowerCase().startsWith(prefix)) score += 0.3;
            if (new RegExp(`\\b${prefix}\\b`).test(normalizedProductName.toLowerCase())) score += 0.2;
          }
        }
      }

      // Fuzzy cho có dấu
      for (const word of diacriticWords) {
        const prefixes = generatePrefixes(word);
        for (const prefix of prefixes) {
          if (diacriticProductName.toLowerCase().includes(prefix)) {
            score += 0.5;
            if (diacriticProductName.toLowerCase().startsWith(prefix)) score += 0.5;
            if (new RegExp(`\\b${prefix}\\b`).test(diacriticProductName.toLowerCase())) score += 0.3;
          }
        }
      }

      // Ưu tiên số lượng từ khóa khớp
      const keywordMatchCount =
        searchWords.filter(w => normalizedProductName.toLowerCase().includes(w)).length +
        diacriticWords.filter(w => diacriticProductName.toLowerCase().includes(w)).length;

      score += keywordMatchCount * 0.5;

      // Cộng thêm theo độ dài từ khóa khớp nhất
      const maxSearchWordLength = Math.max(...searchWords.map(w => w.length), 0);
      if (maxSearchWordLength >= 2) {
        score *= (1 + maxSearchWordLength * 0.1);
      }

      return {
        ...product,
        score,
      };
    });

    // Lọc sản phẩm có điểm > 0 và sắp xếp theo điểm giảm dần
    const filtered = fuzzyScored
      .filter(product => product.score > 0)
      .sort((a, b) => b.score - a.score);

    const total = filtered.length;
    const pagedData = filtered.slice(skip, skip + limit).map(({ score, ...rest }) => rest);

    const result = {
      data: pagedData,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    return result;
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

  async searchProductsByFilters(
    filters: Record<string, any>,
    page: number = 1,
    limit: number = 12,
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = {};
    const skip = (page - 1) * limit;

    // Xử lý filter giá
    if (filters.priceMin != null || filters.priceMax != null) {
      query.currentPrice = {};
      if (filters.priceMin != null) {
        query.currentPrice.$gte = filters.priceMin;
      }
      if (filters.priceMax != null) {
        query.currentPrice.$lte = filters.priceMax;
      }
    }

    // Xử lý filter danh mục
    if (filters.categoryId) {
      query['category.id'] = filters.categoryId;
    }

    // Xử lý các filter động
    Object.entries(filters).forEach(([key, value]) => {
      if (!['priceMin', 'priceMax', 'categoryId'].includes(key)) {
        query[`filterAttributes.${key}`] = Array.isArray(value)
          ? { $in: value }
          : value;
      }
    });

    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      this.productModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductFilters(slug: string): Promise<Record<string, any>> {
    const product = await this.productModel.findOne({ slug }).lean().exec();
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }
    return product.filterAttributes || {};
  }

  async setProductFilters(
    slug: string,
    filters: Record<string, any>,
  ): Promise<Product> {
    const product = await this.productModel.findOne({ slug });
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    // Validate filters against category's available filters
    if (product.category?.id) {
      const categoryFilters = await this.getCategoryFilters(product.category.id);
      const invalidFilters = Object.keys(filters).filter(
        key => !categoryFilters.some(f => f.slug === key),
      );
      if (invalidFilters.length > 0) {
        throw new Error(
          `Invalid filters for this category: ${invalidFilters.join(', ')}`,
        );
      }
    }

    product.filterAttributes = filters;
    return product.save();
  }

  async getCategoryFilters(categoryId: string): Promise<any[]> {
    return this.filterService.findByCategory(categoryId);
  }

  async searchProductsByCategoryAndFilters(
    categoryId: string,
    filters: Record<string, any>,
    page: number = 1,
    limit: number = 12,
  ): Promise<{
    data: Pick<Product, 'name' | 'hasVariants' | 'currentPrice' | 'discountPrice' | 'thumbnail' | 'slug' | 'filterAttributes' | 'specification'>[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    console.log('Filter request received:', {
      categoryId,
      body: { filters },
      page,
      limit
    });

    // Build query filter
    const query: MongoQuery = {};

    // Filter by categoryId - check both main and sub categories
    if (categoryId) {
      const categoryObjectId = new Types.ObjectId(categoryId);
      query.$or = [
        { 'category.mainCategoryId': categoryObjectId },
        { 'category.subCategoryIds': categoryObjectId }
      ];
    }

    // Separate price filter from other filters
    const { 'loc-gia': priceFilter, ...otherFilters } = filters || {};

    // Initialize $and array for combining conditions with proper type
    const andConditions: MongoQuery[] = [];

    // Handle price filtering
    if (priceFilter) {
      const { min, max } = priceFilter;
      if (min !== undefined && max !== undefined) {
        // Create price range condition checking all price fields
        const priceRangeQuery: PriceRangeQuery = {
          $or: [
            // Check discountPrice first if it exists and is within range
            {
              discountPrice: {
                $exists: true,
                $ne: null,
                $gte: min,
                $lte: max
              }
            },
            // Check currentPrice if no valid discountPrice
            {
              $and: [
                {
                  $or: [
                    { discountPrice: { $exists: false } },
                    { discountPrice: null }
                  ]
                },
                {
                  currentPrice: {
                    $exists: true,
                    $ne: null,
                    $gte: min,
                    $lte: max
                  }
                }
              ]
            },
            {
              $and: [
                {
                  $or: [
                    { currentPrice: { $exists: false } },
                    { currentPrice: null }
                  ]
                },
              ]
            },
            // Check importPrice if no other prices available
            {
              $and: [
                {
                  $or: [
                    { currentPrice: { $exists: false } },
                    { currentPrice: null }
                  ]
                },
                {
                  importPrice: {
                    $exists: true,
                    $ne: null,
                    $gte: min,
                    $lte: max
                  }
                }
              ]
            },
            // Check variant prices
            {
              'variants.variantCurrentPrice': {
                $exists: true,
                $elemMatch: {
                  $gte: min,
                  $lte: max
                }
              }
            }
          ]
        };

        andConditions.push(priceRangeQuery);
      }
    }

    // Handle other filter attributes - only include products that have these filter attributes set
    const filterQueries = Object.entries(otherFilters)
      .filter(([key, value]) =>
        value !== undefined &&
        value !== null &&
        value !== '' &&
        key !== 'filterAttributes' && // Exclude nested filterAttributes
        key !== 'loc-gia' // Exclude price filter as it's handled separately
      )
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return { [`filterAttributes.${key}`]: { $in: value } };
        }
        return { [`filterAttributes.${key}`]: value };
      });

    if (filterQueries.length > 0) {
      andConditions.push({ $and: filterQueries } as MongoQuery);
    }

    // Add $and conditions to query if there are any
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    console.log('Final query:', JSON.stringify(query, null, 2));

    // Pagination
    const skip = (page - 1) * limit;

    // First get all matching products
    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .select('name hasVariants currentPrice discountPrice thumbnail slug filterAttributes variants')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.productModel.countDocuments(query),
    ]);

    // Calculate effective price and sort products
    const processedData = data
      .map(product => {
        const effectivePrice =
          product.discountPrice ??
          product.currentPrice ??
          (product.variants && product.variants.length > 0
            ? Math.min(...product.variants.map(v => v.variantCurrentPrice || Infinity))
            : null);

        return {
          ...product,
          effectivePrice
        };
      })
      .sort((a, b) => {
        // Sort by effective price
        const priceA = a.effectivePrice ?? Infinity;
        const priceB = b.effectivePrice ?? Infinity;
        return priceA - priceB;
      });

    return {
      data: processedData,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
