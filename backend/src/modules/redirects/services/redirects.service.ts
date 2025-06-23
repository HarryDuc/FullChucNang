import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Redirect } from '../schemas/redirect.schema';
import { CreateRedirectDto, UpdateRedirectDto } from '../dtos/redirect.dto';

@Injectable()
export class RedirectsService {
  constructor(
    @InjectModel(Redirect.name) private redirectModel: Model<Redirect>,
  ) {}

  /**
   * Tìm URL redirect dựa trên đường dẫn cũ
   * @param oldPath Đường dẫn cũ cần kiểm tra
   * @returns Thông tin redirect nếu tồn tại, null nếu không tìm thấy
   */
  async findRedirectByPath(oldPath: string): Promise<Redirect | null> {
    // Đảm bảo path luôn bắt đầu bằng dấu /
    if (!oldPath.startsWith('/')) {
      oldPath = `/${oldPath}`;
    }

    // Tìm redirect active và cập nhật thông tin hit
    const redirect = await this.redirectModel.findOneAndUpdate(
      { oldPath, isActive: true },
      { 
        $inc: { hitCount: 1 },
        $set: { lastAccessed: new Date() }
      },
      { new: true }
    );

    return redirect;
  }

  /**
   * Thêm mới một redirect
   */
  async create(createRedirectDto: CreateRedirectDto): Promise<Redirect> {
    // Đảm bảo path luôn bắt đầu bằng dấu /
    let { oldPath, newPath } = createRedirectDto;
    
    if (!oldPath.startsWith('/')) {
      oldPath = `/${oldPath}`;
    }
    
    if (!newPath.startsWith('/')) {
      newPath = `/${newPath}`;
    }

    // Kiểm tra nếu redirect đã tồn tại
    const existingRedirect = await this.redirectModel.findOne({ oldPath });
    
    if (existingRedirect) {
      // Cập nhật redirect đã tồn tại
      existingRedirect.newPath = newPath;
      existingRedirect.type = createRedirectDto.type || existingRedirect.type;
      existingRedirect.isActive = createRedirectDto.isActive !== undefined 
        ? createRedirectDto.isActive 
        : existingRedirect.isActive;
      existingRedirect.statusCode = createRedirectDto.statusCode || existingRedirect.statusCode;
      
      return existingRedirect.save();
    }

    // Tạo redirect mới nếu chưa tồn tại
    const redirect = new this.redirectModel({
      ...createRedirectDto,
      oldPath,
      newPath,
    });
    
    return redirect.save();
  }

  /**
   * Tạo nhiều redirect cùng lúc
   */
  async createBulk(redirects: CreateRedirectDto[]): Promise<{ created: number, updated: number }> {
    let created = 0;
    let updated = 0;

    for (const redirect of redirects) {
      const existingRedirect = await this.redirectModel.findOne({ 
        oldPath: redirect.oldPath.startsWith('/') ? redirect.oldPath : `/${redirect.oldPath}`
      });
      
      if (existingRedirect) {
        await this.update(existingRedirect._id.toString(), redirect);
        updated++;
      } else {
        await this.create(redirect);
        created++;
      }
    }

    return { created, updated };
  }

  /**
   * Lấy tất cả redirect với phân trang và bộ lọc
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    type?: string,
    isActive?: boolean,
    path?: string,
    statusCode?: number
  ): Promise<{
    data: Redirect[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = {};
    
    if (type) {
      query.type = type;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (path) {
      // Tìm kiếm không phân biệt hoa thường và một phần của path
      const pathRegex = new RegExp(path, 'i');
      query.$or = [
        { oldPath: pathRegex },
        { newPath: pathRegex }
      ];
    }

    if (statusCode) {
      query.statusCode = statusCode;
    }

    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.redirectModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.redirectModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy thông tin redirect theo ID
   */
  async findOne(id: string): Promise<Redirect> {
    const redirect = await this.redirectModel.findById(id).exec();
    
    if (!redirect) {
      throw new NotFoundException(`Redirect với ID ${id} không tồn tại`);
    }
    
    return redirect;
  }

  /**
   * Cập nhật thông tin redirect
   */
  async update(id: string, updateRedirectDto: UpdateRedirectDto): Promise<Redirect> {
    const { oldPath, newPath, ...updateData } = updateRedirectDto;
    
    const updateObj: any = { ...updateData };
    
    // Chỉ cập nhật các path nếu được cung cấp
    if (oldPath) {
      updateObj.oldPath = oldPath.startsWith('/') ? oldPath : `/${oldPath}`;
    }
    
    if (newPath) {
      updateObj.newPath = newPath.startsWith('/') ? newPath : `/${newPath}`;
    }

    const redirect = await this.redirectModel
      .findByIdAndUpdate(id, updateObj, { new: true })
      .exec();
      
    if (!redirect) {
      throw new NotFoundException(`Redirect với ID ${id} không tồn tại`);
    }
    
    return redirect;
  }

  /**
   * Xóa redirect theo ID
   */
  async remove(id: string): Promise<Redirect> {
    const redirect = await this.redirectModel.findByIdAndDelete(id).exec();
    
    if (!redirect) {
      throw new NotFoundException(`Redirect với ID ${id} không tồn tại`);
    }
    
    return redirect;
  }
} 