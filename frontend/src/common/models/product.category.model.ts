export interface ClientProductCategory {
  name: string;
  slug: string;
  parentCategory: string | null;
  level: number;
  isActive: boolean;
  subCategories: ClientProductCategory[];
}
