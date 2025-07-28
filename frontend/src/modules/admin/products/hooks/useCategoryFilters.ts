'use client';

import { useState, useEffect } from 'react';
import { getFiltersByCategory } from '../services/filter.service';
export { getFiltersByCategory };

export interface RangeOption {
  label: string;
  min: number;
  max: number;
}

export interface CategoryFilter {
  _id: string;
  name: string;
  slug: string;
  type: 'select' | 'checkbox' | 'range' | 'text' | 'number';
  options: string[];
  rangeOptions?: RangeOption[];
}

// Cache to store filters by categoryId
const filtersCache: Record<string, CategoryFilter[]> = {};

export const useCategoryFilters = (categoryId?: string) => {
  const [filters, setFilters] = useState<CategoryFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilters = async () => {
      if (!categoryId) {
        setFilters([]);
        return;
      }

      // Check cache first
      if (filtersCache[categoryId]) {
        setFilters(filtersCache[categoryId]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getFiltersByCategory(categoryId);
        console.log('Fetched filters:', data); // Debug log
        
        // Store in cache
        filtersCache[categoryId] = data;
        setFilters(data);
      } catch (err) {
        console.error('Error fetching filters:', err); // Debug log
        setError(err instanceof Error ? err.message : 'Failed to fetch filters');
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, [categoryId]);

  return { filters, loading, error };
}; 