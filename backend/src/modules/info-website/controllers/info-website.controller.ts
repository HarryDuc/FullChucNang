import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ContactListService } from '../services/info-website.service';
import { CreateContactListDto, UpdateContactListDto } from '../dtos/info-website.dto'
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PermissionGuard } from 'src/modules/permissions/guards/permission.guard';
import { RequirePermission } from 'src/common/decorators/permission.decorator';

@Controller('info-websitesapi')
export class ContactListController {
  constructor(private readonly contactListService: ContactListService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('info-website', 'create')
  create(@Body() createContactListDto: CreateContactListDto) {
    return this.contactListService.create(createContactListDto);
  }

  @Get()
  findAll() {
    return this.contactListService.findAll();
  }

  @Get('active')
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  // @Roles('admin')
  // @RequirePermission('info-website', 'read')
  findActive() {
    return this.contactListService.findActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactListService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('info-website', 'update')
  update(
    @Param('id') id: string,
    @Body() updateContactListDto: UpdateContactListDto,
  ) {
    return this.contactListService.update(id, updateContactListDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('info-website', 'delete')
  remove(@Param('id') id: string) {
    return this.contactListService.remove(id);
  }

  @Patch(':id/set-active')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('info-website', 'activate')
  setActive(@Param('id') id: string) {
    return this.contactListService.setActive(id);
  }
}