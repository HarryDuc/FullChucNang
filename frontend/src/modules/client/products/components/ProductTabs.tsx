import React, { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useProductReviews, useCreateReview } from "../hooks/useReviews";
import { toast } from "react-hot-toast";
import { useUser } from "../../users/hooks/useUser";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface SpecificationGroup {
  title: string;
  specs: {
    name: string;
    value: string;
  }[];
}

interface Specification {
  title: string;
  groups: SpecificationGroup[];
}

interface ProductTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  processedDescription: string;
  hasMultipleImages: boolean;
  showAllImages: boolean;
  setShowAllImages: (show: boolean) => void;
  productName: string;
  productSlug: string;
  specification?: Specification;
}

const ProductTabs: React.FC<ProductTabsProps> = ({
  activeTab,
  setActiveTab,
  processedDescription,
  hasMultipleImages,
  showAllImages,
  setShowAllImages,
  productName,
  productSlug,
  specification,
}) => {
  const { isAuthenticated } = useAuth();
  const { user } = useUser();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [saveInfo, setSaveInfo] = useState(false);

  // Sử dụng các hooks review
  const { data: reviews = [], isLoading: isLoadingReviews } =
    useProductReviews(productSlug);
  const { mutate: createReview, isPending: isSubmitting } = useCreateReview();

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productSlug) {
      toast.error("Không tìm thấy thông tin sản phẩm");
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh giá");
      return;
    }

    if (!user.id) {
      toast.error(
        "Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại"
      );
      return;
    }

    if (!user.fullName) {
      toast.error("Vui lòng cập nhật họ tên trong thông tin cá nhân");
      return;
    }

    if (!user.email) {
      toast.error("Vui lòng cập nhật email trong thông tin cá nhân");
      return;
    }

    if (!rating) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    createReview({
      productSlug,
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      userAvatar: user.avatar,
      rating,
      comment: comment.trim(),
    });
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoveredStar(star)}
        onMouseLeave={() => setHoveredStar(0)}
        className={`text-2xl ${
          star <= (hoveredStar || rating) ? "text-yellow-400" : "text-gray-300"
        } hover:text-yellow-400 transition-colors`}
        aria-label={`Rate ${star} stars`}
      >
        ★
      </button>
    ));
  };

  const renderSpecifications = () => {
    if (!specification || !specification.groups) return null;

    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">{specification.title}</h3>
        <div className="space-y-6">
          {specification.groups.map((group, groupIndex) => (
            <div key={groupIndex} className="bg-white rounded-lg shadow-sm">
              <div className="bg-gray-50 px-4 py-3 rounded-t-lg">
                <h4 className="font-semibold text-gray-800">{group.title}</h4>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.specs.map((spec, specIndex) => (
                    <div key={specIndex} className="flex">
                      <div className="w-1/2 text-gray-600">{spec.name}</div>
                      <div className="w-1/2 text-gray-900">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <div className="border-b border-gray-200 bg-white rounded-t-lg shadow-sm">
        <div className="flex" role="tablist">
          <button
            className={`px-8 py-4 font-semibold text-lg rounded-t-lg focus:outline-none transition-all duration-200 ${
              activeTab === "description"
                ? "border-b-4 border-blue-900 text-blue-900 bg-blue-50"
                : "text-gray-600 hover:text-blue-900 bg-transparent"
            }`}
            onClick={() => setActiveTab("description")}
            role="tab"
            aria-selected={activeTab === "description"}
            aria-controls="description-panel"
            id="description-tab"
          >
            Mô tả
          </button>
          <button
            className={`px-8 py-4 font-semibold text-lg rounded-t-lg focus:outline-none transition-all duration-200 ${
              activeTab === "specification"
                ? "border-b-4 border-blue-900 text-blue-900 bg-blue-50"
                : "text-gray-600 hover:text-blue-900 bg-transparent"
            }`}
            onClick={() => setActiveTab("specification")}
            role="tab"
            aria-selected={activeTab === "specification"}
            aria-controls="specification-panel"
            id="specification-tab"
          >
            Thông số kỹ thuật
          </button>
          <button
            className={`px-8 py-4 font-semibold text-lg rounded-t-lg focus:outline-none transition-all duration-200 ${
              activeTab === "reviews"
                ? "border-b-4 border-blue-900 text-blue-900 bg-blue-50"
                : "text-gray-600 hover:text-blue-900 bg-transparent"
            }`}
            onClick={() => setActiveTab("reviews")}
            role="tab"
            aria-selected={activeTab === "reviews"}
            aria-controls="reviews-panel"
            id="reviews-tab"
          >
            Đánh giá ({reviews.length})
          </button>
        </div>
      </div>
      <div className="py-8 px-6 bg-white rounded-b-lg shadow-sm">
        {activeTab === "description" ? (
          <div
            role="tabpanel"
            id="description-panel"
            aria-labelledby="description-tab"
          >
            <h2 className="text-2xl font-bold mb-4">{productName}</h2>
            <div
              className="text-gray-600 mb-6 bg-gray-50 overflow-hidden product-description-container p-4 rounded-lg"
              dangerouslySetInnerHTML={{ __html: processedDescription }}
            />
            {hasMultipleImages && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAllImages(!showAllImages)}
                  className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition-all duration-300 flex items-center gap-2"
                  aria-expanded={showAllImages}
                >
                  {showAllImages ? (
                    <>
                      Thu gọn{" "}
                      <IoIosArrowUp className="transition-transform duration-300" />
                    </>
                  ) : (
                    <>
                      Xem thêm{" "}
                      <IoIosArrowDown className="transition-transform duration-300" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : activeTab === "specification" ? (
          <div
            role="tabpanel"
            id="specification-panel"
            aria-labelledby="specification-tab"
          >
            {renderSpecifications()}
          </div>
        ) : (
          <div role="tabpanel" id="reviews-panel" aria-labelledby="reviews-tab">
            <h2 className="text-xl font-bold mb-4">Đánh giá</h2>

            {/* Hiển thị danh sách đánh giá */}
            {isLoadingReviews ? (
              <p>Đang tải đánh giá...</p>
            ) : reviews.length > 0 ? (
              <div className="space-y-6 mb-8">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b pb-6">
                    <div className="flex items-center gap-4 mb-2">
                      {review.userAvatar && (
                        <img
                          src={review.userAvatar}
                          alt={review.userName}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{review.userName}</p>
                        <div className="flex text-yellow-400">
                          {[...Array(review.rating)].map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 mb-4">Chưa có đánh giá nào.</p>
            )}

            {/* Form đánh giá */}
            {isAuthenticated && user ? (
              <form onSubmit={handleSubmitReview} className="mt-8">
                <h3 className="text-lg font-semibold mb-4">
                  {reviews.length === 0
                    ? `Hãy là người đầu tiên nhận xét "${productName}"`
                    : `Đánh giá "${productName}"`}
                </h3>
                <div className="mb-4">
                  <p className="mb-2 font-medium">Xếp hạng của bạn *</p>
                  <div className="flex gap-1">{renderStars()}</div>
                </div>
                <div className="mb-4">
                  <label htmlFor="review" className="block mb-2 font-medium">
                    Nhận xét của bạn *
                  </label>
                  <textarea
                    id="review"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-300 p-3 min-h-32 rounded-lg"
                    placeholder="Viết nhận xét của bạn tại đây..."
                    aria-required="true"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="save-info" className="flex items-center">
                    <input
                      id="save-info"
                      type="checkbox"
                      checked={saveInfo}
                      onChange={(e) => setSaveInfo(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-gray-700">
                      Lưu thông tin của tôi cho lần bình luận kế tiếp.
                    </span>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-900 text-white py-3 px-6 hover:bg-blue-800 rounded-lg font-semibold disabled:opacity-50"
                  aria-label="Gửi đánh giá"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </form>
            ) : (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  Vui lòng{" "}
                  <Link href="/login" className="text-blue-600 hover:underline">
                    đăng nhập
                  </Link>{" "}
                  để đánh giá sản phẩm.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductTabs;
