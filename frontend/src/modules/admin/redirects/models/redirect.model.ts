export interface Redirect {
  _id: string;
  oldPath: string;
  newPath: string;
  type: 'product' | 'post' | 'category' | 'page' | 'other';
  isActive: boolean;
  statusCode: number;
  hitCount: number;
  lastAccessed?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RedirectPagination {
  data: Redirect[];
  total: number;
  page: number;
  totalPages: number;
} 