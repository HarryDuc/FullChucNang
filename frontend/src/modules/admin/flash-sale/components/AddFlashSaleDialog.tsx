import React, { useEffect, useState } from "react";
import { useFlashSaleProducts } from "../hooks/useFlashSaleProducts";
import { ProductService } from "../../products/services/product.service";
import { Product } from "../../products/models/types";
import { ProductSelectionList } from "./ProductSelectionList";

interface AddFlashSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}

export const AddFlashSaleDialog = ({
  open,
  onOpenChange,
  onAdded,
}: AddFlashSaleDialogProps) => {
  const { createProduct } = useFlashSaleProducts();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState<string>("");
  const [formErrors, setFormErrors] = useState({
    products: "",
    discountPercentage: "",
  });

  // Fetch danh sách sản phẩm khi mở dialog
  useEffect(() => {
    if (open) {
      fetchProducts();
    } else {
      // Reset state khi đóng dialog
      setSelectedProducts([]);
      setDiscountPercentage("");
      setError(null);
      setFormErrors({
        products: "",
        discountPercentage: "",
      });
    }
  }, [open]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await ProductService.getAll();
      // Lọc ra những sản phẩm không thuộc flash-sale
      const nonFlashSaleProducts = result.data.filter(
        (product) => product.category?.main !== "flash-sale"
      );
      setProducts(nonFlashSaleProducts);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      setError("Không thể lấy danh sách sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {
      products: "",
      discountPercentage: "",
    };
    let isValid = true;

    if (selectedProducts.length === 0) {
      errors.products = "Vui lòng chọn ít nhất một sản phẩm";
      isValid = false;
    }

    if (!discountPercentage) {
      errors.discountPercentage = "Vui lòng nhập phần trăm giảm giá";
      isValid = false;
    } else {
      const percentage = Number(discountPercentage);
      if (isNaN(percentage) || percentage <= 0 || percentage >= 100) {
        errors.discountPercentage = "Phần trăm giảm giá phải từ 1-99";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProducts((prev) => {
      const exists = prev.some((p) => p.slug === product.slug);
      if (exists) {
        return prev.filter((p) => p.slug !== product.slug);
      } else {
        return [...prev, product];
      }
    });
    // Clear error when user selects products
    if (formErrors.products) {
      setFormErrors((prev) => ({
        ...prev,
        products: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const percentage = Number(discountPercentage) / 100;

      // Tạo tất cả sản phẩm flash sale
      const promises = selectedProducts.map((product) => {
        const discountPrice = Math.round(product.price * (1 - percentage));
        const flashSaleProduct = {
          ...product,
          discountPrice,
          category: {
            ...(product.category || {}),
            main: "flash-sale",
            sub: product.category?.sub || [],
            tags: product.category?.tags || [],
          },
        };
        return createProduct(flashSaleProduct);
      });

      await Promise.all(promises);
      onAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm vào flash sale:", error);
      setError(
        "Không thể thêm sản phẩm vào flash sale. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Thêm sản phẩm vào Flash Sale
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Chọn sản phẩm và nhập phần trăm giảm giá để thêm vào Flash Sale
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn sản phẩm ({selectedProducts.length} đã chọn)
            </label>
            <ProductSelectionList
              products={products}
              selectedProducts={selectedProducts}
              onSelect={handleProductSelect}
              loading={loading}
            />
            {formErrors.products && (
              <p className="mt-1 text-sm text-red-600">{formErrors.products}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="discountPercentage"
              className="block text-sm font-medium text-gray-700"
            >
              Phần trăm giảm giá (%)
            </label>
            <input
              type="number"
              id="discountPercentage"
              value={discountPercentage}
              onChange={(e) => {
                setDiscountPercentage(e.target.value);
                if (formErrors.discountPercentage) {
                  setFormErrors((prev) => ({
                    ...prev,
                    discountPercentage: "",
                  }));
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Nhập phần trăm giảm giá (1-99)"
              min="1"
              max="99"
            />
            {formErrors.discountPercentage && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.discountPercentage}
              </p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Đang thêm..." : "Thêm vào Flash Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
