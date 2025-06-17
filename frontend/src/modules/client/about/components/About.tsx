export default function About() {
  return (
    <>
      <div className="about-page">
        <div className=" mx-auto px-4 md:px-6 py-8">
          {/* Logo và tiêu đề */}
          <div className="flex flex-col items-center justify-center mb-8">
            <img
              src="/image/Logo_Decor-More.png"
              alt="Logo của Decor & More - Cung cấp trang trí nội thất cao cấp"
              className="w-32 md:w-48 mb-4"
            />
          </div>

          {/* Giới thiệu */}
          <div className="bg-white border p-6 mb-8">
            <h1 className="text-xl font-semibold mb-4 text-blue-900">
              CHÚNG TÔI LÀ AI
            </h1>
            <p className="mb-4">
              <span className="font-semibold italic">DECOR AND MORE</span> là
              thương hiệu chuyên cung cấp các sản phẩm trang trí nội thất cao
              cấp tại Việt Nam. Được thành lập vào ngày 29 tháng 06 năm 2021,
              chúng tôi đã và đang không ngừng phát triển nhằm mang đến cho
              khách hàng những sản phẩm trang trí nhà cửa mang phong cách hiện
              đại, độc đáo và sáng tạo.
            </p>
            <p className="mb-4">
              Với phương châm{" "}
              <span className="font-semibold italic text-gold-decor">
                &quot;Bring Your Home To Life&quot;
              </span>
              , <span className="font-semibold italic">DECOR AND MORE</span>{" "}
              mong muốn mỗi sản phẩm của chúng tôi không chỉ là vật trang trí,
              mà còn là nguồn cảm hứng, mang lại sức sống mới cho không gian
              sống của bạn.
            </p>
            <p className="mb-4">
              Hoạt động với giấy chứng nhận đăng ký kinh doanh số 0318900299 do
              Sở Kế Hoạch và Đầu tư Thành phố Hồ Chí Minh cấp ngày 03/04/2025,{" "}
              <span className="font-semibold italic">DECOR AND MORE</span> đã và
              đang từng bước khẳng định vị thế của mình trên thị trường nội thất
              và trang trí Việt Nam.
            </p>
            <p className="mb-4">
              Chúng tôi hiểu rằng mỗi ngôi nhà đều có một câu chuyện riêng, và
              chúng tôi muốn góp phần tạo nên câu chuyện đó thông qua những sản
              phẩm trang trí ý nghĩa và độc đáo.
            </p>
          </div>

          {/* Tầm nhìn & Sứ mệnh */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-900">
                TẦM NHÌN
              </h2>
              <p className="mb-3">
                <span className="font-semibold italic">DECOR AND MORE</span>{" "}
                hướng đến việc trở thành thương hiệu hàng đầu trong lĩnh vực
                trang trí nội thất tại Việt Nam, cung cấp những sản phẩm chất
                lượng, đa dạng về phong cách và giá cả hợp lý.
              </p>
              <p>
                Chúng tôi không chỉ đơn thuần bán sản phẩm, mà còn mang đến
                những giải pháp trang trí toàn diện, tư vấn cho khách hàng cách
                thức tạo nên không gian sống thể hiện đúng cá tính và phong cách
                sống của mình.
              </p>
            </div>
            <div className="bg-white border p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-900">
                SỨ MỆNH
              </h2>
              <p className="mb-3">
                Sứ mệnh của{" "}
                <span className="font-semibold italic">DECOR AND MORE</span> là
                mang đến những không gian sống đẹp, hiện đại và đầy cảm hứng cho
                mọi gia đình Việt Nam.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Dịch vụ chăm sóc khách hàng tận tâm</li>
                <li>Miễn phí giao hàng toàn quốc</li>
                <li>Các chính sách bảo hành và đổi trả linh hoạt</li>
                <li>Tư vấn chuyên nghiệp về trang trí nội thất</li>
              </ul>
            </div>
          </div>

          {/* Phong cách thiết kế */}
          <div className="bg-white border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">
              PHONG CÁCH THIẾT KẾ
            </h2>
            <p className="mb-4">
              <span className="font-semibold italic">DECOR AND MORE</span> tự
              hào mang đến đa dạng các phong cách thiết kế, đáp ứng mọi nhu cầu
              và sở thích của khách hàng:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium text-lg mb-2">Minimalist</h3>
                <p>
                  Phong cách tối giản, tinh tế với những đường nét đơn giản, màu
                  sắc trung tính, tạo nên không gian sống gọn gàng và hiện đại.
                </p>
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-medium text-lg mb-2">Scandinavian</h3>
                <p>
                  Thiết kế phong cách Bắc Âu với tông màu sáng, sử dụng các chất
                  liệu tự nhiên, tạo cảm giác ấm áp và gần gũi với thiên nhiên.
                </p>
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-medium text-lg mb-2">Vintage</h3>
                <p>
                  Mang đậm hơi thở của thời gian, với những món đồ mang tính
                  hoài cổ, kết hợp hài hòa với không gian hiện đại.
                </p>
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-medium text-lg mb-2">Neo-Classical</h3>
                <p>
                  Kết hợp giữa vẻ đẹp cổ điển và hiện đại, tạo nên không gian
                  sang trọng, đẳng cấp với những chi tiết được chăm chút tỉ mỉ.
                </p>
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-medium text-lg mb-2">Abstract</h3>
                <p>
                  Phong cách nghệ thuật trừu tượng, sử dụng màu sắc và hình khối
                  táo bạo, phá cách, tạo điểm nhấn độc đáo cho không gian.
                </p>
              </div>
            </div>
          </div>

          {/* Sản phẩm chính */}
          <div className="bg-white border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">
              DANH MỤC SẢN PHẨM CHÍNH
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-lg mb-3">Home Decor</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Decor cao cấp</li>
                  <li>Gối Sofa</li>
                  <li>Tranh Canvas</li>
                  <li>Đèn Trang Trí</li>
                  <li>Tranh Sắt</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-3">
                  Nội Thất & Phụ Kiện
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Bàn Ghế</li>
                  <li>Thảm Trang Trí</li>
                  <li>Quà tặng nghệ thuật</li>
                  <li>Đồ Gốm</li>
                  <li>Đồng Hồ trang trí</li>
                  <li>Mô Hình Xe Vintage</li>
                  <li>Kệ Tủ</li>
                </ul>
              </div>
            </div>
            <p className="mt-4">
              Tất cả sản phẩm của{" "}
              <span className="font-semibold italic">DECOR AND MORE</span> đều
              được lựa chọn kỹ lưỡng, đảm bảo chất lượng và thẩm mỹ cao.
            </p>
          </div>

          {/* Dịch vụ của chúng tôi */}
          <div className="bg-white border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">
              DỊCH VỤ CỦA CHÚNG TÔI
            </h2>
            <p className="mb-4">
              Bên cạnh việc cung cấp các sản phẩm trang trí nội thất,{" "}
              <span className="font-semibold italic">DECOR AND MORE</span> còn
              cung cấp nhiều dịch vụ giá trị gia tăng để đảm bảo trải nghiệm mua
              sắm tốt nhất cho khách hàng:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                <span className="font-medium">Tư vấn trang trí nội thất:</span>{" "}
                Với đội ngũ chuyên viên giàu kinh nghiệm, chúng tôi sẵn sàng tư
                vấn và giúp bạn lựa chọn những sản phẩm phù hợp với không gian
                sống và phong cách cá nhân.
              </li>
              <li>
                <span className="font-medium">
                  Miễn phí giao hàng toàn quốc:
                </span>{" "}
                Cam kết giao hàng miễn phí đến tận nơi trên toàn quốc, đảm bảo
                sản phẩm đến tay khách hàng một cách nhanh chóng và an toàn.
              </li>
              <li>
                <span className="font-medium">
                  Chính sách đổi trả linh hoạt:
                </span>{" "}
                Chấp nhận đổi trả trong vòng 7 ngày nếu sản phẩm không đúng như
                mô tả hoặc có lỗi từ nhà sản xuất.
              </li>
              <li>
                <span className="font-medium">
                  Dịch vụ chăm sóc khách hàng 24/7:
                </span>{" "}
                Luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của khách hàng qua
                hotline 0919 14 04 90.
              </li>
            </ul>
          </div>

          {/* Cam kết của chúng tôi */}
          <div className="bg-white border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">
              CAM KẾT CỦA CHÚNG TÔI
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium text-lg mb-2">Chất Lượng</h3>
                <p>
                  Mọi sản phẩm tại{" "}
                  <span className="font-semibold italic">DECOR AND MORE</span>{" "}
                  đều được kiểm soát chất lượng nghiêm ngặt trước khi đến tay
                  khách hàng.
                </p>
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-medium text-lg mb-2">Uy Tín</h3>
                <p>
                  Lấy sự hài lòng của khách hàng làm thước đo thành công, chúng
                  tôi luôn giữ chữ tín trong mọi giao dịch.
                </p>
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-medium text-lg mb-2">Tận Tâm</h3>
                <p>
                  Chúng tôi luôn lắng nghe, thấu hiểu và đặt mình vào vị trí của
                  khách hàng để cung cấp dịch vụ tốt nhất.
                </p>
              </div>
            </div>
          </div>

          {/* Cuối trang - Bổ sung logo và slogan */}
          <div className="mt-10 mb-8 flex flex-col items-center">
            <p className="text-xl font-medium text-gold-decor italic">
              &quot;Bring Your Home To Life&quot;{" "}
            </p>
          </div>

          {/* Thông tin liên hệ */}
          <div className="bg-gray-50 p-6 border">
            <h2 className="text-xl font-semibold mb-4">THÔNG TIN LIÊN HỆ</h2>
            <div className="mb-2">
              <span className="font-medium">DÉCOR &amp; MORE</span>
            </div>
            <div className="mb-2">
              <span className="font-medium">Công Ty:</span> CÔNG TY TNHH DÉCOR
              &amp; MORE
            </div>
            <div className="mb-2">
              <span className="font-medium">MST:</span> 0318900299
            </div>
            <div className="mb-2">
              <span className="font-medium">GPKD cấp ngày:</span> 03 tháng 04
              năm 2025
            </div>
            <div className="mb-2">
              <span className="font-medium">Hotline:</span> 0919.14.04.90 (24/7)
            </div>
            <div className="mb-2">
              <span className="font-medium">Email:</span>{" "}
              decorandmore.vn@gmail.com
            </div>
            <div className="mb-2">
              <span className="font-medium">Địa Chỉ:</span> 63C, Nguyễn Thượng
              Hiền, Phường 5, Bình Thạnh, TP.HCM
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
