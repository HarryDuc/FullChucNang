import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";
import VoucherList from "@/modules/admin/voucher/components/VoucherList";

export default function VoucherPage() {
  return (
    <LayoutAdmin>
      <VoucherList />
    </LayoutAdmin>
  );
}