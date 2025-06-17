import Home from "@/modules/client/pages/Home"; // Đường dẫn đúng theo module
import ClientLayout from "@/modules/client/common/layouts/ClientLayout";

export default function HomePage() {
    return (
        <ClientLayout>
            <Home />
        </ClientLayout>
    );
}
