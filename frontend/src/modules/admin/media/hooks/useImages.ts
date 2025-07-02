import { useMutation, useInfiniteQuery, useQueryClient, UseMutationResult, InfiniteData } from '@tanstack/react-query';
import { imagesService, ImageResponse, PaginatedImageResponse } from '@/modules/admin/media/services/images.service';
import { toast } from 'react-hot-toast';
import { useImages as useCommonImages } from '@/common/hooks/useImages';
import { ImageResponse as CommonImageResponse } from '@/common/services/imageService';

// Hàm chuyển đổi từ CommonImageResponse sang ImageResponse
const convertToAdminImageResponse = (commonResponse: CommonImageResponse): ImageResponse => {
  return {
    _id: commonResponse._id,
    originalName: commonResponse.originalName || commonResponse.filename,
    imageUrl: commonResponse.imageUrl,
    location: commonResponse.path,
    slug: commonResponse.slug,
    alt: commonResponse.alt || '',
    caption: commonResponse.caption,
    createdAt: commonResponse.createdAt,
    updatedAt: commonResponse.updatedAt
  };
};

export const useImages = () => {
  const queryClient = useQueryClient();
  const commonImageHook = useCommonImages();

  // Query để lấy ảnh với infinite scroll
  const {
    data,
    isLoading: isLoadingImages,
    error: imagesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<PaginatedImageResponse, Error, InfiniteData<PaginatedImageResponse>, string[], number>({
    queryKey: ['images'],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        console.log('Fetching images page:', pageParam);
        const result = await imagesService.getAllImages(pageParam);
        console.log('Fetched images:', result);
        return result;
      } catch (error) {
        console.error('Error fetching images:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage: PaginatedImageResponse, allPages: PaginatedImageResponse[]): number | undefined => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });

  // Tổng hợp tất cả ảnh từ các trang
  const images = data?.pages.flatMap(page => page.images) ?? [];

  // Mutation để upload một ảnh
  const {
    mutate: uploadImage,
    isPending: isUploading,
  } = useMutation<ImageResponse, Error, File>({
    mutationFn: async (file: File) => {
      const result = await commonImageHook.uploadImage(file);
      if (!result) throw new Error('Failed to upload image');
      return convertToAdminImageResponse(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      toast.success('Tải ảnh lên thành công');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi tải ảnh lên');
    },
  });

  // Mutation để upload nhiều ảnh
  const {
    mutate: uploadMultipleImages,
    isPending: isUploadingMultiple,
  } = useMutation<ImageResponse[], Error, File[]>({
    mutationFn: async (files: File[]) => {
      const results = await commonImageHook.uploadMultipleImages(files);
      if (!results.length) throw new Error('Failed to upload images');
      return results.map(convertToAdminImageResponse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      toast.success('Tải các ảnh lên thành công');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi tải các ảnh lên');
    },
  });

  // Mutation để xóa ảnh
  const {
    mutate: deleteImage,
    isPending: isDeleting,
  }: UseMutationResult<void, Error, string> = useMutation({
    mutationFn: imagesService.deleteImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      toast.success('Xóa ảnh thành công');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa ảnh');
    },
  });

  // Mutation để upload ảnh cho SunEditor
  const {
    mutate: uploadEditorImage,
    isPending: isUploadingEditor,
  } = useMutation<ImageResponse, Error, File>({
    mutationFn: async (file: File) => {
      const result = await commonImageHook.uploadEditorImage(file);
      if (!result) throw new Error('Failed to upload editor image');
      return convertToAdminImageResponse(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      toast.success('Tải ảnh lên thành công');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi tải ảnh lên');
    },
  });

  return {
    // Data
    images,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,

    // Loading states
    isLoadingImages,
    isUploading,
    isUploadingMultiple,
    isDeleting,
    isUploadingEditor,

    // Error
    imagesError,

    // Methods
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    uploadEditorImage,
  };
};