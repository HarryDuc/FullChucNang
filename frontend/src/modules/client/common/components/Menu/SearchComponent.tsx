"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import { removeVietnameseDiacritics } from "../../../../../../utils/ProductUtil";
import { Product } from "@/modules/admin/products/models/product.model";
import { ProductService } from "@/modules/admin/products/services/product.service";
interface SearchComponentProps {
  isMobile?: boolean;
}

const SearchComponent = ({ isMobile = false }: SearchComponentProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [, setIsLoadingProducts] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasFetchedProducts, setHasFetchedProducts] = useState(false);

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileContentRef = useRef<HTMLDivElement>(null);

  // Tải dữ liệu sản phẩm và cache vào sessionStorage
  const loadAllProducts = async () => {
    const cached = sessionStorage.getItem("cachedAllProducts");
    if (cached) {
      setAllProducts(JSON.parse(cached));
      return;
    }
    try {
      setIsLoadingProducts(true);
      console.log("Gọi API để tải dữ liệu sản phẩm...");
      const firstPageData = await ProductService.getBasicInfo(1, 100);
      if (firstPageData?.data) {
        const allProductsList: Product[] = [...firstPageData.data];
        const totalPages = firstPageData.totalPages;
        if (totalPages > 1) {
          const pages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
          const responses = await Promise.all(
            pages.map((page) =>
              ProductService.getBasicInfo(page, 100)
                .then((res) => res.data)
                .catch(() => [])
            )
          );
          responses.forEach((res) => allProductsList.push(...res));
        }
        setAllProducts(allProductsList);
        sessionStorage.setItem(
          "cachedAllProducts",
          JSON.stringify(allProductsList)
        );
      }
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Khi người dùng focus vào input, nếu chưa fetch sẽ gọi API
  const handleInputFocus = () => {
    setIsFocused(true);
    if (!hasFetchedProducts) {
      setHasFetchedProducts(true);
      loadAllProducts();
    }
  };

  // Hàm tìm kiếm trên mảng allProducts
  const performSearch = (searchText: string) => {
    if (!searchText.trim()) return [];
    const searchTerms = removeVietnameseDiacritics(searchText.toLowerCase())
      .split(/\s+/)
      .filter((term) => term.length > 1);

    const results = allProducts.filter((product) => {
      const searchableText = [
        removeVietnameseDiacritics(product.name?.toLowerCase()),
        removeVietnameseDiacritics(product.slug?.toLowerCase()),
        removeVietnameseDiacritics(product.category?.main?.toLowerCase() || ""),
        ...(product.category?.sub?.map((s) =>
          removeVietnameseDiacritics(s.toLowerCase())
        ) || []),
        ...(product.category?.tags?.map((t) =>
          removeVietnameseDiacritics(t.toLowerCase())
        ) || []),
      ];

      // Kiểm tra từng term có tồn tại trong bất kỳ phần tử nào của searchableText
      return searchTerms.every((term) =>
        searchableText.some((text) => text.includes(term))
      );
    });

    return results
      .map((product) => {
        let score = 0;
        const name = removeVietnameseDiacritics(
          product.name?.toLowerCase()
        );

        searchTerms.forEach((term) => {
          // Tăng điểm cho các trường hợp match
          if (name.includes(term)) {
            score += 10;
            // Bonus điểm cho match ở đầu từ
            if (name.startsWith(term)) score += 5;
            // Bonus điểm cho match chính xác
            if (name.split(/\s+/).includes(term)) score += 3;
          }

          // Tìm kiếm một phần của từ (partial matching)
          name.split(/\s+/).forEach((word) => {
            if (word.includes(term) || term.includes(word)) {
              score += 2;
            }
          });
        });

        return { product, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product);
  };

  // Xử lý sự thay đổi của input tìm kiếm
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const results = performSearch(value);
    setSearchResults(results.slice(0, 5));
    setShowResults(results.length > 0);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
    setShowResults(false);
    setIsFocused(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFocused(false);
        setShowResults(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  if (isMobile) {
    return (
      <div className="relative" ref={searchBoxRef}>
        <button
          onClick={() => {
            inputRef.current?.focus();
            setIsFocused(true);
          }}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Tìm kiếm"
        >
          <IoSearchOutline size={24} />
        </button>
        {isFocused && (
          <div className="fixed inset-0 bg-white z-50 overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-100 sticky top-0 bg-white shadow-sm z-10">
                <div className="flex items-center">
                  <div className="flex-1 relative">
                    <form onSubmit={handleSearchSubmit}>
                      <div className="relative">
                        <input
                          ref={inputRef}
                          type="text"
                          placeholder="Tìm kiếm sản phẩm..."
                          className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-10 outline-none focus:border-blue-500 transition-colors"
                          value={searchTerm}
                          onChange={handleSearchChange}
                          autoFocus
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <IoSearchOutline size={20} />
                        </span>
                        {searchTerm && (
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            onClick={clearSearch}
                          >
                            <IoCloseOutline size={20} />
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                  <button
                    className="ml-4 text-blue-600 font-medium py-2 px-3"
                    onClick={() => setIsFocused(false)}
                  >
                    Hủy
                  </button>
                </div>
              </div>
              <div
                ref={mobileContentRef}
                className="flex-1 overflow-y-auto pb-safe"
              >
                {searchTerm && showResults && searchResults.length > 0 && (
                  <div className="divide-y divide-gray-100">
                    {searchResults.map((product, index) => (
                      <Link
                        key={`${product.id}-${index}`}
                        href={`/san-pham/${product.slug}`}
                        className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 no-underline transition-colors"
                        onClick={() => {
                          setShowResults(false);
                          setIsFocused(false);
                        }}
                      >
                        <div className="w-16 h-16 flex-shrink-0 mr-4 bg-gray-50 rounded-md overflow-hidden border border-gray-100">
                          <img
                            src={
                              product.thumbnail
                                ? `${product.thumbnail}`
                                : "https://via.placeholder.com/40"
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 text-sm font-medium line-clamp-2 mb-1">
                            {product.name}
                          </p>
                          <p className="text-red-600 text-xs">
                            {product.discountPrice ? (
                              <>
                                <span className="font-medium">
                                  {product.discountPrice.toLocaleString()}₫
                                </span>
                                <span className="text-gray-500 line-through ml-2">
                                  {product.currentPrice?.toLocaleString()}₫
                                </span>
                              </>
                            ) : (
                              <span className="font-medium">
                                {product.currentPrice?.toLocaleString() ||
                                  "Liên hệ"}
                                ₫
                              </span>
                            )}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {searchTerm && showResults && searchResults.length === 0 && (
                  <div className="py-12 px-4 text-center text-gray-500">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <IoSearchOutline size={28} className="text-gray-400" />
                    </div>
                    <p className="text-base font-medium">
                      Không tìm thấy sản phẩm phù hợp
                    </p>
                    <p className="text-sm mt-2 text-gray-400">
                      Hãy thử từ khóa khác hoặc duyệt qua danh mục
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex-1 w-full" ref={searchBoxRef}>
      <div className="relative">
        <form onSubmit={handleSearchSubmit}>
          <div
            className={`relative flex items-center transition-all duration-200 ${
              isFocused ? "shadow-md" : ""
            }`}
          >
            <span className="absolute left-4 text-gray-400">
              <IoSearchOutline size={18} />
            </span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className={`border rounded-lg py-2.5 pl-10 pr-10 w-full text-sm transition-all duration-200 ${
                isFocused
                  ? "border-blue-500 outline-none"
                  : "border-gray-200 focus:outline-none"
              }`}
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
            />
            {searchTerm && (
              <button
                type="button"
                className="absolute right-4 text-gray-400 hover:text-gray-600"
                onClick={clearSearch}
                aria-label="Xóa tìm kiếm"
              >
                <IoCloseOutline size={20} />
              </button>
            )}
          </div>
        </form>
        {isFocused && searchTerm && showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg z-50 mt-2 max-h-[60vh] overflow-y-auto border border-gray-100">
            <div className="divide-y divide-gray-100">
              {searchResults.map((product, index) => (
                <Link
                  key={`${product.id}-${index}`}
                  href={`/san-pham/${product.slug}`}
                  className="flex items-center p-3 hover:bg-gray-50 no-underline"
                  onClick={() => {
                    setShowResults(false);
                    setIsFocused(false);
                  }}
                >
                  <div className="w-16 h-16 flex-shrink-0 mr-3 rounded-md border border-gray-100 overflow-hidden">
                    <img
                      src={
                        product.thumbnail
                          ? `${product.thumbnail}`
                          : "https://via.placeholder.com/40"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium line-clamp-2 mb-1">
                      {product.name}
                    </p>
                    <p className="text-red-600 text-sm mt-1">
                      {product.discountPrice ? (
                        <>
                          <span className="font-medium">
                            {product.discountPrice.toLocaleString()}₫
                          </span>
                          <span className="text-gray-500 line-through ml-2">
                            {product.currentPrice?.toLocaleString()}₫
                          </span>
                        </>
                      ) : (
                        <span className="font-medium">
                          {product.currentPrice?.toLocaleString() || "Liên hệ"}₫
                        </span>
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {isFocused &&
          searchTerm &&
          showResults &&
          searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg z-50 mt-2 border border-gray-100">
              <div className="py-6 px-4 text-center text-gray-500">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                  <IoSearchOutline size={24} className="text-gray-400" />
                </div>
                <p className="font-medium">Không tìm thấy sản phẩm phù hợp</p>
                <p className="text-sm mt-1 text-gray-400">
                  Hãy thử từ khóa khác
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default SearchComponent;
