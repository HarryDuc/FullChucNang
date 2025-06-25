"use client";

import React, { useState, useEffect } from "react";
import type { Product, ProductVariant } from "./models/product.model";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  type CartItem,
  addToCart as addToCartUtil,
  formatPrice as formatPriceUtil,
  listenCartChange,
} from "../../../../utils/cartUtils";
import ProductBreadcrumb from "./components/ProductBreadcrumb";
import ProductImages from "./components/ProductImages";
import ProductInfo from "./components/ProductInfo";
import ProductTabs from "./components/ProductTabs";
import ProductSidebar from "./components/ProductSidebar";
import RelatedProducts from "./components/RelatedProducts";
import { useProductsByMainCategory } from "./hooks/useClientProducts";
import { ProductService } from "./services/product.service";

interface ProductDetailProps {
  slug: string;
}

const ProductDetailSection = ({ slug }: ProductDetailProps) => {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedImage, setSelectedImage] = useState("");
  const [showAllImages, setShowAllImages] = useState(false);
  const [processedDescription, setProcessedDescription] = useState("");
  const [hasMultipleImages, setHasMultipleImages] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [currentPrice, setCurrentPrice] = useState<number | undefined>(
    undefined
  );
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(
    undefined
  );
  const [, setMetaDescription] = useState<string>("");

  // Get related products using the hook
  const { products: relatedProducts } = useProductsByMainCategory(
    product?.category?.main || null,
    1
  );

  // Listen for cart changes
  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem("cart");
      if (cart) {
        JSON.parse(cart);
      }
    };

    updateCartCount();
    const unsubscribe = listenCartChange(updateCartCount);
    return unsubscribe;
  }, []);

  // Hàm để cập nhật URL với thông tin variant
  const updateUrlWithVariant = (variant: ProductVariant | null) => {
    if (!variant) {
      // Nếu không có variant, xóa query params
      router.replace(`/san-pham/${product?.slug}`, {
        scroll: false,
      });
      return;
    }

    const params = new URLSearchParams();
    if (variant.sku) {
      params.set("sku", variant.sku);
    }
    if (variant.variantName) {
      params.set("variant", variant.variantName);
    }

    router.replace(`/san-pham/${product?.slug}?${params.toString()}`, {
      scroll: false,
    });
  };

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (!slug) {
          const pathParts = window.location.pathname.split("/");
          const slugFromUrl = pathParts[pathParts.length - 1];

          if (!slugFromUrl) {
            setError("Không tìm thấy thông tin sản phẩm");
            setLoading(false);
            return;
          }

          const productData = await ProductService.getOne(slugFromUrl);

          // Kiểm tra nếu sản phẩm bị ẩn
          if (productData.isVisible === false) {
            router.replace("/not_found");
            return;
          }

          setProduct(productData);

          // Set giá và hình ảnh mặc định
          setCurrentPrice(productData.basePrice || 0);
          setDiscountPrice(productData.discountPrice);

          // Set hình ảnh mặc định
          if (productData.thumbnail) {
            setSelectedImage(productData.thumbnail);
          } else if (productData.gallery && productData.gallery.length > 0) {
            setSelectedImage(productData.gallery[0]);
          }

          // Generate meta description from product data
          const shortDesc = productData.shortDescription
            ? stripHtmlTags(productData.shortDescription).substring(0, 155)
            : `Mua ${productData.name} chính hãng, giá tốt nhất. Giao hàng toàn quốc, thanh toán khi nhận hàng.`;
          setMetaDescription(shortDesc);
        } else {
          const productData = await ProductService.getOne(slug);

          // Kiểm tra nếu sản phẩm bị ẩn
          if (productData.isVisible === false) {
            router.replace("/not_found");
            return;
          }

          setProduct(productData);

          // Set giá và hình ảnh mặc định
          setCurrentPrice(productData.basePrice || 0);
          setDiscountPrice(productData.discountPrice);

          // Set hình ảnh mặc định
          if (productData.thumbnail) {
            setSelectedImage(productData.thumbnail);
          } else if (productData.gallery && productData.gallery.length > 0) {
            setSelectedImage(productData.gallery[0]);
          }

          // Generate meta description from product data
          const shortDesc = productData.shortDescription
            ? stripHtmlTags(productData.shortDescription).substring(0, 155)
            : `Mua ${productData.name} chính hãng, giá tốt nhất. Giao hàng toàn quốc, thanh toán khi nhận hàng.`;
          setMetaDescription(shortDesc);
        }

        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải thông tin sản phẩm:", err);
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      setSelectedVariant(null);
    };
  }, [slug, router]);

  // Process HTML description
  useEffect(() => {
    if (product?.description) {
      const processedHtml = processHtml(product.description);

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = processedHtml;
      const images = tempDiv.querySelectorAll("img");
      setHasMultipleImages(images.length > 1);

      if (images.length > 1) {
        for (let i = 1; i < images.length; i++) {
          images[i].classList.add("hidden-image");
        }
      }

      // Add alt attributes to images that don't have them
      images.forEach((img, index) => {
        if (!img.hasAttribute("alt") || img.getAttribute("alt") === "") {
          img.setAttribute("alt", `${product.name} - hình ảnh ${index + 1}`);
        }
      });

      // Add loading="lazy" to all images for better performance
      images.forEach((img) => {
        if (!img.hasAttribute("loading")) {
          img.setAttribute("loading", "lazy");
        }
      });

      // Force width & height = 800px for all images
      images.forEach((img) => {
        img.setAttribute("width", "800");
        img.setAttribute("height", "800");
        img.style.width = "800px";
        img.style.height = "800px";
        img.style.objectFit = "contain";
      });

      setProcessedDescription(tempDiv.innerHTML);
    }
  }, [product?.description, product?.name]);

  // Update image visibility based on showAllImages state
  useEffect(() => {
    if (processedDescription) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = processedDescription;
      const images = tempDiv.querySelectorAll("img");

      if (images.length > 1) {
        for (let i = 1; i < images.length; i++) {
          if (showAllImages) {
            images[i].classList.remove("hidden-image");
            images[i].classList.add("visible-image");
          } else {
            images[i].classList.remove("visible-image");
            images[i].classList.add("hidden-image");
          }
        }
      }

      setProcessedDescription(tempDiv.innerHTML);
    }
  }, [showAllImages, processedDescription]);

  // Helper function to strip HTML tags for meta description
  const stripHtmlTags = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText;
  };

  // Process HTML to replace relative paths with absolute URLs
  const processHtml = (html: string) => {
    if (!html) return "";

    return html
      .replace(/src="([^"]+)"/g, (match, src: string) =>
        src.startsWith("http") ? match : `src="${src}"`
      )
      .replace(/data-src="([^"]+)"/g, (match, src: string) =>
        src.startsWith("http") ? match : `data-src="${src}"`
      )
      .replace(/data-srcset="([^"]+)"/g, (match, dataSrcset: string) => {
        if (dataSrcset.includes("http")) return match;
        const newSrcset = dataSrcset
          .split(",")
          .map((s: string) =>
            s.trim().startsWith("http") ? s.trim() : `${s.trim()}`
          )
          .join(", ");
        return `data-srcset="${newSrcset}"`;
      })
      .replace(/srcset="([^"]+)"/g, (match, srcset: string) => {
        if (!srcset || srcset.trim() === "") return match;
        if (srcset.includes("http")) return match;
        const newSrcset = srcset
          .split(",")
          .map((s: string) =>
            s.trim().startsWith("http") ? s.trim() : `${s.trim()}`
          )
          .join(", ");
        return `srcset="${newSrcset}"`;
      });
  };

  // Format price with comma separator
  const formatPrice = (price?: number) => {
    if (!price) return "Liên hệ";
    return formatPriceUtil(price);
  };

  // Calculate discount percentage
  const calculateDiscount = (currentPrice?: number, discountPrice?: number) => {
    if (!currentPrice || !discountPrice || currentPrice <= discountPrice)
      return 0;
    return Math.round(((currentPrice - discountPrice) / currentPrice) * 100);
  };

  // Increase quantity
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  // Decrease quantity but not below 1
  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // Handle variant selection
  const handleVariantSelect = (variant: ProductVariant | null) => {
    setSelectedVariant(variant);
    updateUrlWithVariant(variant);

    // Update price based on selected variant
    if (variant && product) {
      const variantPrices = calculateVariantPrice(variant, product);
      setCurrentPrice(variantPrices.currentPrice);
      setDiscountPrice(variantPrices.discountPrice);

      // Update image based on variant
      if (variant.variantThumbnail) {
        setSelectedImage(variant.variantThumbnail);
      } else if (
        variant.variantGalleries &&
        variant.variantGalleries.length > 0
      ) {
        setSelectedImage(variant.variantGalleries[0]);
      }
    } else {
      // Reset to original product price
      setCurrentPrice(product?.basePrice || 0);
      setDiscountPrice(product?.discountPrice);

      // Reset to original product image
      if (product?.thumbnail) {
        setSelectedImage(product.thumbnail);
      } else if (product?.gallery && product.gallery.length > 0) {
        setSelectedImage(product.gallery[0]);
      }
    }
  };

  // Tính tổng additionalPrice từ các thuộc tính của variant đã chọn
  const calculateVariantPrice = (
    variant: ProductVariant,
    baseProduct: Product
  ) => {
    let totalAdditionalPrice = 0;

    // Chỉ tính additionalPrice khi sản phẩm có variants
    if (baseProduct.hasVariants) {
      // Lặp qua từng combination trong variant
      variant.combination.forEach((combo) => {
        // Tìm attribute tương ứng
        const attribute = baseProduct.variantAttributes?.find(
          (attr) => attr.name === combo.attributeName
        );

        // Tìm value tương ứng và cộng additionalPrice
        const value = attribute?.values.find(
          (val) => val.value === combo.value
        );
        if (value?.additionalPrice) {
          totalAdditionalPrice += value.additionalPrice;
        }
      });

      // Với sản phẩm có variant, chỉ dùng basePrice + additionalPrice
      return {
        currentPrice: (baseProduct.basePrice || 0) + totalAdditionalPrice,
        // Không lấy discountPrice từ sản phẩm chính khi có variant
        discountPrice: undefined,
      };
    } else {
      // Với sản phẩm không có variant, dùng giá và giảm giá từ sản phẩm chính
      return {
        currentPrice: baseProduct.currentPrice || baseProduct.basePrice || 0,
        discountPrice: baseProduct.discountPrice,
      };
    }
  };

  // Add to cart function
  const addToCart = () => {
    if (product) {
      if (product.hasVariants && !selectedVariant) {
        toast.error(
          <div className="flex flex-col">
            <span className="font-medium">
              Vui lòng chọn đầy đủ thuộc tính sản phẩm
            </span>
            <span className="text-xs mt-1 text-gray-600">
              Hãy chọn{" "}
              {product.variantAttributes?.map((attr) => attr.name).join(", ")}{" "}
              trước khi thêm vào giỏ hàng
            </span>
          </div>,
          {
            duration: 2000,
            style: {
              maxWidth: "95vw",
              padding: "10px 15px",
            },
          }
        );
        return;
      }

      // Check stock before adding to cart
      const stockToCheck = selectedVariant
        ? selectedVariant.variantStock
        : product.stock;
      if (stockToCheck !== undefined && stockToCheck < quantity) {
        toast.error(
          <div className="flex flex-col">
            <span className="font-medium">Số lượng vượt quá tồn kho</span>
            <span className="text-xs mt-1 text-gray-600">
              Chỉ còn {stockToCheck} sản phẩm trong kho
            </span>
          </div>,
          {
            duration: 2000,
            style: {
              maxWidth: "95vw",
              padding: "10px 15px",
            },
          }
        );
        return;
      }

      // Tính giá dựa vào việc có variant hay không
      const priceData =
        product.hasVariants && selectedVariant
          ? calculateVariantPrice(selectedVariant, product) // Có variant -> tính theo variant
          : {
              // Không có variant -> lấy giá sản phẩm chính
              currentPrice: product.currentPrice || product.basePrice || 0,
              discountPrice: product.discountPrice,
            };

      const selectedProductData: CartItem = selectedVariant
        ? {
            _id: product._id || product.id || "",
            name: product.name,
            slug: product.slug,
            variant: selectedVariant.variantName,
            currentPrice: priceData.currentPrice,
            discountPrice: priceData.discountPrice,
            price: priceData.discountPrice || priceData.currentPrice || 0,
            quantity: quantity,
            image: selectedVariant.variantThumbnail || selectedImage,
            sku: selectedVariant.sku || product.sku,
          }
        : {
            _id: product._id || product.id || "",
            name: product.name,
            slug: product.slug,
            currentPrice: priceData.currentPrice,
            discountPrice: priceData.discountPrice,
            price: priceData.discountPrice || priceData.currentPrice || 0,
            quantity: quantity,
            image:
              product.thumbnail ||
              (product.gallery && product.gallery.length > 0
                ? product.gallery[0]
                : ""),
            sku: product.sku,
          };

      addToCartUtil(selectedProductData);

      toast.success(
        <div className="flex items-center">
          <div className="mr-2 text-xl">🛒</div>
          <div className="flex flex-col">
            <span className="font-medium">Đã thêm vào giỏ hàng</span>
            <span className="text-xs mt-1 text-gray-600">
              {quantity} x {selectedProductData.name}{" "}
              {selectedVariant ? `(${selectedVariant.variantName})` : ""}
            </span>
          </div>
        </div>,
        {
          duration: 1500,
          style: {
            maxWidth: "95vw",
            padding: "10px 15px",
          },
        }
      );
    }
  };

  // Buy now function
  const buyNow = () => {
    if (product) {
      if (product.hasVariants && !selectedVariant) {
        toast.error(
          <div className="flex flex-col">
            <span className="font-medium">
              Vui lòng chọn đầy đủ thuộc tính sản phẩm
            </span>
            <span className="text-xs mt-1 text-gray-600">
              Hãy chọn{" "}
              {product.variantAttributes?.map((attr) => attr.name).join(", ")}{" "}
              trước khi mua ngay
            </span>
          </div>,
          {
            duration: 2000,
            style: {
              maxWidth: "95vw",
              padding: "10px 15px",
            },
          }
        );
        return;
      }

      addToCart();
      router.push("/cart");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-900"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            Lỗi khi tải sản phẩm
          </h2>
          <p className="text-red-700">
            {error || "Không tìm thấy thông tin sản phẩm"}
          </p>
          <button
            onClick={() => router.push("/category")}
            className="mt-6 bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800"
          >
            Quay lại cửa hàng
          </button>
        </div>
      </div>
    );
  }

  // Create product images array
  const productImages = [];
  if (selectedVariant) {
    if (selectedVariant.variantThumbnail) {
      productImages.push(selectedVariant.variantThumbnail);
    }
    if (
      selectedVariant.variantGalleries &&
      selectedVariant.variantGalleries.length > 0
    ) {
      productImages.push(...selectedVariant.variantGalleries);
    }
  }

  if (productImages.length === 0) {
    if (product?.thumbnail) {
      productImages.push(product.thumbnail);
    }
    if (product?.gallery && product.gallery.length > 0) {
      productImages.push(...product.gallery);
    }
  }

  // Calculate discount
  const discount = calculateDiscount(currentPrice, discountPrice);

  return (
    <>
      <div className="bg-[#f5f5fa] min-h-screen">
        {/* Breadcrumb */}
        <ProductBreadcrumb product={product} />
        {/* Main Content with Sidebar Layout */}
        <main role="main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Product Content - 9 cols on large screens */}
            <div className="lg:col-span-9">
              <article
                className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow p-6 mb-8"
                itemScope
                itemType="https://schema.org/Product"
              >
                {/* Product Images */}
                <ProductImages
                  productImages={productImages}
                  selectedImage={selectedImage}
                  setSelectedImage={setSelectedImage}
                  productName={product.name}
                />
                {/* Product Info */}
                <ProductInfo
                  product={product}
                  currentPrice={currentPrice}
                  discountPrice={discountPrice}
                  discount={discount}
                  selectedVariant={selectedVariant}
                  handleVariantSelect={handleVariantSelect}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  increaseQuantity={increaseQuantity}
                  decreaseQuantity={decreaseQuantity}
                  addToCart={addToCart}
                  buyNow={buyNow}
                  formatPrice={formatPrice}
                />
              </article>
              {/* Tabs for Description and Reviews */}
              <ProductTabs
                productSlug={product.slug}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                processedDescription={processedDescription}
                hasMultipleImages={hasMultipleImages}
                showAllImages={showAllImages}
                setShowAllImages={setShowAllImages}
                productName={product.name}
              />
            </div>
            {/* Right Sidebar Banner Section - 3 cols on large screens */}
            <ProductSidebar />
          </div>
        </main>
        {/* Related Products Section */}
        <RelatedProducts relatedProducts={relatedProducts} />
      </div>
    </>
  );
};

export default ProductDetailSection;
