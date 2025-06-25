import { config } from "@/config/config";
import { API_URL_CLIENT } from "@/config/apiRoutes";
const API_URL = API_URL_CLIENT + config.ROUTES.CHECKOUTS.BASE;

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
  paymentMethod: "cash" | "payos" | "bank" | "paypal" | "metamask";
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethodInfo?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function để lấy token xác thực
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// 🛒 Tạo thanh toán mới
export async function createCheckout(data: Partial<Checkout>) {
  console.log("Creating checkout with auth headers:", getAuthHeaders());
  console.log("Checkout data being sent:", data);

  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error creating checkout - Status: ${response.status}, Message:`, errorText);
      throw new Error(`Không thể tạo thanh toán. Status: ${response.status}, Message: ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Exception during checkout creation:", error);
    throw error;
  }
}

// 📋 Lấy danh sách thanh toán
export async function getAllCheckouts() {
  const response = await fetch(`${API_URL}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Không thể lấy danh sách thanh toán.");
  return response.json();
}

// 🔍 Lấy chi tiết thanh toán theo slug
export async function getCheckoutBySlug(slug: string) {
  const response = await fetch(`${API_URL}/${slug}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Không tìm thấy thanh toán.");
  return response.json();
}

// 🔄 Cập nhật thanh toán
export async function updateCheckout(slug: string, data: Partial<Checkout>) {
  const response = await fetch(`${API_URL}/${slug}`, {
    method: "PUT",
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
    body: JSON.stringify({ paymentStatus }),
  });

  if (!response.ok)
    throw new Error("Không thể cập nhật trạng thái thanh toán.");
  return response.json();
}

// ❌ Xóa thanh toán
export async function deleteCheckout(slug: string) {
  const response = await fetch(`${API_URL}/${slug}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Không thể xóa thanh toán.");
  return response.json();
}
