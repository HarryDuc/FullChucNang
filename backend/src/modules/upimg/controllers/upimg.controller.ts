import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpimgService } from '../services/upimg.service';
import { CreateUpimgDto } from '../dtos/create-upimg.dto';
import { UpdateUpimgDto } from '../dtos/update-upimg.dto';
import { UploadImagesDto, RemoveImageDto } from '../dtos/upload-images.dto';

@Controller('upimgapi')
export class UpimgController {
  constructor(private readonly upimgService: UpimgService) {}

  @Post()
  async create(@Body() createUpimgDto: CreateUpimgDto) {
    return this.upimgService.create(createUpimgDto);
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async createWithUpload(
    @Body() createUpimgDto: CreateUpimgDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif|webp)' }),
        ],
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.upimgService.uploadAndCreate(createUpimgDto, files);
  }

  @Get()
  async findAll(@Query() query: any) {
    console.log('Controller: findAll called with query:', query);
    const result = await this.upimgService.findAll(query);
    console.log('Controller: findAll result:', result);
    return result;
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.upimgService.findById(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.upimgService.findBySlug(slug);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUpimgDto: UpdateUpimgDto,
  ) {
    return this.upimgService.update(id, updateUpimgDto);
  }

  @Put(':id/upload')
  @UseInterceptors(FilesInterceptor('files'))
  async updateWithUpload(
    @Param('id') id: string,
    @Body() updateUpimgDto: UpdateUpimgDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif|webp)' }),
        ],
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.upimgService.uploadAndUpdate(id, updateUpimgDto, files);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.upimgService.delete(id);
  }

  @Post(':id/images')
  async uploadImages(
    @Param('id') id: string,
    @Body() uploadImagesDto: UploadImagesDto,
  ) {
    uploadImagesDto.upimgId = id;
    return this.upimgService.uploadImages(uploadImagesDto);
  }

  @Delete(':id/images/:imageId')
  async removeImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    const removeImageDto: RemoveImageDto = {
      upimgId: id,
      imageId: imageId,
    };
    return this.upimgService.removeImage(removeImageDto);
  }

  @Put(':id/order')
  async updateOrder(
    @Param('id') id: string,
    @Body() body: { order: number },
  ) {
    return this.upimgService.updateOrder(id, body.order);
  }

  @Get('search/:keyword')
  async search(@Param('keyword') keyword: string) {
    const query = {
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ],
    };
    return this.upimgService.findAll(query);
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    return this.upimgService.findAll({ status });
  }
} 