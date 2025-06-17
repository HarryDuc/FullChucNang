"use client";

import Head from "next/head";

const ReturnPolicySection = () => {
  return (
    <>
      <Head>
        <title>Chính Sách Đổi Trả | DECOR AND MORE</title>
        <meta
          name="description"
          content="Tìm hiểu chính sách đổi trả sản phẩm tại DECOR AND MORE – Đổi trả trong 7 ngày, miễn phí vận chuyển, cập nhật trạng thái qua email. Liên hệ ngay 0919 14 04 90."
        />
        <meta
          name="keywords"
          content="chính sách đổi trả, decor and more, đổi trả sản phẩm, gửi hàng miễn phí, đổi trả dễ dàng, hoàn trả sản phẩm, chăm sóc khách hàng decor"
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DECOR AND MORE" />
        <meta
          property="og:title"
          content="Chính Sách Đổi Trả | DECOR AND MORE"
        />
        <meta
          property="og:description"
          content="Đổi trả trong vòng 7 ngày, miễn phí gửi hàng tại hơn 20.000 điểm Bưu Điện. Cập nhật email từng bước xử lý đơn hàng."
        />
        <meta
          property="og:url"
          content="https://decorandmore.vn/chinh-sach-doi-tra"
        />
        <meta property="og:type" content="website" />
      </Head>

      <main className="return-policy-page">
        <section className="container mx-auto px-4 md:px-6 py-8">
          <header>
            <h1 className="text-2xl font-semibold mb-6 text-center">
              CHÍNH SÁCH ĐỔI TRẢ | DECOR AND MORE
            </h1>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <article className="bg-white border p-6">
              <h2 className="font-bold mb-2 text-blue-900">
                ĐỔI TRẢ TRONG VÒNG
              </h2>
              <p className="text-xl">07 NGÀY</p>
            </article>
            <article className="bg-white border p-6">
              <h2 className="font-bold mb-2 text-blue-900">
                GỬI HÀNG MIỄN PHÍ
              </h2>
              <p>
                Miễn phí gửi hàng thông qua hơn 20.000 điểm Bưu Điện trên toàn
                quốc
              </p>
            </article>
            <article className="bg-white border p-6">
              <h2 className="font-bold mb-2 text-blue-900">
                CẬP NHẬT THÔNG TIN
              </h2>
              <p>Cập nhật liên tục từng giai đoạn xử lý qua email.</p>
            </article>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-6">
              CÁC BƯỚC ĐỔI TRẢ CỰC KÌ ĐƠN GIẢN
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <article className="bg-white border p-6">
                <h3 className="font-bold mb-2 text-blue-900">
                  1. ĐĂNG KÍ ĐỔI TRẢ
                </h3>
                <p>
                  Liên hệ <strong className="italic">DECOR AND MORE</strong> qua
                  hotline
                  <strong> 0919.14.04.90</strong> hoặc truy cập decorandmore.vn
                  để đăng kí đổi/trả kể cả thứ 7, Chủ nhật.
                </p>
              </article>
              <article className="bg-white border p-6">
                <h3 className="font-bold mb-2 text-blue-900">
                  2. NHẬN TIN NHẮN XÁC NHẬN
                </h3>
                <p>
                  Tin nhắn xác nhận và email hướng dẫn đổi/trả sẽ ngay lập tức
                  được gửi đến khách hàng ngay sau khi khách hàng đăng kí
                  đổi/trả thành công.
                </p>
              </article>
              <article className="bg-white border p-6">
                <h3 className="font-bold mb-2 text-blue-900">
                  3. MIỄN PHÍ GỬI HÀNG VỀ DECOR AND MORE
                </h3>
                <p>
                  Mang sản phẩm đến bưu điện và quý khách sẽ được miễn phí gửi
                  hàng về
                  <strong className="italic"> DECOR AND MORE</strong> trên
                  20.000 điểm Bưu Điện trên toàn quốc.
                </p>
              </article>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-6">
              THỜI GIAN ÁP DỤNG ĐỔI / TRẢ
            </h2>
            <div className="overflow-x-auto mb-10">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">
                      KỂ TỪ KHI DECOR & MORE GIAO HÀNG THÀNH CÔNG
                    </th>
                    <th className="border p-3 text-left">
                      SẢN PHẨM LỖI (do nhà cung cấp)
                    </th>
                    <th className="border p-3 text-left">
                      SẢN PHẨM KHÔNG LỖI (*)
                    </th>
                    <th className="border p-3 text-left">
                      SẢN PHẨM LỖI DO NGƯỜI SỬ DỤNG
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-3 font-medium">
                      Tất cả các mặt hàng tại Decor & More
                    </td>
                    <td className="border p-3">
                      7 ngày đầu tiên
                      <br />
                      <strong>Đổi mới</strong>
                      <br />
                      <strong>Trả không thu phí</strong>
                    </td>
                    <td className="border p-3">
                      <strong>Trả không thu phí</strong>
                    </td>
                    <td className="border p-3">Không hỗ trợ đổi/trả</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 mb-8">
              (*) Chỉ áp dụng khi sản phẩm đáp ứng đủ điều kiện theo chính sách
            </p>
          </section>

          <section className="bg-gray-50 p-6 border">
            <h2 className="text-xl font-semibold mb-4">THÔNG TIN LIÊN HỆ</h2>
            <p className="mb-2">
              <strong>+ Công Ty:</strong> CÔNG TY TNHH DÉCOR & MORE
            </p>
            <p className="mb-2">
              <strong>+ Mã số thuế:</strong> 0318900299
            </p>
            <p className="mb-2">
              <strong>+ GPKD cấp ngày:</strong> 03 tháng 04 năm 2025
            </p>
            <p className="mb-2">
              <strong>+ Hotline:</strong> 0919 14 04 90 (24/7)
            </p>
            <p className="mb-2">
              <strong>+ Email:</strong> decorandmore.vn@gmail.com
            </p>
            <p className="mb-2">
              <strong>+ Địa Chỉ:</strong> 63C, Nguyễn Thượng Hiền, Phường 5,
              Bình Thạnh, TP.HCM
            </p>
          </section>
        </section>
      </main>
    </>
  );
};

export default ReturnPolicySection;
