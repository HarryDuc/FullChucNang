import { useState, useCallback } from 'react';
import { DEFAULT_PRICE_RANGES } from '../types/filter.types';

export const usePriceRangeFilter = (initialValue: string = '') => {
  const [selectedRange, setSelectedRange] = useState(initialValue);

  const handleRangeChange = useCallback((value: string) => {
    setSelectedRange(value);
  }, []);

  const getPriceRangeFilter = useCallback(() => {
    if (!selectedRange) return {};

    const [min, max] = selectedRange.split('-').map(Number);
    return {
      priceRange: selectedRange,
      minPrice: min,
      maxPrice: max
    };
  }, [selectedRange]);

  const getCurrentRangeLabel = useCallback(() => {
    const range = DEFAULT_PRICE_RANGES.find(r => r.value === selectedRange);
    return range?.label || 'Tùy chỉnh';
  }, [selectedRange]);

  const resetFilter = useCallback(() => {
    setSelectedRange('');
  }, []);

  return {
    selectedRange,
    handleRangeChange,
    getPriceRangeFilter,
    getCurrentRangeLabel,
    resetFilter
  };
}; 