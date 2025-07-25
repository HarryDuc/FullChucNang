'use client';

import { useEffect, useState, useCallback } from 'react';
import { Filter } from '../types/filter.types';
import { getFilters } from '../services/filter.service';

export const useFilters = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFilters();
      setFilters(data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { filters, loading, refetch: fetchData };
}; 