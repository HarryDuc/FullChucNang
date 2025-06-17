import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";
import { FlashSaleList } from "@/modules/admin/flash-sale/components/FlashSaleList";

export default function FlashSalePage() {
  return (
    <LayoutAdmin>
      <FlashSaleList />
    </LayoutAdmin>
  )
}