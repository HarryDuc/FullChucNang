import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactList, ContactListDocument } from '../schemas/info-website.schema';
import { CreateContactListDto, UpdateContactListDto } from '../dtos/info-website.dto';

@Injectable()
export class ContactListService {
  constructor(
    @InjectModel(ContactList.name)
    private contactListModel: Model<ContactListDocument>,
  ) { }

  async create(createContactListDto: CreateContactListDto): Promise<ContactList> {
    const createdContact = new this.contactListModel(createContactListDto);
    return createdContact.save();
  }

  async findAll(): Promise<ContactList[]> {
    return this.contactListModel.find().exec();
  }

  async findOne(id: string): Promise<ContactList> {
    const contact = await this.contactListModel.findById(id).exec();
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    return contact;
  }

  async findActive(): Promise<ContactList> {
    const contact = await this.contactListModel.findOne({ isActive: true }).exec();
    if (!contact) {
      throw new NotFoundException('No active contact information found');
    }
    return contact;
  }

  async update(id: string, updateContactListDto: UpdateContactListDto): Promise<ContactList> {
    const updatedContact = await this.contactListModel
      .findByIdAndUpdate(id, updateContactListDto, { new: true })
      .exec();
    if (!updatedContact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    return updatedContact;
  }

  async remove(id: string): Promise<ContactList> {
    const deletedContact = await this.contactListModel.findByIdAndDelete(id).exec();
    if (!deletedContact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    return deletedContact;
  }

  async setActive(id: string): Promise<ContactList> {
    // First, deactivate all contacts
    await this.contactListModel.updateMany({}, { isActive: false }).exec();

    // Then activate the selected contact
    const activatedContact = await this.contactListModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .exec();

    if (!activatedContact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return activatedContact;
  }
}