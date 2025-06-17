import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminBannerService, CreateBannerDto, UpdateBannerDto } from '../services/banner.service';
import { Banner } from '@/modules/client/home/models/banner.model';
import { toast } from 'react-hot-toast';

export const useAdminBanner = () => {
  const queryClient = useQueryClient();

  // Query hooks
  const useGetBanners = (type?: string, isActive?: boolean) => {
    return useQuery<Banner[], Error>({
      queryKey: ['admin-banners', type, isActive],
      queryFn: () => AdminBannerService.getBanners(type, isActive),
    });
  };

  const useGetBannerById = (id: string) => {
    return useQuery<Banner, Error>({
      queryKey: ['admin-banner', id],
      queryFn: () => AdminBannerService.getBannerById(id),
      enabled: !!id,
    });
  };

  // Mutation hooks
  const useCreateBanner = () => {
    return useMutation({
      mutationFn: (data: CreateBannerDto) => AdminBannerService.createBanner(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
        toast.success('Tạo banner thành công');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Tạo banner thất bại');
      },
    });
  };

  const useUpdateBanner = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateBannerDto }) =>
        AdminBannerService.updateBanner(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
        toast.success('Cập nhật banner thành công');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Cập nhật banner thất bại');
      },
    });
  };

  const useUpdateBannerOrder = () => {
    return useMutation({
      mutationFn: ({ id, order }: { id: string; order: number }) =>
        AdminBannerService.updateBannerOrder(id, order),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
        toast.success('Cập nhật thứ tự banner thành công');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Cập nhật thứ tự banner thất bại');
      },
    });
  };

  const useToggleBannerActive = () => {
    return useMutation({
      mutationFn: (id: string) => AdminBannerService.toggleBannerActive(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
        toast.success('Cập nhật trạng thái banner thành công');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Cập nhật trạng thái banner thất bại');
      },
    });
  };

  const useDeleteBanner = () => {
    return useMutation({
      mutationFn: (id: string) => AdminBannerService.deleteBanner(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
        toast.success('Xóa banner thành công');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Xóa banner thất bại');
      },
    });
  };

  return {
    useGetBanners,
    useGetBannerById,
    useCreateBanner,
    useUpdateBanner,
    useUpdateBannerOrder,
    useToggleBannerActive,
    useDeleteBanner,
  };
};