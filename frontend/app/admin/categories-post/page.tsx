import ListCategoriesPost from "@/modules/admin/categories-post/components/CategoriesPostList"
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";

export default function CategoriesProductPage() {
  return (
    <LayoutAdmin>
      <ListCategoriesPost />
    </LayoutAdmin>
  );
}
