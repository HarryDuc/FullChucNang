"use client";

import Head from "next/head";

const PurchasePolicySection = () => {
  return (
    <>
      <Head>
        <title>Chính Sách Mua Hàng | Décor & More</title>
        <meta
          name="description"
          content="Chính sách mua hàng tại Décor & More: điều kiện sử dụng, bảo mật, trách nhiệm tài khoản, và thông tin liên hệ đầy đủ. Tìm hiểu ngay để mua sắm an toàn."
        />
        <meta
          property="og:title"
          content="Chính Sách Mua Hàng | Décor & More"
        />
        <meta
          property="og:description"
          content="Tìm hiểu các chính sách mua hàng từ Décor & More, bao gồm điều kiện sử dụng, bảo vệ tài khoản, danh mục sản phẩm chính và chính sách liên quan."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://decorandmore.vn/chinh-sach-mua-hang"
        />
        <meta
          property="og:image"
          content="https://decorandmore.vn/og-default.jpg"
        />
        <meta name="robots" content="index, follow" />
        <link
          rel="canonical"
          href="https://decorandmore.vn/chinh-sach-mua-hang"
        />
      </Head>

      <main className=" mx-auto">
        <div className=" mx-auto px-4 md:px-6 py-8">
          <h1 className="text-2xl font-semibold mb-6 text-center">
            CHÍNH SÁCH MUA HÀNG
          </h1>

          <article
            className="bg-white border p-6 mb-8"
            itemScope
            itemType="https://schema.org/Article"
          >
            <meta itemProp="name" content="Chính Sách Mua Hàng" />
            <meta itemProp="author" content="Décor & More" />
            <meta itemProp="datePublished" content="2025-04-12" />
            <meta itemProp="publisher" content="CÔNG TY TNHH DÉCOR & MORE" />

            <p className="mb-4">
              Khi vào web của chúng tôi, khách hàng phải đảm bảo đủ 18 tuổi,
              hoặc truy cập dưới sự giám sát của cha mẹ hay người giám hộ hợp
              pháp. Khách hàng đảm bảo có đầy đủ hành vi dân sự để thực hiện các
              giao dịch mua bán hàng hóa theo quy định hiện hành của pháp luật
              Việt Nam.
            </p>
            <p className="mb-4">
              Chúng tôi sẽ cấp một tài khoản (Account) sử dụng để khách hàng có
              thể mua sắm trên website{" "}
              <span className="font-semibold italic">DECOR AND MORE</span> trong
              khuôn khổ Điều khoản và Điều kiện sử dụng đã đề ra.
            </p>
            <p className="mb-4">
              Quý khách hàng sẽ phải đăng ký tài khoản với thông tin xác thực về
              bản thân và phải cập nhật nếu có bất kỳ thay đổi nào. Mỗi người
              truy cập phải có trách nhiệm với mật khẩu, tài khoản và hoạt động
              của mình trên web. Hơn nữa, quý khách hàng phải thông báo cho
              chúng tôi biết khi tài khoản bị truy cập trái phép. Chúng tôi
              không chịu bất kỳ trách nhiệm nào, dù trực tiếp hay gián tiếp, đối
              với những thiệt hại hoặc mất mát gây ra do quý khách không tuân
              thủ quy định.
            </p>
            <p className="mb-4">
              Nghiêm cấm sử dụng bất kỳ phần nào của trang web này với mục đích
              thương mại hoặc nhân danh bất kỳ đối tác thứ ba nào nếu không được
              chúng tôi cho phép bằng văn bản. Nếu vi phạm bất cứ điều nào trong
              đây, chúng tôi sẽ hủy tài khoản của khách mà không cần báo trước.
            </p>
            <p className="mb-4">
              Trong suốt quá trình đăng ký, quý khách đồng ý nhận email quảng
              cáo từ website. Nếu không muốn tiếp tục nhận mail, quý khách có
              thể từ chối bằng cách nhấp vào đường link ở dưới cùng trong mọi
              email quảng cáo.
            </p>
          </article>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white border p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-900">
                CÁC DANH MỤC SẢN PHẨM CHÍNH
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Home Decor | Tranh Canvas | Đèn Trang Trí</li>
                <li>Tranh Sắt | Đồng Hồ trang trí | Đồ Gốm</li>
                <li>Thảm Trang Trí | Gối Sofa | Bàn Ghế</li>
              </ul>
            </div>
            <div className="bg-white border p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-900">
                CHÍNH SÁCH KHÁC
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Chính sách đổi trả hàng</li>
                <li>Chính sách bảo hành</li>
                <li>Chính sách giải quyết khiếu nại</li>
                <li>Chính sách bảo mật thông tin cá nhân</li>
              </ul>
            </div>
          </section>

          <section
            className="bg-gray-50 p-6 border"
            itemScope
            itemType="https://schema.org/Organization"
          >
            <h2 className="text-xl font-semibold mb-4">THÔNG TIN LIÊN HỆ</h2>
            <div className="mb-2">
              <span className="font-medium">+ Công Ty:</span>{" "}
              <span itemProp="name">CÔNG TY TNHH DÉCOR & MORE</span>
            </div>
            <div className="mb-2">
              <span className="font-medium">+ Mã số thuế:</span> 0318900299
            </div>
            <div className="mb-2">
              <span className="font-medium">+ GPKD cấp ngày:</span> 03 tháng 04
              năm 2025
            </div>
            <div className="mb-2">
              <span className="font-medium">+ Hotline:</span>{" "}
              <span itemProp="telephone">0919 14 04 90</span> (24/7)
            </div>
            <div className="mb-2">
              <span className="font-medium">+ Email:</span>{" "}
              <a href="mailto:decorandmore.vn@gmail.com" itemProp="email">
                decorandmore.vn@gmail.com
              </a>
            </div>
            <div className="mb-2">
              <span className="font-medium">+ Địa Chỉ:</span>{" "}
              <span itemProp="address">
                63C, Nguyễn Thượng Hiền, Phường 5, Bình Thạnh, TP.HCM
              </span>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default PurchasePolicySection
