import { useQuery, useMutation, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { reviewService, ICreateReviewDto, IProductRating } from '../services/review.service';
import { IReview } from '../models/review.model';
import { toast } from 'react-toastify';

export const useProductReviews = (productSlug: string): UseQueryResult<IReview[], AxiosError> => {
  return useQuery({
    queryKey: ['productReviews', productSlug],
    queryFn: async () => {
      const response = await reviewService.getProductReviews(productSlug);
      return response.data;
    },
    enabled: !!productSlug,
  });
};

export const useProductRating = (productSlug: string): UseQueryResult<IProductRating, AxiosError> => {
  return useQuery({
    queryKey: ['productRating', productSlug],
    queryFn: async () => {
      const response = await reviewService.getProductRating(productSlug);
      return response.data;
    },
    enabled: !!productSlug,
  });
};

export const useCreateReview = () => {
  return useMutation({
    mutationFn: async (data: ICreateReviewDto) => {
      try {
        console.log('Sending review data:', data);
        const response = await reviewService.createReview(data);
        return response.data;
      } catch (error: any) {
        console.error('Review creation error:', error.response?.data || error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Review submitted successfully');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'You can only review products you have purchased, received and paid for';
        console.error('Review validation error:', error.response.data);
        toast.error(errorMessage);
      } else {
        toast.error('Failed to submit review');
      }
    },
  });
};

export const useUpdateReview = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ICreateReviewDto> }) => {
      const response = await reviewService.updateReview(id, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Review updated successfully');
    },
    onError: () => {
      toast.error('Failed to update review');
    },
  });
};

export const useDeleteReview = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      await reviewService.deleteReview(id);
    },
    onSuccess: () => {
      toast.success('Review deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete review');
    },
  });
};