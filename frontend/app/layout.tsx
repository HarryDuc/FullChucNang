import "../src/styles/globals.css"; // ✅ TailwindCSS entry
import { AuthProvider } from "@/context/AuthContext";
import QueryProvider from "@/modules/admin/common/providers/QueryProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";
import TokenHandler from "@/common/components/TokenHandler";
import Favicon from "../src/common/components/Favicon";
import { ScriptLayout } from "@/modules/client/common/layouts/ScriptLayout";
import { Suspense } from "react";
<script async src="http://localhost:3000/tracker.js" data-ackee-server="http://localhost:3000" data-ackee-domain-id="07967d4b-f737-4c51-8401-04ba61dfaf82"></script>
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <Favicon />
      </head>
      <body className="">
        <Suspense>
          <QueryProvider>
            <ScriptLayout>
              <AuthProvider>
                <TokenHandler />
                <ToastContainer
                  position="bottom-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
                {children}
                <Toaster />
              </AuthProvider>
            </ScriptLayout>
          </QueryProvider>
        </Suspense>
      </body>
    </html>
  );
}
