
import Head from "next/head";
import { useState } from "react";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Giả lập gửi form thành công
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      // Reset thông báo thành công sau 5 giây
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <>
      <Head>
        <title>LIÊN HỆ VỚI DECOR &amp; MORE</title>
        <meta
          name="description"
          content="Liên hệ với DECOR &amp; MORE: Hotline 0919 14 04 90 (24/7), địa chỉ 63C, Nguyễn Thượng Hiền, Phường 5, Bình Thạnh, TP.HCM. Gửi tin nhắn để nhận thông tin sản phẩm và dịch vụ."
        />
        <meta name="robots" content="index, follow" />
        <meta
          name="keywords"
          content="DECOR &amp; MORE, liên hệ, hotline, địa chỉ, email, sản phẩm, dịch vụ"
        />
        <meta property="og:title" content="LIÊN HỆ VỚI DECOR &amp; MORE" />
        <meta
          property="og:description"
          content="Liên hệ với DECOR &amp; MORE: Hotline 0919 14 04 90 (24/7), địa chỉ 63C, Nguyễn Thượng Hiền, Phường 5, Bình Thạnh, TP.HCM."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://decorandmore.vn/lien-he" />
        <meta property="og:image" content="/path/to/og-image.jpg" />
        <link rel="canonical" href="https://decorandmore.vn/lien-he" />
      </Head>

      <div className="contact-page">
        <div className=" mx-auto px-4 md:px-6 py-8">
          <h1 className="text-2xl font-semibold mb-6 text-center text-black">
            LIÊN HỆ VỚI DECOR &amp; MORE
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Thông tin liên hệ */}
            <div className="md:col-span-1">
              <div className="bg-white border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-blue-900 border-b pb-2">
                  THÔNG TIN LIÊN HỆ
                </h2>

                <div className="space-y-5">
                  <div>
                    <h3 className="font-medium text-lg mb-2">Hotline</h3>
                    <p className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-800"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      0919 14 04 90 (24/7)
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-2">Địa Chỉ</h3>
                    <p className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-800 mt-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      63C, Nguyễn Thượng Hiền, Phường 5, Bình Thạnh, TP.HCM
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-2">Email</h3>
                    <p className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-800"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      decorandmore.vn@gmail.com
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-2">Giờ Làm Việc</h3>
                    <p className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-800"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      8:00 - 20:00 (Thứ 2 - Chủ Nhật)
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <h3 className="font-medium text-lg mb-3">
                      Kết nối với chúng tôi
                    </h3>
                    <div className="flex space-x-4">
                      <a
                        href="https://www.facebook.com/decorandmore.vn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-800 hover:text-blue-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                        </svg>
                      </a>
                      <a
                        href="https://www.instagram.com/decorandmore.vn/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-800 hover:text-blue-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                      <a
                        href="https://www.youtube.com/@decorandmore"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-800 hover:text-blue-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form liên hệ */}
            <div className="md:col-span-2">
              <div className="bg-white border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-blue-900 border-b pb-2">
                  GỬI TIN NHẮN CHO CHÚNG TÔI
                </h2>
                <p className="mb-6">
                  Hãy điền thông tin của bạn vào mẫu bên dưới, chúng tôi sẽ liên
                  hệ lại sớm nhất có thể.
                </p>

                {submitSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 mb-6">
                    Cảm ơn bạn đã gửi tin nhắn! Chúng tôi sẽ liên hệ với bạn
                    trong thời gian sớm nhất.
                  </div>
                )}

                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
                    Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau hoặc
                    liên hệ trực tiếp qua số điện thoại của chúng tôi.
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Chủ đề <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">-- Chọn chủ đề --</option>
                        <option value="Thông tin sản phẩm">
                          Thông tin sản phẩm
                        </option>
                        <option value="Đặt hàng và thanh toán">
                          Đặt hàng và thanh toán
                        </option>
                        <option value="Chính sách đổi trả">
                          Chính sách đổi trả
                        </option>
                        <option value="Vận chuyển và giao hàng">
                          Vận chuyển và giao hàng
                        </option>
                        <option value="Hợp tác kinh doanh">
                          Hợp tác kinh doanh
                        </option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nội dung tin nhắn <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className={`bg-blue-800 hover:bg-blue-700 text-white font-medium py-2 px-6 transition duration-300 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang gửi..." : "Gửi tin nhắn"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Bản đồ */}
          <div className="bg-white border p-6 shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-900 border-b pb-2">
              BẢN ĐỒ CỬA HÀNG
            </h2>
            <div className="w-full h-[400px] bg-gray-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.106618387446!2d106.68752931532068!3d10.80252396157098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528b3b82cc571%3A0xf3d9db852e053ea9!2zNjNjIE5ndXnhu4VuIFRoxrDhu6NuZyBIaeG7gW4sIFBoxrDhu51uZyA1LCBCw6xuaCBUaOG6oW5oLCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1658926567353!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ cửa hàng"
              ></iframe>
            </div>
          </div>

          {/* Câu hỏi thường gặp */}
          <div className="bg-white border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-blue-900 border-b pb-2">
              CÂU HỎI THƯỜNG GẶP
            </h2>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium text-lg mb-2">
                  Làm thế nào để đặt hàng trực tuyến?
                </h3>
                <p>
                  Quý khách có thể đặt hàng trực tuyến thông qua website chính
                  thức của chúng tôi tại decorandmore.vn hoặc liên hệ trực tiếp
                  qua số hotline <strong>0919.14.04.90</strong> (24/7) để được
                  hỗ trợ đặt hàng.
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-medium text-lg mb-2">
                  Thời gian giao hàng là bao lâu?
                </h3>
                <p>
                  Thời gian giao hàng tùy thuộc vào khu vực của quý khách. Đối
                  với nội thành TP.HCM, thời gian giao hàng thường từ 1-2 ngày.
                  Đối với các tỉnh thành khác, thời gian giao hàng từ 3-5 ngày
                  làm việc.
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-medium text-lg mb-2">
                  Có được đổi trả hàng không?
                </h3>
                <p>
                  DÉCOR &amp; MORE chấp nhận đổi trả trong vòng 7 ngày kể từ
                  ngày nhận hàng nếu sản phẩm không đúng như mô tả hoặc có lỗi
                  từ nhà sản xuất. Quý khách vui lòng liên hệ với chúng tôi qua
                  hotline hoặc email để được hướng dẫn cụ thể về quy trình đổi
                  trả.
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-medium text-lg mb-2">
                  Phí vận chuyển là bao nhiêu?
                </h3>
                <p>
                  DÉCOR &amp; MORE áp dụng chính sách miễn phí giao hàng toàn
                  quốc cho tất cả đơn hàng, không phụ thuộc vào giá trị đơn hàng
                  và khu vực giao hàng.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-2">
                  Có thể xem sản phẩm trực tiếp tại cửa hàng không?
                </h3>
                <p>
                  Quý khách có thể đến trực tiếp cửa hàng của DÉCOR &amp; MORE
                  (Công Ty: CÔNG TY TNHH DÉCOR &amp; MORE, MST: 0318900299, GPKD
                  cấp ngày: 03 tháng 04 năm 2025) tại địa chỉ{" "}
                  <strong>
                    63C, Nguyễn Thượng Hiền, Phường 5, Bình Thạnh, TP.HCM&nbsp;
                  </strong>
                  để xem và trải nghiệm sản phẩm. Cửa hàng mở cửa từ 8:00 -
                  20:00 các ngày trong tuần.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactSection;
