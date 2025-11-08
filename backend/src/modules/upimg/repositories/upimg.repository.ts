import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Upimg, UpimgDocument } from '../schemas/upimg.schema';
import { CreateUpimgDto } from '../dtos/create-upimg.dto';
import { UpdateUpimgDto } from '../dtos/update-upimg.dto';

@Injectable()
export class UpimgRepository {
  constructor(
    @InjectModel(Upimg.name) private upimgModel: Model<UpimgDocument>
  ) {}

  async create(createUpimgDto: CreateUpimgDto): Promise<Upimg> {
    console.log('Repository create called with:', createUpimgDto);
    
    // Convert imageIds to ObjectIds if provided
    if (createUpimgDto.imageIds && createUpimgDto.imageIds.length > 0) {
      console.log('Converting imageIds to ObjectIds:', createUpimgDto.imageIds);
      const objectIds = createUpimgDto.imageIds.map((id) => new Types.ObjectId(id));
      (createUpimgDto as any).images = objectIds;
      console.log('Converted to images field:', objectIds);
    }
    
    const createdUpimg = new this.upimgModel(createUpimgDto);
    const savedUpimg = await createdUpimg.save();
    console.log('Repository create saved:', savedUpimg);
    
    // Populate images after save
    const result = await this.upimgModel
      .findById(savedUpimg._id)
      .populate('images')
      .exec();
    
    console.log('Repository create result with populate:', result);
    return result || savedUpimg;
  }

  async findAll(query: any = {}): Promise<Upimg[]> {
    console.log('Repository: findAll called with query:', query);
    
    // Extract pagination and sorting parameters
    const { page, limit, status, sort, order, ...filterQuery } = query;
    
    // Build the filter query
    let filter: any = { ...filterQuery };
    
    // Add status filter if provided
    if (status) {
      filter.status = status;
    }
    
    console.log('Repository: filter query:', filter);
    
    // Build the query
    let mongooseQuery = this.upimgModel.find(filter).populate('images');
    
    // Apply sorting
    if (sort && order) {
      const sortOrder = order === 'desc' ? -1 : 1;
      mongooseQuery = mongooseQuery.sort({ [sort]: sortOrder });
    } else {
      // Default sorting
      mongooseQuery = mongooseQuery.sort({ order: 1, createdAt: -1 });
    }
    
    // Apply pagination
    if (page && limit) {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const skip = (pageNum - 1) * limitNum;
      
      console.log('Repository: applying pagination:', { page: pageNum, limit: limitNum, skip });
      mongooseQuery = mongooseQuery.skip(skip).limit(limitNum);
    }
    
    const result = await mongooseQuery.exec();
    console.log('Repository: findAll result:', result);
    console.log('Repository: findAll result images:', result.map(item => ({
      _id: item._id,
      title: item.title,
      imagesCount: item.images?.length || 0,
      images: item.images
    })));
    return result;
  }

  async findById(id: string): Promise<Upimg | null> {
    return this.upimgModel
      .findById(id)
      .populate('images')
      .exec();
  }

  async findBySlug(slug: string): Promise<Upimg | null> {
    return this.upimgModel
      .findOne({ slug })
      .populate('images')
      .exec();
  }

  async update(id: string, updateUpimgDto: UpdateUpimgDto): Promise<Upimg | null> {
    // Convert imageIds to ObjectIds if provided
    if ((updateUpimgDto as any).imageIds && (updateUpimgDto as any).imageIds.length > 0) {
      const objectIds = (updateUpimgDto as any).imageIds.map((id: string) => new Types.ObjectId(id));
      (updateUpimgDto as any).images = objectIds;
      delete (updateUpimgDto as any).imageIds;
    }
    return this.upimgModel
      .findByIdAndUpdate(id, updateUpimgDto, { new: true })
      .populate('images')
      .exec();
  }

  async delete(id: string): Promise<Upimg | null> {
    return this.upimgModel.findByIdAndDelete(id).exec();
  }

  async addImages(id: string, imageIds: string[]): Promise<Upimg | null> {
    console.log('addImages called with id:', id, 'imageIds:', imageIds);
    
    const objectIds = imageIds.map((id) => new Types.ObjectId(id));
    console.log('Converted to ObjectIds:', objectIds);
    
    const result = await this.upimgModel
      .findByIdAndUpdate(
        id,
        { $addToSet: { images: { $each: objectIds } } },
        { new: true }
      )
      .populate('images')
      .exec();
      
    console.log('addImages result:', result);
    return result;
  }

  async removeImage(id: string, imageId: string): Promise<Upimg | null> {
    return this.upimgModel
      .findByIdAndUpdate(
        id,
        { $pull: { images: new Types.ObjectId(imageId) } },
        { new: true }
      )
      .populate('images')
      .exec();
  }

  async updateOrder(id: string, order: number): Promise<Upimg | null> {
    return this.upimgModel
      .findByIdAndUpdate(id, { order }, { new: true })
      .populate('images')
      .exec();
  }

  async count(query: any = {}): Promise<number> {
    return this.upimgModel.countDocuments(query).exec();
  }

  getModel() {
    return this.upimgModel;
  }
} 