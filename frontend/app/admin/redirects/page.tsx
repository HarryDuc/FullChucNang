"use client";

import React from "react";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";
import ListRedirects from "@/modules/admin/redirects/components/ListRedirects";

const RedirectsPage = () => {
  return (
    <LayoutAdmin>
      <div className="min-h-screen bg-gray-50">
        <ListRedirects />
      </div>
    </LayoutAdmin>
  );
};

export default RedirectsPage; 