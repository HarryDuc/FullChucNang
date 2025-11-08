import api from '@/config/api';

export interface Upimg {
  _id: string;
  title: string;
  description: string;
  images: Array<{
    _id: string;
    originalName: string;
    imageUrl: string;
    location: string;
    slug: string;
    alt: string;
    caption: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  }>;
  status: string;
  order: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

class ThuvienService {
  async getActiveUpimgs(page = 1, limit = 12) {
    try {
      console.log('🔍 Fetching active upimgs with params:', {
        page,
        limit,
        status: 'active',
        sort: 'order',
        order: 'asc'
      });
      
      console.log('🌐 Making API call to:', `${api.defaults.baseURL}/upimgapi`);
      
      const response = await api.get('/upimgapi', {
        params: {
          page,
          limit,
          status: 'active',
          sort: 'order',
          order: 'asc'
        }
      });
      
      console.log('📦 Response received:', response.data);
      console.log('📊 Response type:', typeof response.data);
      console.log('📊 Response is array:', Array.isArray(response.data));
      console.log('📊 Response length:', response.data?.length);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log('🖼️ First item images:', response.data[0].images);
        console.log('🖼️ First item imageUrl:', response.data[0].images?.[0]?.imageUrl);
      }
      
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error fetching active upimgs:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('❌ Error details:', {
          message: (error as { message: string }).message,
          status: (error as unknown as { response?: { status: number } })?.response?.status,
          data: (error as unknown as { response?: { data: unknown } })?.response?.data,
          config: (error as unknown as { config: unknown })?.config
        });
      }
      throw error;
    }
  }

  async searchUpimgs(searchQuery: string, page = 1, limit = 12) {
    try {
      console.log('🔍 Searching upimgs with query:', searchQuery);
      
      const response = await api.get('/upimgapi/search', {
        params: {
          keyword: searchQuery,
          page,
          limit,
          status: 'active',
          sort: 'order',
          order: 'asc'
        }
      });
      
      console.log('📦 Search response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error searching upimgs:', error);
      throw error;
    }
  }
}

export const thuvienService = new ThuvienService(); 