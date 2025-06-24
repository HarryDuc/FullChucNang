import Link from "next/link";

const categories = [
  {
    label: "Home Decor",
    icon: "/image/2.png",
    href: "/category/home-decor",
  },
  {
    label: "Decor Cao Cấp",
    icon: "/image/1.png",
    href: "/category/decor-cao-cap",
  },
  {
    label: "Đồng Hồ Trang Trí",
    icon: "/image/3.png",
    href: "/category/dong-ho-trang-tri",
  },
  {
    label: "Mô Hình Xe Vintage",
    icon: "/image/5.png",
    href: "/category/mo-hinh-xe-vintage",
  },
  {
    label: "Quà tặng Nghệ thuật",
    icon: "/image/4.png",
    href: "/category/qua-tang-nghe-thuat",
  },
  {
    label: "Gối Sofa",
    icon: "/image/6.png",
    href: "/category/goi-sofa",
  },
  {
    label: "Quả Địa Cầu",
    icon: "/image/7.png",
    href: "/category/qua-dia-cau",
  },
  {
    label: "Đồ Phong Thủy",
    icon: "/image/8.png",
    href: "/category/do-phong-thuy",
  },
  {
    label: "Tranh Canvas",
    icon: "/image/10.png",
    href: "/category/tranh-canvas",
  },
  {
    label: "Đồ Gia Dụng",
    icon: "/image/11.png",
    href: "/category/ke-tu",
  },
  {
    label: "Sản Phẩm Khác",
    icon: "/image/12.png",
    href: "/category/san-pham-khac",
  },
];

const handleKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>, href: string) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    window.location.href = href;
  }
};

const Category_Home = () => {
  return (
    <section
      className="bg-white pt-2 pb-3 px-2 rounded-xl"
      aria-labelledby="danh-muc"
    >
      <h2
        id="danh-muc"
        className="text-[18px] py-4 font-semibold text-gray-900 pl-2"
      >
        Danh mục
      </h2>
      <nav aria-label="Danh mục sản phẩm">
        <ul className="flex flex-col gap-1">
          {categories.map((category, index) => (
            <li key={index}>
              <Link
                href={category.href}
                tabIndex={0}
                aria-label={`Xem danh mục ${category.label}`}
                onKeyDown={(e) => handleKeyDown(e, category.href)}
                className="flex items-center py-2 px-2 rounded-lg transition-colors hover:bg-gray-100 focus:bg-gray-100 outline-none"
                title={`Xem danh mục ${category.label}`}
              >
                <div
                  className="flex-shrink-0 border border-gray-200 rounded-full flex items-center justify-center w-10 h-10 overflow-hidden bg-white"
                  aria-hidden="true"
                >
                  <img
                    src={category.icon}
                    alt={`Icon cho ${category.label}`}
                    loading="lazy"
                    className="object-contain"
                  />
                </div>
                <span className="ml-3 text-[16px] text-gray-900 font-normal">
                  {category.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
};

export default Category_Home;
