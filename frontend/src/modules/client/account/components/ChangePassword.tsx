"use client";

import { FaEye, FaEyeSlash, FaKey, FaLock, FaUnlock } from "react-icons/fa";
import { IoSaveOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { useState } from "react";

// 📋 Interface cho prop của form mật khẩu
interface ChangePasswordProps {
  passwords: {
    current: string;
    new: string;
    confirm: string;
  };
  showPassword: {
    current: boolean;
    new: boolean;
    confirm: boolean;
  };
  errors: {[key: string]: string};
  isSavingPassword: boolean;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangePassword: (e: React.FormEvent) => void;
  toggleShowPassword: (field: "current" | "new" | "confirm") => void;
}

// 🧩 Component Đổi mật khẩu
const ChangePassword = ({ 
  passwords, 
  showPassword, 
  errors, 
  isSavingPassword, 
  handlePasswordChange, 
  handleChangePassword, 
  toggleShowPassword 
}: ChangePasswordProps) => {
  // 🛠️ State để quản lý lỗi nội bộ
  const [localErrors, setLocalErrors] = useState<{[key: string]: string}>({});

  // 🛠️ Xử lý submit và validation
  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};

    // Kiểm tra mật khẩu hiện tại
    if (!passwords.current) {
      newErrors.current = "Vui lòng nhập mật khẩu hiện tại";
    }

    // Kiểm tra mật khẩu mới
    if (!passwords.new) {
      newErrors.new = "Vui lòng nhập mật khẩu mới";
    } else if (passwords.new.length < 6) {
      newErrors.new = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Kiểm tra xác nhận mật khẩu
    if (!passwords.confirm) {
      newErrors.confirm = "Vui lòng xác nhận mật khẩu mới";
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = "Xác nhận mật khẩu không khớp";
    }

    // Nếu có lỗi, hiển thị và dừng
    if (Object.keys(newErrors).length > 0) {
      setLocalErrors(newErrors);
      // Hiển thị toast thông báo với thông tin chi tiết hơn
      toast.error(
        <div className="flex items-center gap-2">
          <div className="text-red-500 text-xl">✕</div>
          <div>
            <div className="font-medium">Không thể đổi mật khẩu</div>
            <div className="text-xs text-gray-500">Vui lòng kiểm tra lại thông tin đã nhập</div>
          </div>
        </div>
      );
      return;
    }

    // Nếu không có lỗi, reset localErrors và tiếp tục xử lý
    setLocalErrors({});
    // Gọi hàm xử lý đổi mật khẩu từ props
    handleChangePassword(e);
  };

  // 🔍 Gộp errors từ props và localErrors
  const combinedErrors = { ...errors, ...localErrors };

  return (
    <form onSubmit={validateAndSubmit} className="animate-fadeIn">
      <div className="space-y-4">
        {/* Mật khẩu hiện tại */}
        <div>
          <label className="block text-sm text-gray-700 mb-1 font-medium">
            Mật khẩu hiện tại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <FaLock />
            </div>
            <input
              type={showPassword.current ? "text" : "password"}
              name="current"
              value={passwords.current}
              onChange={(e) => {
                handlePasswordChange(e);
                if (localErrors.current) {
                  setLocalErrors({...localErrors, current: ""});
                }
              }}
              className={`w-full pl-10 pr-12 py-2.5 border rounded-md text-sm transition-all ${
                combinedErrors.current 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-400 focus:ring-blue-100'
              } focus:ring-4 outline-none`}
              placeholder="Nhập mật khẩu hiện tại"
            />
            <button
              type="button"
              onClick={() => toggleShowPassword("current")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
            >
              {showPassword.current ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {combinedErrors.current && (
            <p className="text-red-500 text-xs mt-1">{combinedErrors.current}</p>
          )}
        </div>
        
        {/* Mật khẩu mới */}
        <div>
          <label className="block text-sm text-gray-700 mb-1 font-medium">
            Mật khẩu mới <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <FaKey />
            </div>
            <input
              type={showPassword.new ? "text" : "password"}
              name="new"
              value={passwords.new}
              onChange={(e) => {
                handlePasswordChange(e);
                if (localErrors.new) {
                  setLocalErrors({...localErrors, new: ""});
                }
              }}
              className={`w-full pl-10 pr-12 py-2.5 border rounded-md text-sm transition-all ${
                combinedErrors.new 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-400 focus:ring-blue-100'
              } focus:ring-4 outline-none`}
              placeholder="Nhập mật khẩu mới"
            />
            <button
              type="button"
              onClick={() => toggleShowPassword("new")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
            >
              {showPassword.new ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {combinedErrors.new && (
            <p className="text-red-500 text-xs mt-1">{combinedErrors.new}</p>
          )}
        </div>
        
        {/* Xác nhận mật khẩu mới */}
        <div>
          <label className="block text-sm text-gray-700 mb-1 font-medium">
            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <FaUnlock />
            </div>
            <input
              type={showPassword.confirm ? "text" : "password"}
              name="confirm"
              value={passwords.confirm}
              onChange={(e) => {
                handlePasswordChange(e);
                if (localErrors.confirm) {
                  setLocalErrors({...localErrors, confirm: ""});
                }
              }}
              className={`w-full pl-10 pr-12 py-2.5 border rounded-md text-sm transition-all ${
                combinedErrors.confirm 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-400 focus:ring-blue-100'
              } focus:ring-4 outline-none`}
              placeholder="Nhập lại mật khẩu mới"
            />
            <button
              type="button"
              onClick={() => toggleShowPassword("confirm")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
            >
              {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {combinedErrors.confirm && (
            <p className="text-red-500 text-xs mt-1">{combinedErrors.confirm}</p>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSavingPassword}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-2 shadow-sm hover:shadow focus:ring-4 focus:ring-blue-200 focus:outline-none"
        >
          {isSavingPassword ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <IoSaveOutline className="text-lg" />
              <span>Cập nhật mật khẩu</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ChangePassword; 