import { useQuery } from '@tanstack/react-query';
import { BannerService } from '../services/banner.service';
import { Banner } from '../models/banner.model';

export const useBanner = () => {
  /**
   * Hook lấy danh sách banner theo type và trạng thái
   */
  const useGetBanners = (type?: string, isActive?: boolean) => {
    return useQuery<Banner[], Error>({
      queryKey: ['banners', type, isActive],
      queryFn: () => BannerService.getBanners(type, isActive),
    });
  };

  /**
   * Hook lấy danh sách banner đang active theo type
   */
  const useGetActiveBanners = (type: string) => {
    return useQuery<Banner[], Error>({
      queryKey: ['active-banners', type],
      queryFn: () => BannerService.getActiveBannersByType(type),
    });
  };

  /**
   * Hook lấy chi tiết một banner
   */
  const useGetBannerById = (id: string) => {
    return useQuery<Banner, Error>({
      queryKey: ['banner', id],
      queryFn: () => BannerService.getBannerById(id),
      enabled: !!id,
    });
  };

  return {
    useGetBanners,
    useGetActiveBanners,
    useGetBannerById,
  };
};