import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Filter, FilterDocument } from '../schemas/filter.schema';
import { CreateFilterDto, UpdateFilterDto } from '../dtos/filter.dto';

@Injectable()
export class FilterService {
  constructor(
    @InjectModel(Filter.name) private filterModel: Model<FilterDocument>,
  ) {}

  async create(createFilterDto: CreateFilterDto): Promise<Filter> {
    try {
      console.log('Creating filter with data:', JSON.stringify(createFilterDto, null, 2));
      
      // Validate range options if type is range
      if (createFilterDto.type === 'range') {
        if (!createFilterDto.rangeOptions?.length) {
          throw new BadRequestException('Range filter must have at least one range option');
        }

        // Validate each range option
        createFilterDto.rangeOptions.forEach((option, index) => {
          if (!option.label) {
            throw new BadRequestException(`Range option at index ${index} must have a label`);
          }
          if (option.min < 0) {
            throw new BadRequestException(`Range option at index ${index} must have min >= 0`);
          }
          if (option.max <= option.min) {
            throw new BadRequestException(`Range option at index ${index} must have max > min`);
          }
        });
      }

      const filterData: Partial<Filter> = {
        name: createFilterDto.name,
        type: createFilterDto.type,
        categories: createFilterDto.categories?.map(id => new Types.ObjectId(id)),
        options: createFilterDto.type === 'range' ? [] : (createFilterDto.options || []),
        rangeOptions: createFilterDto.type === 'range' ? createFilterDto.rangeOptions : []
      };

      console.log('Processed filter data:', JSON.stringify(filterData, null, 2));

      const createdFilter = new this.filterModel(filterData);
      const savedFilter = await createdFilter.save();
      
      console.log('Saved filter:', JSON.stringify(savedFilter.toObject(), null, 2));
      
      return savedFilter;
    } catch (error) {
      console.error('Error creating filter:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to create filter');
    }
  }

  async findAll(): Promise<Filter[]> {
    return this.filterModel.find().populate('categories').exec();
  }

  async findOne(id: string): Promise<Filter> {
    const filter = await this.filterModel.findById(id).populate('categories').exec();
    if (!filter) {
      throw new NotFoundException(`Filter with ID ${id} not found`);
    }
    return filter;
  }

  async update(id: string, updateFilterDto: UpdateFilterDto): Promise<Filter> {
    try {
      console.log('Updating filter with data:', JSON.stringify(updateFilterDto, null, 2));

      // Validate range options if type is range
      if (updateFilterDto.type === 'range') {
        if (!updateFilterDto.rangeOptions?.length) {
          throw new BadRequestException('Range filter must have at least one range option');
        }

        // Validate each range option
        updateFilterDto.rangeOptions.forEach((option, index) => {
          if (!option.label) {
            throw new BadRequestException(`Range option at index ${index} must have a label`);
          }
          if (option.min < 0) {
            throw new BadRequestException(`Range option at index ${index} must have min >= 0`);
          }
          if (option.max <= option.min) {
            throw new BadRequestException(`Range option at index ${index} must have max > min`);
          }
        });
      }
      
      const filterData: Partial<Filter> = {
        name: updateFilterDto.name,
        type: updateFilterDto.type,
        categories: updateFilterDto.categories?.map(id => new Types.ObjectId(id)),
        options: updateFilterDto.type === 'range' ? [] : (updateFilterDto.options || []),
        rangeOptions: updateFilterDto.type === 'range' ? updateFilterDto.rangeOptions : []
      };

      console.log('Processed update data:', JSON.stringify(filterData, null, 2));

      const updatedFilter = await this.filterModel
        .findByIdAndUpdate(id, filterData, { new: true })
        .populate('categories')
        .exec();

      if (!updatedFilter) {
        throw new NotFoundException(`Filter with ID ${id} not found`);
      }

      console.log('Updated filter:', JSON.stringify(updatedFilter.toObject(), null, 2));
      return updatedFilter;
    } catch (error) {
      console.error('Error updating filter:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to update filter');
    }
  }

  async remove(id: string): Promise<Filter> {
    const deletedFilter = await this.filterModel
      .findByIdAndDelete(id)
      .populate('categories')
      .exec();
    if (!deletedFilter) {
      throw new NotFoundException(`Filter with ID ${id} not found`);
    }
    return deletedFilter;
  }

  async findByCategory(categoryId: string): Promise<Filter[]> {
    return this.filterModel
      .find({ categories: new Types.ObjectId(categoryId) })
      .populate('categories')
      .exec();
  }
}
