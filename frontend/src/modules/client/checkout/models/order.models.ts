export interface Product {
  _id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  product: string | Product; // Có thể là string (_id) hoặc object Product
  quantity: number;
  price: number;
  variant?: string; // Thêm biến thể sản phẩm
}

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export interface Order {
  _id?: string;
  slug?: string;
  orderItems: OrderItem[];
  totalPrice: number;
  discountAmount?: number;
  voucherId?: string;
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
}
