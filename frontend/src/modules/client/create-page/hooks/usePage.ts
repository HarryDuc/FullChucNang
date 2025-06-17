import { useState, useEffect } from "react";
import { PageService, IPage, ICreatePageDto } from '../services/page.service';
import { toast } from 'react-hot-toast';

interface UsePageReturn {
  page: IPage | null;
  loading: boolean;
  error: Error | null;
}

export const usePage = (slug: string): UsePageReturn => {
  const [page, setPage] = useState<IPage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await PageService.getPageBySlug(slug);
        setPage(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch page'));
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  return { page, loading, error };
};

export const usePageWithoutSlug = () => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<IPage | null>(null);
  const [pages, setPages] = useState<IPage[]>([]);

  const getPageBySlug = async (slug: string) => {
    try {
      setLoading(true);
      const response = await PageService.getPageBySlug(slug);
      setPage(response);
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch page');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    page,
    pages,
    getPageBySlug,
  };
};