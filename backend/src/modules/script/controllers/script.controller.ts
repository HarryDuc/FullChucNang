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
import { ScriptService } from '../services/script.service';
import { CreateScriptDto, UpdateScriptDto, ScriptPosition } from '../dto/script.dto';
import { Script } from '../schemas/script.schema';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RequirePermission } from 'src/common/decorators/permission.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionGuard } from 'src/modules/permissions/guards/permission.guard';

@Controller('scripts')
export class ScriptController {
  constructor(private readonly scriptService: ScriptService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('script', 'create')
  create(@Body() createScriptDto: CreateScriptDto): Promise<Script> {
    return this.scriptService.create(createScriptDto);
  }

  @Get()
  findAll(): Promise<Script[]> {
    return this.scriptService.findAll();
  }

  @Get('position/:position')
  findByPosition(@Param('position') position: ScriptPosition): Promise<Script[]> {
    return this.scriptService.findByPosition(position);
  }

  @Get('sections')
  getAllScriptsBySection(): Promise<Record<ScriptPosition, Script[]>> {
    return this.scriptService.getAllScriptsBySection();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Script> {
    return this.scriptService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('script', 'update')
  update(
    @Param('id') id: string,
    @Body() updateScriptDto: UpdateScriptDto,
  ): Promise<Script> {
    return this.scriptService.update(id, updateScriptDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('script', 'delete')
  remove(@Param('id') id: string): Promise<Script> {
    return this.scriptService.remove(id);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermission('script', 'update')
  toggleActive(@Param('id') id: string): Promise<Script> {
    return this.scriptService.toggleActive(id);
  }
}