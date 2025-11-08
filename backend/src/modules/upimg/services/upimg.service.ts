import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpimgRepository } from '../repositories/upimg.repository';
import { CreateUpimgDto } from '../dtos/create-upimg.dto';
import { UpdateUpimgDto } from '../dtos/update-upimg.dto';
import { UploadImagesDto, RemoveImageDto } from '../dtos/upload-images.dto';
import { ImagesService } from '../../images/services/images.service';
import { generateUniqueSlug } from '../../../common/utils/slug.utils';

@Injectable()
export class UpimgService {
  constructor(
    private readonly upimgRepository: UpimgRepository,
    private readonly imagesService: ImagesService
  ) {}

  async create(createUpimgDto: CreateUpimgDto): Promise<any> {
    console.log('create method called with:', createUpimgDto);

    // Validate image IDs if provided
    if (createUpimgDto.imageIds && createUpimgDto.imageIds.length > 0) {
      console.log('Validating imageIds:', createUpimgDto.imageIds);
      await this.validateImageIds(createUpimgDto.imageIds);
    }

    // Generate slug if not provided
    if (!createUpimgDto.slug) {
      const titleForSlug = createUpimgDto.title || 'untitled';
      console.log('Generating slug for title:', titleForSlug);
      createUpimgDto.slug = await generateUniqueSlug(titleForSlug, this.upimgRepository.getModel());
      console.log('Generated slug:', createUpimgDto.slug);
    }

    const result = await this.upimgRepository.create(createUpimgDto);
    console.log('Created upimg result:', result);
    return result;
  }

  async findAll(query: any = {}): Promise<any[]> {
    console.log('Service: findAll called with query:', query);
    const result = await this.upimgRepository.findAll(query);
    console.log('Service: findAll result:', result);
    return result;
  }

  async findById(id: string): Promise<any> {
    const upimg = await this.upimgRepository.findById(id);
    if (!upimg) {
      throw new NotFoundException('Upimg not found');
    }
    return upimg;
  }

  async findBySlug(slug: string): Promise<any> {
    const upimg = await this.upimgRepository.findBySlug(slug);
    if (!upimg) {
      throw new NotFoundException('Upimg not found');
    }
    return upimg;
  }

  async update(id: string, updateUpimgDto: UpdateUpimgDto): Promise<any> {
    // Validate image IDs if provided
    if (updateUpimgDto.imageIds && updateUpimgDto.imageIds.length > 0) {
      await this.validateImageIds(updateUpimgDto.imageIds);
    }

    const upimg = await this.upimgRepository.update(id, updateUpimgDto);
    if (!upimg) {
      throw new NotFoundException('Upimg not found');
    }
    return upimg;
  }

  async delete(id: string): Promise<any> {
    const upimg = await this.upimgRepository.delete(id);
    if (!upimg) {
      throw new NotFoundException('Upimg not found');
    }
    return upimg;
  }

  async uploadImages(uploadImagesDto: UploadImagesDto): Promise<any> {
    const { upimgId, imageIds } = uploadImagesDto;

    // Validate upimg exists
    const upimg = await this.findById(upimgId);
    if (!upimg) {
      throw new NotFoundException('Upimg not found');
    }

    // Validate image IDs
    if (imageIds && imageIds.length > 0) {
      await this.validateImageIds(imageIds);
    }

    const result = await this.upimgRepository.addImages(upimgId, imageIds || []);
    if (!result) {
      throw new NotFoundException('Upimg not found');
    }
    return result;
  }

  async removeImage(removeImageDto: RemoveImageDto): Promise<any> {
    const { upimgId, imageId } = removeImageDto;

    // Validate upimg exists
    const upimg = await this.findById(upimgId);
    if (!upimg) {
      throw new NotFoundException('Upimg not found');
    }

    // Validate image exists in upimg
    const imageExists = upimg.images.some(img => img._id.toString() === imageId);
    if (!imageExists) {
      throw new BadRequestException('Image not found in this upimg');
    }

    const result = await this.upimgRepository.removeImage(upimgId, imageId);
    if (!result) {
      throw new NotFoundException('Upimg not found');
    }
    return result;
  }

  async updateOrder(id: string, order: number): Promise<any> {
    const upimg = await this.upimgRepository.updateOrder(id, order);
    if (!upimg) {
      throw new NotFoundException('Upimg not found');
    }
    return upimg;
  }

  async uploadAndCreate(createUpimgDto: CreateUpimgDto, files: Express.Multer.File[]): Promise<any> {
    console.log('uploadAndCreate called with:', { createUpimgDto, filesCount: files?.length });

    // Upload images first
    const uploadedImages: string[] = [];
    if (files && files.length > 0) {
      console.log('Processing files:', files.length);
      for (const file of files) {
        console.log('Uploading file:', file.originalname, file.size);
        const uploadedImage = await this.imagesService.uploadImage(file);
        console.log('Uploaded image:', uploadedImage);
        uploadedImages.push((uploadedImage._id as any).toString());
      }
    }

    // Create upimg with uploaded image IDs
    createUpimgDto.imageIds = uploadedImages;
    console.log('Creating upimg with imageIds:', uploadedImages);
    console.log('Final createUpimgDto:', createUpimgDto);
    const result = await this.create(createUpimgDto);
    console.log('Created upimg result:', result);

    // Fetch the created upimg with populated images
    const populatedResult = await this.findById(result._id);
    console.log('Created upimg with populated images:', populatedResult);
    return populatedResult;
  }

  async uploadAndUpdate(id: string, updateUpimgDto: UpdateUpimgDto, files: Express.Multer.File[]): Promise<any> {
    // Upload images first
    const uploadedImages: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const uploadedImage = await this.imagesService.uploadImage(file);
        uploadedImages.push((uploadedImage._id as any).toString());
      }
    }

    // Lấy danh sách ảnh cũ
    const upimg = await this.findById(id);
    const oldImageIds = (upimg?.images || []).map((img: any) => img._id?.toString());

    // Nếu có ảnh mới thì gộp ảnh cũ + mới, nếu không thì giữ nguyên ảnh cũ
    if (uploadedImages.length > 0) {
      updateUpimgDto.imageIds = [...oldImageIds, ...uploadedImages];
    } else {
      updateUpimgDto.imageIds = oldImageIds;
    }

    return this.update(id, updateUpimgDto);
  }

  private async validateImageIds(imageIds: string[]): Promise<void> {
    for (const imageId of imageIds) {
      try {
        await this.imagesService.findById(imageId);
      } catch (error) {
        throw new BadRequestException(`Image with ID ${imageId} not found`);
      }
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}