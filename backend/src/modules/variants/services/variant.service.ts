import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Variant, VariantType } from '../schemas/variant.schema';
import {
  CreateVariantDto,
  UpdateVariantDto,
  CreateVariantTypeDto,
  UpdateVariantTypeDto
} from '../dtos/variant.dto';
import { removeVietnameseTones } from 'src/common/utils/slug.utils';

@Injectable()
export class VariantService {
  constructor(
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    @InjectModel(VariantType.name) private variantTypeModel: Model<VariantType>,
  ) { }

  /**
   * Tạo slug duy nhất từ name.
   */
  private async generateUniqueSlug(
    baseSlug: string,
    model: Model<any>,
  ): Promise<string> {
    let slug = baseSlug;
    let count = 1;
    while (await model.findOne({ slug }).exec()) {
      slug = `${baseSlug}-${count}`;
      count++;
    }
    return slug;
  }

  /**
   * Tạo mới loại biến thể (VariantType).
   */
  async createType(createVariantTypeDto: CreateVariantTypeDto): Promise<VariantType> {
    const baseSlug =
      createVariantTypeDto.slug ||
      removeVietnameseTones(createVariantTypeDto.name)
        .toLowerCase()
        .replace(/\s+/g, '-');
    const slug = await this.generateUniqueSlug(baseSlug, this.variantTypeModel);

    const newVariantType = new this.variantTypeModel({
      ...createVariantTypeDto,
      slug,
    });
    return newVariantType.save();
  }

  /**
   * Lấy danh sách loại biến thể.
   */
  async findAllTypes(): Promise<VariantType[]> {
    return this.variantTypeModel.find().exec();
  }

  /**
   * Lấy loại biến thể theo slug.
   */
  async findTypeBySlug(slug: string): Promise<VariantType> {
    const variantType = await this.variantTypeModel.findOne({ slug }).exec();
    if (!variantType) {
      throw new NotFoundException(`VariantType with slug ${slug} not found`);
    }
    return variantType;
  }

  /**
   * Cập nhật loại biến thể theo slug.
   */
  async updateTypeBySlug(
    slug: string,
    updateVariantTypeDto: UpdateVariantTypeDto,
  ): Promise<VariantType> {
    if (updateVariantTypeDto.slug) {
      const existingType = await this.variantTypeModel
        .findOne({ slug: updateVariantTypeDto.slug })
        .exec();
      if (existingType && existingType.slug !== slug) {
        throw new BadRequestException(
          `Slug ${updateVariantTypeDto.slug} is already in use`,
        );
      }
    }

    const updatedType = await this.variantTypeModel
      .findOneAndUpdate({ slug }, updateVariantTypeDto, { new: true })
      .exec();
    if (!updatedType) {
      throw new NotFoundException(`VariantType with slug ${slug} not found`);
    }
    return updatedType;
  }

  /**
   * Xóa loại biến thể theo slug.
   */
  async removeTypeBySlug(slug: string): Promise<{ message: string }> {
    const deletedType = await this.variantTypeModel
      .findOneAndDelete({ slug })
      .exec();
    if (!deletedType) {
      throw new NotFoundException(`VariantType with slug ${slug} not found`);
    }
    return { message: 'VariantType deleted successfully' };
  }

  /**
   * Tạo mới giá trị biến thể (Variant).
   */
  async create(createVariantDto: CreateVariantDto): Promise<Variant> {
    // Kiểm tra variantType tồn tại
    const variantType = await this.variantTypeModel
      .findById(createVariantDto.variantType)
      .exec();
    if (!variantType) {
      throw new NotFoundException(
        `VariantType with id ${createVariantDto.variantType} not found`,
      );
    }

    const baseSlug =
      createVariantDto.slug ||
      removeVietnameseTones(createVariantDto.name)
        .toLowerCase()
        .replace(/\s+/g, '-');
    const slug = await this.generateUniqueSlug(baseSlug, this.variantModel);

    const newVariant = new this.variantModel({
      ...createVariantDto,
      slug,
    });
    return newVariant.save();
  }

  /**
   * Lấy danh sách giá trị biến thể.
   */
  async findAll(): Promise<Variant[]> {
    return this.variantModel.find().populate('variantType').exec();
  }

