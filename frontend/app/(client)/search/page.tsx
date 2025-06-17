import { Suspense } from "react";
import SearchPage from "@/modules/client/pages/SearchPage";
import CategoryProductLayout from "@/modules/client/common/layouts/CategoryProductLayout";

export default function ServicesPage() {
    return (
        <CategoryProductLayout>
            <Suspense fallback={<p className="p-4">Đang tải tìm kiếm...</p>}>
                <SearchPage />
            </Suspense>
        </CategoryProductLayout>
    );
}
