import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Specification, SpecificationDocument } from '../schemas/specification.schema';
import { CreateSpecificationDto } from '../dtos/create-specification.dto';
import { UpdateSpecificationDto } from '../dtos/update-specification.dto';

@Injectable()
export class SpecificationService {
  constructor(
    @InjectModel(Specification.name)
    private specificationModel: Model<SpecificationDocument>,
  ) {}

  async create(createSpecificationDto: CreateSpecificationDto): Promise<Specification> {
    const createdSpecification = new this.specificationModel(createSpecificationDto);
    return createdSpecification.save();
  }

  async findAll(query: any = {}): Promise<Specification[]> {
    return this.specificationModel
      .find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .exec();
  }

  async findOne(slug: string): Promise<Specification> {
    const specification = await this.specificationModel.findOne({ slug }).exec();
    if (!specification) {
      throw new NotFoundException(`Specification with slug "${slug}" not found`);
    }
    return specification;
  }

  async findByCategories(categoryIds: string[]): Promise<Specification[]> {
    return this.specificationModel
      .find({
        categories: { $in: categoryIds },
        isActive: true,
      })
      .sort({ displayOrder: 1 })
      .exec();
  }

  async update(slug: string, updateSpecificationDto: UpdateSpecificationDto): Promise<Specification> {
    const updatedSpecification = await this.specificationModel
      .findOneAndUpdate({ slug }, updateSpecificationDto, { new: true })
      .exec();
    if (!updatedSpecification) {
      throw new NotFoundException(`Specification with slug "${slug}" not found`);
    }
    return updatedSpecification;
  }

  async remove(slug: string): Promise<Specification> {
    const deletedSpecification = await this.specificationModel.findOneAndDelete({ slug }).exec();
    if (!deletedSpecification) {
      throw new NotFoundException(`Specification with slug "${slug}" not found`);
    }
    return deletedSpecification;
  }

  async updateStatus(slug: string, isActive: boolean): Promise<Specification> {
    const specification = await this.specificationModel
      .findOneAndUpdate({ slug }, { isActive }, { new: true })
      .exec();
    if (!specification) {
      throw new NotFoundException(`Specification with slug "${slug}" not found`);
    }
    return specification;
  }
} 