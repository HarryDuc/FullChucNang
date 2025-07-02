import AdminGuard from "@/modules/admin/common/components/AdminGuard";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";

export const metadata = {
  title: "Yaviet Admin",
  description: "Yaviet Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <LayoutAdmin>{children}</LayoutAdmin>
    </AdminGuard>
  );
}
