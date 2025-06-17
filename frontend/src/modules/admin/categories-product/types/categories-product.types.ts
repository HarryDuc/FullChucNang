export interface CategoriesProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentCategory?: string | null;
  children: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
  subCategories?: string[];
  level?: number; // Thêm level
  isActive?: boolean; // Thêm trạng thái hoạt động
  createdAt?: string;
  updatedAt?: string;
  __v?: number; // Thêm version
}
