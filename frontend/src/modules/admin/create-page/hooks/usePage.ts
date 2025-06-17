import { useState } from 'react';
import { PageService, IPage, ICreatePageDto } from '../services/page.service';
import { toast } from 'react-hot-toast';

export const usePage = () => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<IPage | null>(null);
  const [pages, setPages] = useState<IPage[]>([]);

  const createPage = async (data: ICreatePageDto) => {
    try {
      setLoading(true);
      const response = await PageService.createPage(data);
      toast.success('Page created successfully');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create page');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await PageService.getAllPages();
      setPages(response);
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch pages');
      throw error;
    } finally {
      setLoading(false);
    }
  };

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

  const updatePage = async (slug: string, data: Partial<ICreatePageDto>) => {
    try {
      setLoading(true);
      const response = await PageService.updatePage(slug, data);
      toast.success('Page updated successfully');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update page');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (slug: string) => {
    try {
      setLoading(true);
      await PageService.deletePage(slug);
      toast.success('Page deleted successfully');
      setPages(pages.filter(p => p.slug !== slug));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete page');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    page,
    pages,
    createPage,
    fetchPages,
    getPageBySlug,
    updatePage,
    deletePage,
  };
};