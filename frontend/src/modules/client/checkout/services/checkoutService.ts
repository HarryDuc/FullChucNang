const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/checkoutapi`;

export interface Checkout {
  _id?: string;
  orderId: string;
  userId: string;
  email: string;
  orderCode: string;
  slug: string;
  name: string;
  phone: string;
  address: string;
  paymentMethod: "cash" | "payos" | "bank";
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethodInfo?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// 🛒 Tạo thanh toán mới
export async function createCheckout(data: Partial<Checkout>) {
  const response = await fetch(`${API_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Không thể tạo thanh toán.");
  return response.json();
}

// 📋 Lấy danh sách thanh toán
export async function getAllCheckouts() {
  const response = await fetch(`${API_URL}`);
  if (!response.ok) throw new Error("Không thể lấy danh sách thanh toán.");
  return response.json();
}

// 🔍 Lấy chi tiết thanh toán theo slug
export async function getCheckoutBySlug(slug: string) {
  const response = await fetch(`${API_URL}/${slug}`);
  if (!response.ok) throw new Error("Không tìm thấy thanh toán.");
  return response.json();
}

// 🔄 Cập nhật thanh toán
export async function updateCheckout(slug: string, data: Partial<Checkout>) {
  const response = await fetch(`${API_URL}/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Không thể cập nhật thanh toán.");
  return response.json();
}

// ✅ Cập nhật trạng thái thanh toán
export async function updatePaymentStatus(
  slug: string,
  paymentStatus: "pending" | "paid" | "failed"
) {
  const response = await fetch(`${API_URL}/${slug}/payment-status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentStatus }),
  });

  if (!response.ok)
    throw new Error("Không thể cập nhật trạng thái thanh toán.");
  return response.json();
}

// ❌ Xóa thanh toán
export async function deleteCheckout(slug: string) {
  const response = await fetch(`${API_URL}/${slug}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Không thể xóa thanh toán.");
  return response.json();
}
