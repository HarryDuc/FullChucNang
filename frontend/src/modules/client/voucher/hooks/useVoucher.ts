"use client";

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  VoucherClientService,
  ApplyVoucherParams,
  CheckVoucherValidityParams,
} from '../services/voucher.service';
import { Voucher } from '../models/voucher.model';

export const useValidVouchers = (
  productSlug?: string,
  userId?: string,
  paymentMethod?: string
) => {
  return useQuery({
    queryKey: ['validVouchers', productSlug, userId, paymentMethod],
    queryFn: () => VoucherClientService.getValidVouchers(productSlug, userId, paymentMethod),
    enabled: !!(productSlug || userId || paymentMethod),
  });
};

export const useVoucherByCode = (code: string) => {
  return useQuery({
    queryKey: ['voucher', code],
    queryFn: () => VoucherClientService.getVoucherByCode(code),
    enabled: !!code,
  });
};

export const useApplyVoucher = () => {
  return useMutation({
    mutationFn: (params: ApplyVoucherParams) => VoucherClientService.applyVoucher(params),
    onSuccess: () => {
      toast.success('Voucher applied successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to apply voucher');
    },
  });
};

export const useCheckVoucherValidity = () => {
  return useMutation({
    mutationFn: (params: CheckVoucherValidityParams) =>
      VoucherClientService.checkVoucherValidity(params),
  });
};

export const useVoucher = (initialTotalAmount: number = 0) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [totalAmount, setTotalAmount] = useState(initialTotalAmount);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(initialTotalAmount);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<string | undefined>(undefined);

  const checkVoucherMutation = useCheckVoucherValidity();
  const applyVoucherMutation = useApplyVoucher();

  const checkVoucher = async (
    code: string,
    productSlug?: string,
    userId?: string,
    paymentMethod?: string
  ) => {
    if (!code) {
      toast.error('Please enter a voucher code');
      return false;
    }

    console.log('Checking voucher with payment method:', paymentMethod);

    // Store the current payment method
    setCurrentPaymentMethod(paymentMethod);

    const result = await checkVoucherMutation.mutateAsync({
      code,
      productSlug,
      userId,
      paymentMethod,
      totalAmount,
    });

    if (result.valid && result.voucher) {
      setVoucherCode(code);
      setAppliedVoucher(result.voucher);
      setDiscountAmount(result.discountAmount || 0);
      setFinalPrice(result.finalPrice || totalAmount);

      // Store the voucher and discount in localStorage to persist across checkout steps
      localStorage.setItem('appliedVoucherCode', code);
      localStorage.setItem('appliedVoucherId', result.voucher._id);
      localStorage.setItem('appliedVoucherDiscount', (result.discountAmount || 0).toString());
      localStorage.setItem('appliedVoucherPaymentMethod', paymentMethod || '');

      return true;
    } else {
      toast.error(result.message || 'Invalid voucher');
      return false;
    }
  };

  const applyVoucher = async (code: string, productSlug?: string) => {
    if (!code) {
      toast.error('Please enter a voucher code');
      return false;
    }

    try {
      const result = await applyVoucherMutation.mutateAsync({
        code,
        productSlug,
      });

      setVoucherCode(code);
      setAppliedVoucher(result.voucher);
      setDiscountAmount(result.discountAmount);
      setFinalPrice(result.finalPrice);

      // Store the voucher and discount in localStorage
      localStorage.setItem('appliedVoucherCode', code);
      localStorage.setItem('appliedVoucherId', result.voucher._id);
      localStorage.setItem('appliedVoucherDiscount', result.discountAmount.toString());

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const removeVoucher = () => {
    setVoucherCode('');
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setFinalPrice(totalAmount);

    // Clear stored voucher data
    localStorage.removeItem('appliedVoucherCode');
    localStorage.removeItem('appliedVoucherId');
    localStorage.removeItem('appliedVoucherDiscount');
    localStorage.removeItem('appliedVoucherPaymentMethod');
  };

  const updateTotalAmount = (newTotal: number) => {
    setTotalAmount(newTotal);
    setFinalPrice(newTotal);

    if (appliedVoucher) {
      const { discountAmount: newDiscount, finalPrice: newFinal } =
        VoucherClientService.calculateDiscount(appliedVoucher, newTotal);

      setDiscountAmount(newDiscount);
      setFinalPrice(newFinal);

      // Update stored discount amount
      localStorage.setItem('appliedVoucherDiscount', newDiscount.toString());
    }
  };

  // Check for stored voucher on mount
  useEffect(() => {
    const storedVoucherCode = localStorage.getItem('appliedVoucherCode');
    const storedVoucherId = localStorage.getItem('appliedVoucherId');
    const storedDiscount = localStorage.getItem('appliedVoucherDiscount');
    const storedPaymentMethod = localStorage.getItem('appliedVoucherPaymentMethod');

    if (storedVoucherCode && storedVoucherId && storedDiscount) {
      // If we have a stored voucher, attempt to reapply it
      const discount = parseFloat(storedDiscount);
      if (!isNaN(discount) && storedVoucherCode) {
        console.log("Restoring saved voucher:", storedVoucherCode);
        console.log("Stored discount amount:", discount);

        // First try to fetch the voucher details
        VoucherClientService.getVoucherByCode(storedVoucherCode)
          .then(voucher => {
            setVoucherCode(storedVoucherCode);
            setAppliedVoucher(voucher);
            setDiscountAmount(discount);
            setFinalPrice(totalAmount - discount);
            setCurrentPaymentMethod(storedPaymentMethod || undefined);

            console.log("Successfully restored voucher:", voucher);
            console.log("Set discount amount to:", discount);
            console.log("Final price after restoration:", totalAmount - discount);
          })
          .catch(err => {
            console.error('Failed to restore voucher:', err);
            // Clear invalid stored voucher
            removeVoucher();
          });
      }
    }
  }, []);

  return {
    voucherCode,
    appliedVoucher,
    totalAmount,
    discountAmount,
    finalPrice,
    currentPaymentMethod,
    isCheckingVoucher: checkVoucherMutation.isPending,
    isApplyingVoucher: applyVoucherMutation.isPending,
    checkVoucher,
    applyVoucher,
    removeVoucher,
    updateTotalAmount,
  };
};