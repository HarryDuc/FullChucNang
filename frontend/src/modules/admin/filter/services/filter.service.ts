import { Filter, CreateFilterDto, UpdateFilterDto } from '../types/filter.types';
import { config } from '@/config/config';
import api from '@/config/api';
import { API_URL_CLIENT } from '@/config/apiRoutes';
import { removeVietnameseTones } from '@/common/utils/slug.utils';

const API_URL = API_URL_CLIENT + config.ROUTES.FILTERS.BASE;

export const getFilters = async (): Promise<Filter[]> => {
  const response = await api.get<Filter[]>(`${API_URL}`);
  return response.data;
};

export const getFilterById = async (id: string): Promise<Filter> => {
  const response = await api.get<Filter>(`${API_URL}/${id}`, );
  return response.data;
};

export const createFilter = async (filterData: CreateFilterDto): Promise<Filter> => {
  // Tự động tạo slug từ tên
  const slug = removeVietnameseTones(filterData.name);
  const response = await api.post<Filter>(`${API_URL}`, { ...filterData, slug }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.data;
};

export const updateFilter = async (
  id: string,
  filterData: UpdateFilterDto,
): Promise<Filter> => {
  // Nếu có cập nhật tên, tự động cập nhật slug
  const slug = filterData.name ? removeVietnameseTones(filterData.name) : undefined;
  const response = await api.put<Filter>(`${API_URL}/${id}`, { ...filterData, slug }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.data;
};

export const deleteFilter = async (id: string): Promise<void> => {
  await api.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

export const FilterService = {
  getAll: getFilters,
  getById: getFilterById,
  create: createFilter,
  update: updateFilter,
  delete: deleteFilter,
}; 