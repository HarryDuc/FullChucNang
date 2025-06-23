import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { RedirectService } from '../services/redirect.service';
import { Redirect } from '../models/redirect.model';

interface Pagination {
  current: number;
  pageSize: number;
  total: number;
}

interface Filters {
  path?: string;
  type?: string;
  statusCode?: string;
  isActive?: string;
}

export const useRedirectData = () => {
  const [allRedirects, setAllRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<Filters>({});

  // Fetch tất cả dữ liệu
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await RedirectService.getAll(1, 1000); // Lấy nhiều dữ liệu hơn
      setAllRedirects(response.data);
    } catch (error) {
      console.error('Error fetching redirects:', error);
      toast.error('Không thể tải danh sách redirects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Lọc dữ liệu ở frontend
  const filteredRedirects = useMemo(() => {
    let result = [...allRedirects];

    // Lọc theo path
    if (filters.path) {
      const searchTerm = filters.path.toLowerCase();
      result = result.filter(
        redirect =>
          redirect.oldPath.toLowerCase().includes(searchTerm) ||
          redirect.newPath.toLowerCase().includes(searchTerm)
      );
    }

    // Lọc theo type
    if (filters.type) {
      result = result.filter(redirect => redirect.type === filters.type);
    }

    // Lọc theo statusCode
    if (filters.statusCode) {
      result = result.filter(
        redirect => redirect.statusCode === parseInt(filters.statusCode!, 10)
      );
    }

    // Lọc theo isActive
    if (filters.isActive) {
      const isActiveValue = filters.isActive === 'true';
      result = result.filter(redirect => redirect.isActive === isActiveValue);
    }

    return result;
  }, [allRedirects, filters]);

  // Phân trang ở frontend
  const paginatedRedirects = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredRedirects.slice(start, end);
  }, [filteredRedirects, pagination.current, pagination.pageSize]);

  const handleTableChange = (newPagination: { current: number; pageSize: number }) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: filteredRedirects.length
    }));
  };

  const handleFilter = (newFilters: Filters) => {
    setFilters(newFilters);
    setPagination(prev => ({ 
      ...prev, 
      current: 1,
      total: filteredRedirects.length
    }));
  };

  const handleDeleteRedirect = async (id: string) => {
    try {
      await RedirectService.remove(id);
      await fetchAllData(); // Refresh data after deletion
      toast.success('Xóa redirect thành công');
      return true;
    } catch (error) {
      console.error('Error deleting redirect:', error);
      toast.error('Không thể xóa redirect');
      return false;
    }
  };

  const checkRedirect = async (path: string) => {
    try {
      return await RedirectService.checkRedirect(path);
    } catch (error) {
      console.error('Error checking redirect:', error);
      toast.error('Không thể kiểm tra redirect');
      return null;
    }
  };

  const refresh = () => {
    fetchAllData();
  };

  return {
    redirects: paginatedRedirects,
    loading,
    pagination: {
      ...pagination,
      total: filteredRedirects.length
    },
    handleTableChange,
    handleFilter,
    handleDeleteRedirect,
    checkRedirect,
    refresh
  };
}; 