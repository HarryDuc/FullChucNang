export class CreateContactListDto {
  logo?: string;
  map?: string;
  favicon?: string;
  name?: string;
  mst?: string;
  date_start?: string;
  company_name?: string;
  youtube?: string;
  facebook?: string;
  phone?: string;
  website?: string;
  zalo?: string;
  whatsapp?: string;
  hotline?: string;
  twitter?: string;
  telegram?: string;
  instagram?: string;
  email?: string;
  address?: string;
  description?: string;
  isActive?: boolean;
}

export class UpdateContactListDto extends CreateContactListDto { }

export class ContactListResponseDto extends CreateContactListDto {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}