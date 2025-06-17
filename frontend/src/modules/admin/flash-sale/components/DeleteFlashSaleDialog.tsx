import React from "react";
import { useFlashSaleProducts } from "../hooks/useFlashSaleProducts";

interface DeleteFlashSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string | null;
  onDeleted: () => void;
}

export const DeleteFlashSaleDialog = ({
  open,
  onOpenChange,
  slug,
  onDeleted,
}: DeleteFlashSaleDialogProps) => {
  const { deleteProduct, loading } = useFlashSaleProducts();

  const handleDelete = async () => {
    if (!slug) return;

    try {
      await deleteProduct(slug);
      onDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Xác nhận xóa sản phẩm
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Bạn có chắc chắn muốn xóa sản phẩm này khỏi Flash Sale không? Hành
            động này không thể hoàn tác.
          </p>
        </div>

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
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {loading ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
};
