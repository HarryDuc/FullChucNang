import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactListController } from './controllers/info-website.controller';
import { ContactListService } from './services/info-website.service';
import { ContactList, ContactListSchema } from './schemas/info-website.schema';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContactList.name, schema: ContactListSchema },
    ]),
    forwardRef(() => AuthModule),
    PermissionsModule,
  ],
  controllers: [ContactListController],
  providers: [ContactListService],
  exports: [ContactListService],
})
export class ContactListModule { }