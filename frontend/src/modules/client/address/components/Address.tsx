"use client";

import { useState, useEffect } from "react";
import { IoMdAdd, IoMdPin, IoMdHome, IoMdClose } from "react-icons/io";
import { FaPhone, FaMapMarkerAlt, FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";
import { useUser } from "@/modules/admin/users/hooks/useUser";
import PageHeader from "../../account/components/PageHeader";
import { UserAddress } from "../models/address.model";


// 🏷️ Loại modal
type ModalType = "add" | "edit" | null;

const Address = () => {
  // 🔄 State quản lý
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  // 🔄 Sử dụng hook useUser để lấy và cập nhật thông tin địa chỉ
  const {
    addresses: userAddresses,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress: removeAddress,
    setDefaultAddress,
    isLoading,
    isUpdating
  } = useUser();

  // 🔄 Cập nhật dữ liệu địa chỉ khi có thông tin từ API
  useEffect(() => {
    if (userAddresses && userAddresses.length > 0) {
      setAddresses(userAddresses);
    }
  }, [userAddresses]);

  // 🛠️ Xử lý khi component mount
  useEffect(() => {
    // Gọi API lấy danh sách địa chỉ
    fetchAddresses();
  }, [fetchAddresses]);

  // 🛠️ Các hàm xử lý
  const handleDeleteAddress = async (id: string) => {
    if (!id) {
      toast.error("ID địa chỉ không hợp lệ!");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này không?")) {
      try {

        const success = await removeAddress(id);
        if (success) {
          toast.success("Địa chỉ đã được xóa thành công!");
        }
      } catch (error) {
        console.error("Lỗi khi xóa địa chỉ:", error);
        toast.error("Có lỗi xảy ra khi xóa địa chỉ!");
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      if (!id) {
        toast.error("ID địa chỉ không hợp lệ!");
        return;
      }


      await setDefaultAddress(id);
      toast.success("Địa chỉ đã được đặt làm địa chỉ mặc định!");
    } catch (error) {
      console.error("Lỗi khi đặt địa chỉ mặc định:", error);
      toast.error("Có lỗi xảy ra khi đặt địa chỉ mặc định!");
    }
  };

  const handleEditAddress = (address: UserAddress) => {
    if (!address || !address.id) {
      toast.error("Không thể chỉnh sửa địa chỉ này!");
      return;
    }


    setEditingAddress(address);
    setModalType("edit");
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setModalType("add");
  };

  const handleCloseModal = () => {
    setModalType(null);
    setEditingAddress(null);
  };

  // 🛠️ State cho form địa chỉ mới
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    address: "",
    isDefault: false
  });

  // 🛠️ Cập nhật dữ liệu form khi chỉnh sửa
  useEffect(() => {
    if (editingAddress) {
      setFormData({
        name: editingAddress.name,
        phone: editingAddress.phone,
        province: editingAddress.province,
        district: editingAddress.district,
        ward: editingAddress.ward,
        address: editingAddress.address,
        isDefault: editingAddress.isDefault
      });
    } else {
      // Reset form khi thêm mới
      setFormData({
        name: "",
        phone: "",
        province: "",
        district: "",
        ward: "",
        address: "",
        isDefault: false
      });
    }
  }, [editingAddress]);

  // 🛠️ Xử lý thay đổi form
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 🛠️ Xử lý thay đổi checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      isDefault: e.target.checked
    }));
  };

  // 🛠️ Xử lý khi lưu địa chỉ mới hoặc cập nhật địa chỉ
  const handleSaveAddress = async () => {
    try {
      if (modalType === "add") {
        // Thêm địa chỉ mới

        await addAddress(formData);
        toast.success("Thêm địa chỉ mới thành công!");
      } else if (modalType === "edit" && editingAddress) {
        // Kiểm tra ID hợp lệ
        if (!editingAddress.id) {
          toast.error("ID địa chỉ không hợp lệ!");
          return;
        }

        // Cập nhật địa chỉ

        await updateAddress(editingAddress.id, formData);
        toast.success("Cập nhật địa chỉ thành công!");
      }

      // Đóng modal và làm mới danh sách
      setModalType(null);
      setEditingAddress(null);
      fetchAddresses();
    } catch (error) {
      console.error("Lỗi khi lưu địa chỉ:", error);
      toast.error(modalType === "add"
        ? "Có lỗi xảy ra khi thêm địa chỉ mới!"
        : "Có lỗi xảy ra khi cập nhật địa chỉ!");
    }
  };

  // 🔘 Nút Thêm địa chỉ
  const AddButton = () => (
    <button
      onClick={handleAddAddress}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
    >
      <IoMdAdd className="text-base" />
      <span>Thêm địa chỉ</span>
    </button>
  );

  // ⌛ Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center my-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Sổ địa chỉ"
        description="Quản lý địa chỉ giao hàng của bạn"
      />

      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-gray-700 text-sm mr-2">{addresses.length} địa chỉ</span>
        </div>
        <AddButton />
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white py-12 px-6 border border-gray-200 rounded-lg text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <IoMdPin className="text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có địa chỉ nào</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Thêm địa chỉ để thuận tiện cho việc giao hàng
          </p>
          <AddButton />
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="border border-gray-200 rounded-lg bg-white shadow-sm transition-all hover:shadow-md overflow-hidden"
            >
              <div className="flex flex-col">
                {/* Header */}
                <div className={`p-4 flex justify-between items-center border-b border-gray-100 ${address.isDefault ? "bg-blue-50" : ""
                  }`}>
                  <div className="flex items-center gap-2">
                    <IoMdHome className={`text-lg ${address.isDefault ? "text-blue-600" : "text-gray-500"}`} />
                    <span className="font-medium text-gray-900">{address.name}</span>
                  </div>

                  {address.isDefault && (
                    <div className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                      <FaCheck className="text-xs" />
                      <span>Mặc định</span>
                    </div>
                  )}
                </div>

                {/* Nội dung */}
                <div className="p-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <FaPhone className="text-gray-400 mt-1 flex-shrink-0" />
                      <span>{address.phone}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                      <span>{address.address}, {address.ward}, {address.district}, {address.province}</span>
                    </div>
                  </div>
                </div>

                {/* Hành động */}
                <div className="p-4 border-t border-gray-100 flex flex-wrap justify-between items-center bg-gray-50">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Xóa
                    </button>
                  </div>

                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Đặt làm mặc định
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">
                {modalType === "add" ? "Thêm địa chỉ mới" : "Chỉnh sửa địa chỉ"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <IoMdClose className="text-xl" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              <form className="space-y-3">
                {/* Họ tên */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Họ tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Họ tên người nhận"
                  />
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Số điện thoại liên hệ"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Tỉnh/Thành phố */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Chọn tỉnh/thành</option>
                      <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                    </select>
                  </div>

                  {/* Quận/Huyện */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Chọn quận/huyện</option>
                      <option value="Quận 1">Quận 1</option>
                      <option value="Quận Ba Đình">Quận Ba Đình</option>
                    </select>
                  </div>
                </div>

                {/* Phường/Xã */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Phường/Xã <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="ward"
                    value={formData.ward}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Chọn phường/xã</option>
                    <option value="Phường Bến Nghé">Phường Bến Nghé</option>
                    <option value="Phường Điện Biên">Phường Điện Biên</option>
                  </select>
                </div>

                {/* Địa chỉ cụ thể */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Số nhà, tên đường, tòa nhà,..."
                  />
                </div>

                {/* Địa chỉ mặc định */}
                <div className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>
              </form>

              {/* Footer */}
              <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveAddress}
                  disabled={isUpdating}
                  className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {isUpdating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>{modalType === "add" ? "Thêm" : "Lưu"}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Address;