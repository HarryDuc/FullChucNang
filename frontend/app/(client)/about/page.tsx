"use client";

import Head from "next/head";
import About from "@/modules/client/pages/About"; // Đường dẫn đúng theo module
import ClientLayout from "@/modules/client/common/layouts/ClientLayout";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>Về Chúng Tôi | DECOR AND MORE</title>
        <meta
          name="description"
          content="Tìm hiểu về DECOR AND MORE, công ty chuyên cung cấp các sản phẩm trang trí nội thất chất lượng. Khám phá sứ mệnh và giá trị của chúng tôi."
        />
        <meta
          name="keywords"
          content="về chúng tôi, decor and more, trang trí nội thất, công ty trang trí nội thất, sản phẩm trang trí"
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DECOR AND MORE" />
        <meta property="og:title" content="Về Chúng Tôi | DECOR AND MORE" />
        <meta
          property="og:description"
          content="Tìm hiểu về DECOR AND MORE, công ty chuyên cung cấp các sản phẩm trang trí nội thất chất lượng. Khám phá sứ mệnh và giá trị của chúng tôi."
        />
        <meta property="og:url" content="https://decorandmore.vn/about" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://decorandmore.vn/image/Logo_Decor-More.png"
        />
      </Head>

      <ClientLayout>
        <About />
      </ClientLayout>
    </>
  );
}
