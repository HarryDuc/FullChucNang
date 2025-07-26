import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { FilterService } from '../services/filter.service';
import { CreateFilterDto, UpdateFilterDto } from '../dtos/filter.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('filtersapi')
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
//   @UseInterceptors(FileInterceptor('file'))
  async create(@Body() createFilterDto: CreateFilterDto) {
    try {
      console.log('Creating filter with DTO:', JSON.stringify(createFilterDto, null, 2));
      const result = await this.filterService.create(createFilterDto);
      console.log('Created filter:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error creating filter:', error);
      throw error;
    }
  }

  @Get()
  async findAll() {
    return this.filterService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.filterService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Param('id') id: string, @Body() updateFilterDto: UpdateFilterDto) {
    try {
      console.log('Updating filter with DTO:', JSON.stringify(updateFilterDto, null, 2));
      const result = await this.filterService.update(id, updateFilterDto);
      console.log('Updated filter:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error updating filter:', error);
      throw error;
    }
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string) {
    return this.filterService.remove(id);
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.filterService.findByCategory(categoryId);
  }

  @Get('debug/:id')
  async debugFilter(@Param('id') id: string) {
    return this.filterService.debugFilterCategories(id);
  }
}
