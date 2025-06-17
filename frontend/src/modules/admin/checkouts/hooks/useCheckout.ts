"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Checkout,
  getAllCheckouts,
  getCheckoutBySlug,
  createCheckout,
  updateCheckout,
  updatePaymentStatus,
  deleteCheckout,
} from "../services/checkoutService";

export function useCheckout() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📋 Lấy danh sách thanh toán
  const fetchCheckouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCheckouts();
      setCheckouts(data);
    } catch (err) {
      setError("Lỗi khi tải danh sách thanh toán.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🛒 Tạo thanh toán
  const addCheckout = async (data: Partial<Checkout>) => {
    try {
      const newCheckout = await createCheckout(data);
      setCheckouts((prev) => [...prev, newCheckout]); // Cập nhật danh sách
    } catch (err) {
      setError("Lỗi khi tạo thanh toán.");
    }
  };

  // 🔄 Cập nhật thanh toán
  const editCheckout = async (slug: string, data: Partial<Checkout>) => {
    try {
      const updatedCheckout = await updateCheckout(slug, data);
      setCheckouts((prev) =>
        prev.map((c) => (c.slug === slug ? updatedCheckout : c))
      );
    } catch (err) {
      setError("Lỗi khi cập nhật thanh toán.");
    }
  };

  // ✅ Cập nhật trạng thái thanh toán
  const changePaymentStatus = async (
    slug: string,
    status: "pending" | "paid" | "failed"
  ) => {
    try {
      const updatedCheckout = await updatePaymentStatus(slug, status);
      setCheckouts((prev) =>
        prev.map((c) => (c.slug === slug ? updatedCheckout : c))
      );
    } catch (err) {
      setError("Lỗi khi cập nhật trạng thái.");
    }
  };

  // ❌ Xóa thanh toán
  const removeCheckout = async (slug: string) => {
    try {
      await deleteCheckout(slug);
      setCheckouts((prev) => prev.filter((c) => c.slug !== slug));
    } catch (err) {
      setError("Lỗi khi xóa thanh toán.");
    }
  };

  useEffect(() => {
    fetchCheckouts();
  }, [fetchCheckouts]);

  return {
    checkouts,
    loading,
    error,
    fetchCheckouts,
    addCheckout,
    editCheckout,
    changePaymentStatus,
    removeCheckout,
  };
}
