import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";
import { MediaGallery } from "@/modules/admin/media/components/MediaGallery";

export default function MediaPage() {
  return (
    <LayoutAdmin>
      <MediaGallery />
    </LayoutAdmin>
  );
}