'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CategoryFilter, getCategoryFilters } from '../services/filter.service';

// Cache để lưu filters theo categoryId
const filtersCache: Record<string, CategoryFilter[]> = {};

export const useCategoryFilters = (categoryId?: string | null) => {
  const [filters, setFilters] = useState<CategoryFilter[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load filters từ URL khi component mount
  useEffect(() => {
    const loadFiltersFromUrl = () => {
      const newFilters: Record<string, any> = {};
      searchParams.forEach((value, key) => {
        try {
          // Decode URI component first
          const decodedValue = decodeURIComponent(value);
          
          // Skip empty arrays
          if (decodedValue === '[]') {
            return;
          }
          
          // Handle array format ["value"]
          if (decodedValue.startsWith('[') && decodedValue.endsWith(']')) {
            try {
              const parsedArray = JSON.parse(decodedValue);
              if (Array.isArray(parsedArray)) {
                // Only add non-empty arrays
                if (parsedArray.length > 0) {
                  newFilters[key] = parsedArray;
                }
              } else {
                newFilters[key] = [decodedValue];
              }
            } catch {
              // If JSON parse fails, treat as single value
              newFilters[key] = [decodedValue.slice(1, -1).replace(/"/g, '')];
            }
          } else {
            // Try parsing as JSON first
            try {
              newFilters[key] = JSON.parse(decodedValue);
            } catch {
              // If not JSON, use as is
              newFilters[key] = decodedValue;
            }
          }
        } catch (error) {
          console.error('Error parsing filter value:', error);
          newFilters[key] = value; // Fallback to original value
        }
      });
      console.log('Parsed filters:', newFilters); // Debug log
      setSelectedFilters(newFilters);
    };

    loadFiltersFromUrl();
  }, [searchParams]);

  // Fetch filters từ API
  useEffect(() => {
    const fetchFilters = async () => {
      if (!categoryId) {
        setFilters([]);
        return;
      }

      // Kiểm tra cache
      if (filtersCache[categoryId]) {
        setFilters(filtersCache[categoryId]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getCategoryFilters(categoryId);
        filtersCache[categoryId] = data;
        setFilters(data);
      } catch (err) {
        console.error('Error fetching filters:', err);
        setError('Không thể tải bộ lọc');
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, [categoryId]);

  // Cập nhật URL khi filter thay đổi
  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setSelectedFilters(newFilters);

    // Cập nhật URL
    const params = new URLSearchParams(searchParams.toString());
    
    // Xóa các param cũ
    Array.from(params.keys()).forEach(key => {
      if (key !== 'page' && key !== 'limit') {
        params.delete(key);
      }
    });

    // Thêm các filter mới
    Object.entries(newFilters).forEach(([key, value]) => {
      // Kiểm tra nếu giá trị không phải là undefined, null, chuỗi rỗng hoặc mảng rỗng
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          // Chỉ thêm mảng vào URL nếu mảng không rỗng
          if (value.length > 0) {
            params.set(key, JSON.stringify(value));
          }
        } else {
          params.set(key, typeof value === 'object' ? JSON.stringify(value) : value.toString());
        }
      }
    });

    // Cập nhật URL không reload trang
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    router.push(newUrl, { scroll: false });
  }, [router, searchParams]);

  return {
    filters,
    selectedFilters,
    updateFilters,
    loading,
    error
  };
}; 