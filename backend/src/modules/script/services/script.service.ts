import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Script, ScriptDocument } from '../schemas/script.schema';
import { CreateScriptDto, UpdateScriptDto, ScriptPosition } from '../dto/script.dto';

@Injectable()
export class ScriptService {
  constructor(
    @InjectModel(Script.name) private scriptModel: Model<ScriptDocument>,
  ) { }

  async create(createScriptDto: CreateScriptDto): Promise<Script> {
    const createdScript = new this.scriptModel(createScriptDto);
    return createdScript.save();
  }

  async findAll(): Promise<Script[]> {
    return this.scriptModel.find().exec();
  }

  async findByPosition(position: ScriptPosition): Promise<Script[]> {
    return this.scriptModel.find({ position, isActive: true }).exec();
  }

  async findOne(id: string): Promise<Script> {
    const script = await this.scriptModel.findById(id).exec();
    if (!script) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
    return script;
  }

  async update(id: string, updateScriptDto: UpdateScriptDto): Promise<Script> {
    const updatedScript = await this.scriptModel
      .findByIdAndUpdate(id, updateScriptDto, { new: true })
      .exec();
    if (!updatedScript) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
    return updatedScript;
  }

  async remove(id: string): Promise<Script> {
    const deletedScript = await this.scriptModel.findByIdAndDelete(id).exec();
    if (!deletedScript) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
    return deletedScript;
  }

  async toggleActive(id: string): Promise<Script> {
    const script = await this.scriptModel.findById(id).exec();
    if (!script) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
    script.isActive = !script.isActive;
    return script.save();
  }

  async getAllScriptsBySection(): Promise<Record<ScriptPosition, Script[]>> {
    const scripts = await this.scriptModel.find({ isActive: true }).exec();

    return {
      [ScriptPosition.HEADER]: scripts.filter(s => s.position === ScriptPosition.HEADER),
      [ScriptPosition.MAIN]: scripts.filter(s => s.position === ScriptPosition.MAIN),
      [ScriptPosition.FOOTER]: scripts.filter(s => s.position === ScriptPosition.FOOTER),
    };
  }
}