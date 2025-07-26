import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SpecificationService } from '../services/specification.service';
import { CreateSpecificationDto } from '../dtos/create-specification.dto';
import { UpdateSpecificationDto } from '../dtos/update-specification.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('specificationsapi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpecificationController {
  constructor(private readonly specificationService: SpecificationService) {}

  @Post()
  @Roles('admin')
  create(@Body() createSpecificationDto: CreateSpecificationDto) {
    return this.specificationService.create(createSpecificationDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.specificationService.findAll(query);
  }

  @Get('by-categories')
  findByCategories(@Query('categories') categories: string) {
    const categoryIds = categories.split(',');
    return this.specificationService.findByCategories(categoryIds);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.specificationService.findOne(slug);
  }

  @Patch(':slug')
  @Roles('admin')
  update(
    @Param('slug') slug: string,
    @Body() updateSpecificationDto: UpdateSpecificationDto,
  ) {
    return this.specificationService.update(slug, updateSpecificationDto);
  }

  @Delete(':slug')
  @Roles('admin')
  remove(@Param('slug') slug: string) {
    return this.specificationService.remove(slug);
  }

  @Patch(':slug/status')
  @Roles('admin')
  updateStatus(@Param('slug') slug: string, @Body('isActive') isActive: boolean) {
    return this.specificationService.updateStatus(slug, isActive);
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.specificationService.findByCategory(categoryId);
  }
} 