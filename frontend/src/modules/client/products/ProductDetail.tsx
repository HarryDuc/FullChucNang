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
          if (productData.isVisible === true) {
            router.replace("/not_found");
            return;
          }

          setProduct(productData);

          // Set giá và hình ảnh mặc định
          const initialPrices = getLowestVariantPrices(productData);
          setCurrentPrice(initialPrices.currentPrice);
          setDiscountPrice(initialPrices.discountPrice);

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
          if (productData.isVisible === true) {
            router.replace("/not_found");
            return;
          }

          setProduct(productData);

          // Debug log để kiểm tra specification
          console.log('Product specification:', productData.specification);
          console.log('Product specificationDescription:', productData.specificationDescription);

          // Set giá và hình ảnh mặc định
          const initialPrices = getLowestVariantPrices(productData);
          setCurrentPrice(initialPrices.currentPrice);
          setDiscountPrice(initialPrices.discountPrice);

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

  // Tính giá thấp nhất từ tất cả variants
  const getLowestVariantPrices = (productData: Product) => {
    if (!productData.hasVariants || !productData.variants || productData.variants.length === 0) {
      return {
        currentPrice: productData.currentPrice !== undefined ? productData.currentPrice : 0,
        discountPrice: productData.discountPrice,
      };
    }

    let lowestCurrentPrice = Infinity;
    let lowestDiscountPrice = Infinity;
    let hasValidVariantPrice = false;
    let allVariantsZero = true;

    productData.variants.forEach((variant) => {
      // Kiểm tra xem có variant nào có giá > 0 không
      if (
        (variant.variantCurrentPrice !== undefined && variant.variantCurrentPrice > 0) ||
        (variant.variantDiscountPrice !== undefined && variant.variantDiscountPrice > 0)
      ) {
        allVariantsZero = false;
        hasValidVariantPrice = true;
      }

      // Cập nhật giá gốc thấp nhất (chỉ khi > 0)
      if (
        variant.variantCurrentPrice !== undefined &&
        variant.variantCurrentPrice > 0 &&
        variant.variantCurrentPrice < lowestCurrentPrice
      ) {
        lowestCurrentPrice = variant.variantCurrentPrice;
      }
      // Cập nhật giá khuyến mãi thấp nhất (chỉ khi > 0)
      if (
        variant.variantDiscountPrice !== undefined &&
        variant.variantDiscountPrice > 0 &&
        variant.variantDiscountPrice < lowestDiscountPrice
      ) {
        lowestDiscountPrice = variant.variantDiscountPrice;
      }
    });

    // Nếu tất cả variants đều có giá = 0, fallback về giá sản phẩm chính
    if (allVariantsZero) {
      return {
        currentPrice: productData.currentPrice !== undefined ? productData.currentPrice : 0,
        discountPrice: productData.discountPrice,
      };
    }

    // Nếu có variant có giá hợp lệ
    if (hasValidVariantPrice) {
      return {
        currentPrice: lowestCurrentPrice === Infinity ? (productData.currentPrice !== undefined ? productData.currentPrice : 0) : lowestCurrentPrice,
        discountPrice: lowestDiscountPrice === Infinity ? undefined : lowestDiscountPrice,
      };
    }

    // Fallback về giá sản phẩm chính
    return {
      currentPrice: productData.currentPrice !== undefined ? productData.currentPrice : 0,
      discountPrice: productData.discountPrice,
    };
  };

  // Format price with comma separator
  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "Liên hệ";
    if (price === 0) return "Liên hệ";
    return formatPriceUtil(price);
  };

  // Calculate discount percentage
  const calculateDiscount = (currentPrice?: number, discountPrice?: number) => {
    if (!currentPrice || discountPrice === undefined || discountPrice === null || currentPrice <= discountPrice)
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
      // Reset to lowest variant prices or original product price
      if (product) {
        const resetPrices = getLowestVariantPrices(product);
        setCurrentPrice(resetPrices.currentPrice);
        setDiscountPrice(resetPrices.discountPrice);
      }

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
    // Nếu variant có giá giảm và > 0, ưu tiên sử dụng giá giảm của variant
    if (variant.variantDiscountPrice !== undefined && variant.variantDiscountPrice > 0) {
      return {
        currentPrice:
          variant.variantCurrentPrice || variant.variantDiscountPrice,
        discountPrice: variant.variantDiscountPrice,
      };
    }

    // Nếu variant có giá riêng và > 0, ưu tiên sử dụng giá của variant
    if (variant.variantCurrentPrice !== undefined && variant.variantCurrentPrice > 0) {
      return {
        currentPrice: variant.variantCurrentPrice,
        discountPrice: variant.variantDiscountPrice,
      };
    }

    // Nếu variant có giá nhưng tất cả = 0, fallback về giá sản phẩm chính
    if (variant.variantCurrentPrice === 0 && variant.variantDiscountPrice === 0) {
      return {
        currentPrice: baseProduct.currentPrice || 0,
        discountPrice: baseProduct.discountPrice,
      };
    }

    // Nếu variant có giá undefined hoặc null, fallback về giá sản phẩm chính
    if (variant.variantCurrentPrice === undefined && variant.variantDiscountPrice === undefined) {
      return {
        currentPrice: baseProduct.currentPrice || 0,
        discountPrice: baseProduct.discountPrice,
      };
    }

    let totalAdditionalPrice = 0;

    // Chỉ tính additionalPrice khi sản phẩm có variants và variant không có giá riêng
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

      return {
        currentPrice: (baseProduct.currentPrice || 0) + totalAdditionalPrice,
        // Không lấy discountPrice từ sản phẩm chính khi có variant
        discountPrice: undefined,
      };
    } else {
      // Với sản phẩm không có variant, dùng giá và giảm giá từ sản phẩm chính
      return {
        currentPrice: baseProduct.currentPrice || 0,
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

      // Tính giá dựa vào việc có variant hay không
      const priceData =
        product.hasVariants && selectedVariant
          ? calculateVariantPrice(selectedVariant, product) // Có variant -> tính theo variant
          : getLowestVariantPrices(product); // Không có variant -> lấy giá thấp nhất từ variants

      const selectedProductData: CartItem = selectedVariant
        ? {
          _id: product._id || product.id || "",
          name: product.name,
          slug: product.slug,
          variant: selectedVariant.variantName,
          currentPrice: priceData.currentPrice,
          discountPrice: priceData.discountPrice,
          price: priceData.discountPrice !== undefined ? priceData.discountPrice : priceData.currentPrice,
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
          price: priceData.discountPrice !== undefined ? priceData.discountPrice : priceData.currentPrice,
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

  // Create product images array including all variants
  const productImages = [];
  const variantImageMap = new Map();

  // Add main product images
  if (product?.thumbnail) {
    productImages.push(product.thumbnail);
  }
  if (product?.gallery && product.gallery.length > 0) {
    productImages.push(...product.gallery);
  }

  // Add variant images and create mapping
  if (product?.variants) {
    product.variants.forEach(variant => {
      if (variant.variantThumbnail) {
        productImages.push(variant.variantThumbnail);
        variantImageMap.set(variant.variantThumbnail, variant);
      }
      if (variant.variantGalleries && variant.variantGalleries.length > 0) {
        variant.variantGalleries.forEach(img => {
          productImages.push(img);
          variantImageMap.set(img, variant);
        });
      }
    });
  }

  // Remove duplicates
  const uniqueProductImages = [...new Set(productImages)];

  // Calculate discount
  const discount = calculateDiscount(currentPrice, discountPrice);

  return (
    <>
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <ProductBreadcrumb product={product} />
        {/* Main Content with Sidebar Layout */}
        <main>
          <div className="gap-8">
            {/* Main Product Content - 9 cols on large screens */}
            <div className="lg:col-span-9">
              <article
                className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow p-6 mb-8"
                itemScope
                itemType="https://schema.org/Product"
              >
                {/* Product Images */}
                <ProductImages
                  productImages={uniqueProductImages}
                  selectedImage={selectedImage}
                  setSelectedImage={(img) => {
                    setSelectedImage(img);
                    // If image belongs to a variant, select that variant
                    const variant = variantImageMap.get(img);
                    if (variant) {
                      handleVariantSelect(variant);
                    }
                  }}
                  productName={product.name}
                  variantImageMap={variantImageMap}
                  selectedVariant={selectedVariant}
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
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-9">
                <ProductTabs
                  productSlug={product.slug}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  processedDescription={processedDescription}
                  hasMultipleImages={hasMultipleImages}
                  showAllImages={showAllImages}
                  setShowAllImages={setShowAllImages}
                  productName={product.name}
                  specification={product.specification}
                  specificationDescription={product.specificationDescription}
                />
              </div>
              <div className="lg:col-span-3">
                <ProductSidebar />
              </div>
            </div>
          </div>
        </main>
        {/* Related Products Section */}
        <RelatedProducts relatedProducts={relatedProducts} />
      </div>
    </>
  );
};

export default ProductDetailSection;
