"use client";

import Head from "next/head";
import About from "@/modules/client/pages/About"; // Đường dẫn đúng theo module
import ClientLayout from "@/modules/client/common/layouts/ClientLayout";

export default function AboutPage() {
  return (
    <About />
  );
}
