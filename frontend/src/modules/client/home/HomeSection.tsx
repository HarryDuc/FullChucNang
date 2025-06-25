import React from "react";
import Carousel from "./components/Carousel";
import Category_Home from "./components/Category_Home";
import CategorySection from "./components/CategorySection";
import FlashSale from "./components/FlashSale";
import ImageGallery from "./components/ImageGallary";

const HomeSection = () => {
  return (
    <main className="home-page" role="main">
      <section
        className="flex flex-col md:flex-row gap-4"
        aria-label="Danh mục và slider"
      >
        <aside
          className="w-full md:w-1/3 lg:w-1/5"
          aria-label="Danh mục sản phẩm"
        >
          <div className="max-h-full overflow-y-auto">
            <Category_Home />
          </div>
        </aside>
        <div className="w-full md:w-2/3 lg:w-4/5">
          <div className="flex flex-col gap-4">
            <div aria-label="Trình chiếu hình ảnh chính">
              <Carousel />
            </div>
            <div className="flex-1" aria-label="Thư viện hình ảnh nổi bật">
              <ImageGallery />
            </div>
          </div>
        </div>
      </section>

      {/* Flash sale */}
      <section aria-label="Flash Sale" className="mt-4">
        <FlashSale />
      </section>

      {/* Danh mục sản phẩm */}
      <section aria-label="Danh mục sản phẩm">
        <CategorySection />
      </section>
    </main>
  );
};

export default HomeSection;
// export default Home;
// import Carousel from "../home/components/Carousel";
// import Category_Home from "../home/components/Category_Home";
// import CategorySection from "../home/components/CategorySection";
// import FlashSale from "../home/components/FlashSale";
// import ImageGallery from "../home/components/ImageGallary";

// const Home = () => {
//   return (
//     <main className="home-page px-4 flex flex-col md:flex-row gap-4" role="main">
//       {/* Cột trái: Category sticky */}
//       <aside
//         className="w-full md:w-1/3 lg:w-1/5"
//         aria-label="Danh mục sản phẩm"
//       >
//         <div className="sticky top-2 max-h-screen overflow-y-auto">
//           <Category_Home />
//         </div>
//       </aside>

//       {/* Cột phải: Carousel, Gallery, FlashSale, CategorySection */}
//       <div className="flex-1 flex flex-col gap-6">
//         {/* Carousel và Gallery */}
//         <section
//           className="flex flex-col gap-4"
//           aria-label="Slider và thư viện ảnh"
//         >
//           <div aria-label="Trình chiếu hình ảnh chính">
//             <Carousel />
//           </div>
//           {/* <div className="flex-1" aria-label="Thư viện hình ảnh nổi bật">
//             <ImageGallery />
//           </div> */}
//         </section>

//         {/* Flash sale */}
//         <section aria-label="Flash Sale">
//           <FlashSale />
//         </section>

//         {/* Danh mục sản phẩm */}
//         <section aria-label="Danh mục sản phẩm">
//           <CategorySection />
//         </section>
//       </div>
//     </main>
//   );
// };

// export default Home;
