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
import { PageService } from '../services/page.service';
import { CreatePageDto } from '../dtos/create-page.dto';
import { Page } from '../schemas/page.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PermissionGuard } from 'src/modules/permissions/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';

@Controller('pagesapi')
export class PageController {
  constructor(private readonly pageService: PageService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('pages', 'create')
  create(@Body() createPageDto: CreatePageDto): Promise<Page> {
    return this.pageService.create(createPageDto);
  }

  @Get()
  findAll(): Promise<Page[]> {
    return this.pageService.findAll();
  }

  @Get('by-slug/:slug')
  findBySlug(@Param('slug') slug: string): Promise<Page> {
    return this.pageService.findBySlug(slug);
  }

  @Put('by-slug/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager')
  @RequirePermission('pages', 'update')
  update(
    @Param('slug') slug: string,
    @Body() updatePageDto: Partial<CreatePageDto>,
  ): Promise<Page> {
    return this.pageService.update(slug, updatePageDto);
  }

  @Delete('by-slug/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('pages', 'delete')
  remove(@Param('slug') slug: string): Promise<Page> {
    return this.pageService.remove(slug);
  }
}