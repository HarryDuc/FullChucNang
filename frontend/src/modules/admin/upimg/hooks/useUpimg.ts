import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import upimgService from '../services/upimgService';
import {
  Upimg,
  CreateUpimgRequest,
  UpdateUpimgRequest,
  ImageResponse
} from '../models';
import { useImages } from '@/common/hooks/useImages';

export const useUpimg = () => {
  const [upimgs, setUpimgs] = useState<Upimg[]>([]);
  const [selectedUpimg, setSelectedUpimg] = useState<Upimg | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { images, fetchAllImages } = useImages();

  // Fetch all upimgs
  const fetchUpimgs = useCallback(async (query?: any) => {
    try {
      setLoading(true);
      console.log('Hook: Fetching upimgs with query:', query);
      const data = await upimgService.getAll(query);
      console.log('Hook: Fetched upimgs data:', data);
      console.log('Hook: Fetched upimgs images:', data.map(upimg => ({
        _id: upimg._id,
        title: upimg.title,
        imagesCount: upimg.images?.length || 0,
        images: upimg.images
      })));
      setUpimgs(data);
      return data;
    } catch (error) {
      console.error('Hook: Error fetching upimgs:', error);
      toast.error('Failed to load upimgs');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single upimg by ID
  const fetchUpimgById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const data = await upimgService.getById(id);
      return data;
    } catch (error) {
      console.error(`Error fetching upimg ${id}:`, error);
      toast.error('Failed to load upimg details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new upimg
  const createUpimg = useCallback(async (data: CreateUpimgRequest) => {
    try {
      setLoading(true);
      const newUpimg = await upimgService.create(data);
      setUpimgs(prev => [...prev, newUpimg]);
      toast.success('Upimg created successfully');
      return newUpimg;
    } catch (error) {
      console.error('Error creating upimg:', error);
      toast.error('Failed to create upimg');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create upimg with upload
  const createUpimgWithUpload = useCallback(async (data: CreateUpimgRequest, files: File[]) => {
    try {
      setLoading(true);
      console.log('Hook: Creating upimg with upload...');
      const newUpimg = await upimgService.createWithUpload(data, files);
      console.log('Hook: Created upimg:', newUpimg);
      console.log('Hook: Created upimg images:', newUpimg.images);
      setUpimgs(prev => [...prev, newUpimg]);
      toast.success('Upimg created with images successfully');
      return newUpimg;
    } catch (error) {
      console.error('Hook: Error creating upimg with upload:', error);
      toast.error('Failed to create upimg with images');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update upimg
  const updateUpimg = useCallback(async (id: string, data: UpdateUpimgRequest) => {
    try {
      setLoading(true);
      const updatedUpimg = await upimgService.update(id, data);
      setUpimgs(prev => prev.map(upimg => upimg._id === id ? updatedUpimg : upimg));

      if (selectedUpimg?._id === id) {
        setSelectedUpimg(updatedUpimg);
      }

      toast.success('Upimg updated successfully');
      return updatedUpimg;
    } catch (error) {
      console.error(`Error updating upimg ${id}:`, error);
      toast.error('Failed to update upimg');
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedUpimg]);

  // Update upimg with upload
  const updateUpimgWithUpload = useCallback(async (id: string, data: UpdateUpimgRequest, files: File[]) => {
    try {
      setLoading(true);
      const updatedUpimg = await upimgService.updateWithUpload(id, data, files);
      setUpimgs(prev => prev.map(upimg => upimg._id === id ? updatedUpimg : upimg));

      if (selectedUpimg?._id === id) {
        setSelectedUpimg(updatedUpimg);
      }

      toast.success('Upimg updated with images successfully');
      return updatedUpimg;
    } catch (error) {
      console.error(`Error updating upimg ${id} with upload:`, error);
      toast.error('Failed to update upimg with images');
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedUpimg]);

  // Delete upimg
  const deleteUpimg = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await upimgService.delete(id);
      setUpimgs(prev => prev.filter(upimg => upimg._id !== id));

      if (selectedUpimg?._id === id) {
        setSelectedUpimg(null);
      }

      toast.success('Upimg deleted successfully');
      return true;
    } catch (error) {
      console.error(`Error deleting upimg ${id}:`, error);
      toast.error('Failed to delete upimg');
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedUpimg]);

  // Add images to upimg
  const addImagesToUpimg = useCallback(async (upimgId: string, imageIds: string[]) => {
    try {
      setLoading(true);
      const updatedUpimg = await upimgService.uploadImages(upimgId, imageIds);
      setUpimgs(prev => prev.map(upimg => upimg._id === upimgId ? updatedUpimg : upimg));

      if (selectedUpimg?._id === upimgId) {
        setSelectedUpimg(updatedUpimg);
      }

      toast.success('Images added successfully');
      return updatedUpimg;
    } catch (error) {
      console.error('Error adding images to upimg:', error);
      toast.error('Failed to add images');
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedUpimg]);

  // Remove image from upimg
  const removeImageFromUpimg = useCallback(async (upimgId: string, imageId: string) => {
    try {
      setLoading(true);
      const updatedUpimg = await upimgService.removeImage(upimgId, imageId);
      setUpimgs(prev => prev.map(upimg => upimg._id === upimgId ? updatedUpimg : upimg));

      if (selectedUpimg?._id === upimgId) {
        setSelectedUpimg(updatedUpimg);
      }

      toast.success('Image removed from upimg successfully');
      return updatedUpimg;
    } catch (error) {
      console.error(`Error removing image from upimg ${upimgId}:`, error);
      toast.error('Failed to remove image from upimg');
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedUpimg]);

  // Update order
  const updateUpimgOrder = useCallback(async (id: string, order: number) => {
    try {
      setLoading(true);
      const updatedUpimg = await upimgService.updateOrder(id, order);
      setUpimgs(prev => prev.map(upimg => upimg._id === id ? updatedUpimg : upimg));

      if (selectedUpimg?._id === id) {
        setSelectedUpimg(updatedUpimg);
      }

      toast.success('Upimg order updated successfully');
      return updatedUpimg;
    } catch (error) {
      console.error(`Error updating upimg order ${id}:`, error);
      toast.error('Failed to update upimg order');
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedUpimg]);

  // Search upimgs
  const searchUpimgs = useCallback(async (keyword: string) => {
    try {
      setLoading(true);
      const data = await upimgService.search(keyword);
      setUpimgs(data);
      return data;
    } catch (error) {
      console.error('Error searching upimgs:', error);
      toast.error('Failed to search upimgs');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get upimgs by status
  const getUpimgsByStatus = useCallback(async (status: string) => {
    try {
      setLoading(true);
      const data = await upimgService.getByStatus(status);
      setUpimgs(data);
      return data;
    } catch (error) {
      console.error('Error fetching upimgs by status:', error);
      toast.error('Failed to load upimgs by status');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    upimgs,
    setUpimgs,
    selectedUpimg,
    setSelectedUpimg,
    loading,
    images,
    fetchAllImages,
    fetchUpimgs,
    fetchUpimgById,
    createUpimg,
    createUpimgWithUpload,
    updateUpimg,
    updateUpimgWithUpload,
    deleteUpimg,
    addImagesToUpimg,
    removeImageFromUpimg,
    updateUpimgOrder,
    searchUpimgs,
    getUpimgsByStatus,
  };
};