  /**
   * Lấy giá trị biến thể theo slug.
   */
  async findOneBySlug(slug: string): Promise<Variant> {
    const variant = await this.variantModel
      .findOne({ slug })
      .populate('variantType')
      .exec();
    if (!variant) {
      throw new NotFoundException(`Variant with slug ${slug} not found`);
    }
    return variant;
  }

  /**
   * Cập nhật giá trị biến thể theo slug.
   */
  async updateBySlug(
    slug: string,
    updateVariantDto: UpdateVariantDto,
  ): Promise<Variant> {
    if (updateVariantDto.slug) {
      const existingVariant = await this.variantModel
        .findOne({ slug: updateVariantDto.slug })
        .exec();
      if (existingVariant && existingVariant.slug !== slug) {
        throw new BadRequestException(
          `Slug ${updateVariantDto.slug} is already in use`,
        );
      }
    }

    if (updateVariantDto.variantType) {
      const variantType = await this.variantTypeModel
        .findById(updateVariantDto.variantType)
        .exec();
      if (!variantType) {
        throw new NotFoundException(
          `VariantType with id ${updateVariantDto.variantType} not found`,
        );
      }
    }

    const updatedVariant = await this.variantModel
      .findOneAndUpdate({ slug }, updateVariantDto, { new: true })
      .populate('variantType')
      .exec();
    if (!updatedVariant) {
      throw new NotFoundException(`Variant with slug ${slug} not found`);
    }
    return updatedVariant;
  }

  /**
   * Xóa giá trị biến thể theo slug.
   */
  async removeBySlug(slug: string): Promise<{ message: string }> {
    const deletedVariant = await this.variantModel
      .findOneAndDelete({ slug })
      .exec();
    if (!deletedVariant) {
      throw new NotFoundException(`Variant with slug ${slug} not found`);
    }
    return { message: 'Variant deleted successfully' };
  }

  /**
   * Lấy danh sách giá trị biến thể theo loại.
   */
  async findByType(typeSlug: string): Promise<Variant[]> {
    const variantType = await this.findTypeBySlug(typeSlug);
    return this.variantModel
      .find({ variantType: variantType._id })
      .populate('variantType')
      .exec();
  }

  /**
   * Cập nhật tên của biến thể.
   */
  async updateVariantName(
    slug: string,
    newVariantName: string,
  ): Promise<Variant> {
    if (!newVariantName) {
      throw new BadRequestException('New variant name is required');
    }

    const updatedVariant = await this.variantModel
      .findOneAndUpdate(
        { slug },
        { name: newVariantName },
        { new: true }
      )
      .populate('variantType')
      .exec();

    if (!updatedVariant) {
      throw new NotFoundException(`Variant with slug ${slug} not found`);
    }

    return updatedVariant;
  }

  /**
   * Cập nhật giá trị của biến thể.
   */
  async updateVariantValues(
    slug: string,
    newValues: string[],
  ): Promise<Variant> {
    if (!newValues || !Array.isArray(newValues)) {
      throw new BadRequestException('New values must be an array');
    }

    const updatedVariant = await this.variantModel
      .findOneAndUpdate(
        { slug },
        { values: newValues },
        { new: true }
      )
      .populate('variantType')
      .exec();

    if (!updatedVariant) {
      throw new NotFoundException(`Variant with slug ${slug} not found`);
    }

    return updatedVariant;
  }

  /**
   * Cập nhật slug của biến thể.
   */
  async updateSlug(
    currentSlug: string,
    newSlug: string,
  ): Promise<Variant> {
    if (!newSlug) {
      throw new BadRequestException('New slug is required');
    }

    // Kiểm tra xem slug mới đã tồn tại chưa
    const existingVariant = await this.variantModel
      .findOne({ slug: newSlug })
      .exec();
    if (existingVariant) {
      throw new BadRequestException(`Slug ${newSlug} is already in use`);
    }

    const updatedVariant = await this.variantModel
      .findOneAndUpdate(
        { slug: currentSlug },
        { slug: newSlug },
        { new: true }
      )
      .populate('variantType')
      .exec();

    if (!updatedVariant) {
      throw new NotFoundException(`Variant with slug ${currentSlug} not found`);
    }

    return updatedVariant;
  }
}
