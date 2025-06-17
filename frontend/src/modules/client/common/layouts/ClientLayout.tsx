import Footer from "@/modules/client/common/components/Footer";
import Menu from "@/modules/client/common/components/Menu";

import { ReactNode } from "react";
import ContactButtons from "../components/PhoneNumber";

interface LayoutProps {
  children: ReactNode;
}

const ClientLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5fa]">
      {/* 🏠 Header */}
      <Menu />

      {/* 📌 Nội dung chính */}
      <main className="flex-grow container py-4 px-4 mx-auto bg-[#f5f5fa]">{children}</main>

      {/* 📌 Footer */}
      <Footer />
      <ContactButtons />

    </div>
  );
};

export default ClientLayout;
