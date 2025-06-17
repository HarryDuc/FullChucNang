"use client";
import DetailOrders from "@/modules/admin/orders/components/DetailOrders";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";
import { useParams } from "next/navigation";

export default function CategoriesProductPage() {
  const { slug } = useParams(); // Sử dụng useParams thay vì router.query
  return (
    <LayoutAdmin>
      <div>
        {/* Truyền slug vào component EditProduct */}
        {slug ? <DetailOrders slug={slug} /> : <p>Loading...</p>}
      </div>
    </LayoutAdmin>
  );
}
