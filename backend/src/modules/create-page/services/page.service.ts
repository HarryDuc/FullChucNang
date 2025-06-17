import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Page, PageDocument } from '../schemas/page.schema';
import { CreatePageDto } from '../dtos/create-page.dto';

@Injectable()
export class PageService {
  constructor(
    @InjectModel(Page.name) private pageModel: Model<PageDocument>,
  ) { }

  async create(createPageDto: CreatePageDto): Promise<Page> {
    const createdPage = new this.pageModel(createPageDto);
    return createdPage.save();
  }

  async findAll(): Promise<Page[]> {
    return this.pageModel.find().exec();
  }

  async findOne(id: string): Promise<Page> {
    const page = await this.pageModel.findById(id).exec();
    if (!page) {
      throw new NotFoundException(`Page with ID "${id}" not found`);
    }
    return page;
  }

  async findBySlug(slug: string): Promise<Page> {
    const page = await this.pageModel.findOne({ slug }).exec();
    if (!page) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }
    return page;
  }

  async update(slug: string, updatePageDto: Partial<CreatePageDto>): Promise<Page> {
    const updatedPage = await this.pageModel
      .findOneAndUpdate({ slug }, updatePageDto, { new: true })
      .exec();
    if (!updatedPage) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }
    return updatedPage;
  }

  async remove(slug: string): Promise<Page> {
    const deletedPage = await this.pageModel.findOneAndDelete({ slug }).exec();
    if (!deletedPage) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }
    return deletedPage;
  }
}