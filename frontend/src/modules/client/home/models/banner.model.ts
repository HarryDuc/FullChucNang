export interface Banner {
  _id: string;
  imagePath: string;
  type: 'main' | 'sub' | 'mobile';
  isActive: boolean;
  order: number;
  link?: string;
  title?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerResponse {
  data: Banner[];
  total: number;
  page: number;
  totalPages: number;
}