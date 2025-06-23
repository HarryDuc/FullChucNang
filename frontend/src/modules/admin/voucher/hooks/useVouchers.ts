import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Voucher,
  CreateVoucherDto,
  UpdateVoucherDto,
  VoucherResponse
} from '../models/voucher.model';
import { VoucherService } from '../services/voucher.service';
import { toast } from 'react-hot-toast';

const voucherKeys = {
  all: ['vouchers'] as const,
  lists: () => [...voucherKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...voucherKeys.lists(), { page, limit }] as const,
  details: () => [...voucherKeys.all, 'detail'] as const,
  detail: (id: string) => [...voucherKeys.details(), id] as const,
};

export const useVouchers = (page: number, limit: number) => {
  return useQuery<VoucherResponse, Error>({
    queryKey: voucherKeys.list(page, limit),
    queryFn: () => VoucherService.getVouchers(page, limit),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useVoucherDetails = (id: string) => {
  return useQuery<Voucher, Error>({
    queryKey: voucherKeys.detail(id),
    queryFn: () => VoucherService.getVoucherById(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useVoucherByCode = (code: string) => {
  return useQuery<Voucher, Error>({
    queryKey: ['voucher', code],
    queryFn: () => VoucherService.getVoucherByCode(code),
    enabled: !!code,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useVoucherMutation = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation<Voucher, Error, CreateVoucherDto>({
    mutationFn: (data: CreateVoucherDto) => VoucherService.createVoucher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
      toast.success('Voucher created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create voucher');
    },
  });

  const updateMutation = useMutation<Voucher, Error, { id: string; data: UpdateVoucherDto }>({
    mutationFn: ({ id, data }) => VoucherService.updateVoucher(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(variables.id) });
      toast.success('Voucher updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update voucher');
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => VoucherService.deleteVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
      toast.success('Voucher deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete voucher');
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};