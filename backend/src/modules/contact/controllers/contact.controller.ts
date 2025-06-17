import { Controller, Get, Post, Body, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { ContactService } from '../services/contact.service';
import { CreateContactDto } from '../dtos/create-contact.dto';
import { Contact } from '../schemas/contact.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PermissionGuard } from '../../permissions/guards/permission.guard';
import { RequirePermission } from '../../../common/decorators/permission.decorator';

@Controller('contactsapi')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  @Post()
  async create(@Body() createContactDto: CreateContactDto): Promise<Contact> {
    return this.contactService.create(createContactDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager', 'staff')
  @RequirePermission('contact', 'list')
  async findAll(): Promise<Contact[]> {
    return this.contactService.findAll();
  }
  // async findAll(): Promise<Contact[]> {
  //   return this.contactService.findAll();
  // }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'manager', 'staff')
  @RequirePermission('contact', 'read')
  async findOne(@Param('id') id: string): Promise<Contact> {
    return this.contactService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('contact', 'delete')
  async remove(@Param('id') id: string): Promise<Contact> {
    return this.contactService.remove(id);
  }
}
