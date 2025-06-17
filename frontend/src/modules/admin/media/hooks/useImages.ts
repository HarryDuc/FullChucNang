import { useMutation, useQuery, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { imagesService, ImageResponse } from '@/modules/admin/media/services/images.service';
import { toast } from 'react-hot-toast';

export const useImages = () => {
  const queryClient = useQueryClient();

  // Query để lấy tất cả ảnh
  const {
    data: images = [],
    isLoading: isLoadingImages,
    error: imagesError,
  } = useQuery<ImageResponse[]>({
    queryKey: ['images'],
    queryFn: async () => {
      try {
        console.log('Fetching images...');
        const result = await imagesService.getAllImages();
        console.log('Fetched images:', result);
        return result;
      } catch (error) {
        console.error('Error fetching images:', error);
        throw error;
      }
    },
  });

  // Mutation để upload một ảnh
  const {
    mutate: uploadImage,
    isPending: isUploading,
  }: UseMutationResult<ImageResponse, Error, File> = useMutation({
    mutationFn: imagesService.uploadImage,
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
  }: UseMutationResult<ImageResponse[], Error, File[]> = useMutation({
    mutationFn: imagesService.uploadMultipleImages,
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
  }: UseMutationResult<ImageResponse, Error, File> = useMutation({
    mutationFn: imagesService.uploadEditorImage,
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