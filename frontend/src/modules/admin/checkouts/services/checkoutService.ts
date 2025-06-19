const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/checkoutapi`;

export interface Checkout {
  _id: string;
  slug: string;
  userId: string;
  orderId: string;
  amount: number;
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: string;
  updatedAt: string;
  name: string;
  phone: string;
  paymentMethod: "cash" | "payos" | "bank" | "paypal";
  address: string;
  email: string;
  orderCode: string;
  paymentMethodInfo?: Record<string, any>;
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
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    console.log("Fetching all checkouts with headers:", headers);
    const response = await fetch(`${API_URL}`, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching checkouts - Status: ${response.status}, Message:`, errorText);
      throw new Error(`Không thể lấy danh sách thanh toán. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched checkouts data:", data);
    return data;
  } catch (error) {
    console.error("Exception during checkout fetch:", error);
    throw error;
  }
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
