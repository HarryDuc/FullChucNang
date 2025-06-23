"use client";

import React from "react";
import RedirectForm from "@/modules/admin/redirects/components/RedirectForm";
import { useRouter } from "next/navigation";

const CreateRedirectPage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/admin/redirects");
  };

  return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push("/admin/redirects")}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors mr-4"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Quay lại
          </button>
          <h1 className="text-2xl font-bold mb-0">Tạo Redirect mới</h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <RedirectForm
            onSuccess={handleSuccess}
            onCancel={() => router.push("/admin/redirects")}
          />
        </div>
      </div>
  );
};

export default CreateRedirectPage;