import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from '../schemas/contact.schema';
import { CreateContactDto } from '../dtos/create-contact.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private readonly adminEmail: string;

  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.adminEmail = this.configService.get<string>('ADMIN_EMAIL') ?? 'cskh.quanlythongbao@gmail.com';
  }

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const newContact = new this.contactModel(createContactDto);
    const savedContact = await newContact.save();

    try {
      // Send notification to admin if option is selected
      if (createContactDto.sendNotificationToAdmin !== false) {
        await this.sendAdminNotification(savedContact);
      }

      // Send confirmation to customer if option is selected and customer email is provided
      if (createContactDto.sendConfirmationToCustomer && createContactDto.customerEmail) {
        await this.sendCustomerConfirmation(savedContact);
      }
    } catch (error) {
      this.logger.error(`Error sending email notifications: ${error.message}`, error.stack);
      // We don't throw the error here to not disrupt the contact creation flow
    }

    return savedContact;
  }

  private async sendAdminNotification(contact: ContactDocument): Promise<void> {
    await this.mailerService.sendMail({
      to: this.adminEmail,
      subject: 'New Contact Form Submission',
      template: './admin-notification',
      context: {
        contact: contact.toObject(),
        date: new Date().toLocaleString(),
      },
    });
  }

  private async sendCustomerConfirmation(contact: ContactDocument): Promise<void> {
    if (!contact.customerEmail) {
      return;
    }

    await this.mailerService.sendMail({
      to: contact.customerEmail,
      subject: 'Thank You for Contacting Us',
      template: './customer-confirmation',
      context: {
        contact: contact.toObject(),
        date: new Date().toLocaleString(),
      },
    });
  }

  async findAll(): Promise<Contact[]> {
    return this.contactModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactModel.findById(id).exec();
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    return contact;
  }

  async remove(id: string): Promise<Contact> {
    const deletedContact = await this.contactModel.findByIdAndDelete(id).exec();
    if (!deletedContact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    return deletedContact;
  }
}
