export interface Upimg {
  _id: string;
  title?: string;
  description?: string;
  images: ImageResponse[];
  status: 'active' | 'inactive';
  order: number;
  slug?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ImageResponse {
  _id: string;
  originalName: string;
  imageUrl: string;
  location: string;
  slug: string;
  alt?: string;
  caption?: string;
  size: number;
  mimetype: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUpimgRequest {
  title?: string;
  description?: string;
  imageIds?: string[];
  status?: 'active' | 'inactive';
  order?: number;
  slug?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateUpimgRequest {
  title?: string;
  description?: string;
  imageIds?: string[];
  status?: 'active' | 'inactive';
  order?: number;
  slug?: string;
  metadata?: Record<string, unknown>;
}

export interface UploadImagesRequest {
  upimgId: string;
  imageIds?: string[];
}

export interface RemoveImageRequest {
  upimgId: string;
  imageId: string;
} 