import { useState, useEffect, useCallback } from 'react';
import { thuvienService, Upimg } from '../services/thuvienService';

export const useThuvien = () => {
  const [upimgs, setUpimgs] = useState<Upimg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUpimgs = useCallback(async (pageNum = 1, isSearch = false) => {
    try {
      setLoading(true);
      setError(null);
      
      let response: Upimg[];
      
      if (isSearch && searchQuery.trim()) {
        console.log('🔍 Searching upimgs with query:', searchQuery);
        response = await thuvienService.searchUpimgs(searchQuery, pageNum);
      } else {
        console.log('📋 Getting active upimgs');
        response = await thuvienService.getActiveUpimgs(pageNum);
      }
      
      console.log('📦 Response received:', response);
      console.log('📊 Response length:', response?.length);
      
      if (response && Array.isArray(response)) {
        if (pageNum === 1) {
          setUpimgs(response);
        } else {
          setUpimgs(prev => [...prev, ...response]);
        }
        
        // Check if we have more data
        setHasMore(response.length === 12); // Assuming limit is 12
        setCurrentPage(pageNum);
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        setUpimgs([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error('❌ Error fetching upimgs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch upimgs');
      setUpimgs([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const searchUpimgs = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setHasMore(true);
    fetchUpimgs(1, true);
  }, [fetchUpimgs]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      fetchUpimgs(nextPage, searchQuery.trim().length > 0);
    }
  }, [loading, hasMore, currentPage, fetchUpimgs, searchQuery]);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    fetchUpimgs(1, searchQuery.trim().length > 0);
  }, [fetchUpimgs, searchQuery]);

  // Initial load
  useEffect(() => {
    fetchUpimgs(1);
  }, [fetchUpimgs]);

  return {
    upimgs,
    loading,
    error,
    hasMore,
    currentPage,
    searchQuery,
    fetchUpimgs,
    searchUpimgs,
    loadMore,
    refresh,
    setSearchQuery
  };
}; 