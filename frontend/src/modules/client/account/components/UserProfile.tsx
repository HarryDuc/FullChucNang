"use client";

import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaVenusMars, FaMale, FaFemale, FaQuestion } from "react-icons/fa";
import { IoSaveOutline } from "react-icons/io5";
import toast from "react-hot-toast";

// 📋 Interface cho dữ liệu người dùng
interface UserData {
  fullName: string;
  email: string;
  phone: string;
  birthday: string | null;
  gender: "male" | "female" | "other" | null;
}

// 📋 Interface cho prop của UserProfile
interface UserProfileProps {
  userData: UserData;
  errors: {[key: string]: string};
  isSavingProfile: boolean;
  handleProfileChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSaveProfile: (e: React.FormEvent) => void;
  onSaveSuccess?: () => void; // Callback khi lưu thành công
  onSaveError?: (error: string) => void; // Callback khi lưu lỗi
}

// 🧩 Component Thông tin cá nhân
const UserProfile = ({ 
  userData, 
  errors, 
  isSavingProfile, 
  handleProfileChange, 
  handleSaveProfile: originalHandleSaveProfile,
  onSaveSuccess,
  onSaveError
}: UserProfileProps) => {
  // Chọn icon giới tính dựa trên giá trị đã chọn
  const renderGenderIcon = () => {
    switch (userData.gender) {
      case 'male':
        return <FaMale className="text-blue-500" />;
      case 'female':
        return <FaFemale className="text-pink-500" />;
      case 'other':
        return <FaQuestion className="text-purple-500" />;
      default:
        return <FaVenusMars className="text-gray-500" />;
    }
  };

  // Xử lý sự kiện submit form và hiển thị toast
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Kiểm tra lỗi trước khi submit
      if (Object.keys(errors).length > 0) {
        // Hiển thị toast thông báo lỗi
        toast.error("Vui lòng sửa các lỗi trước khi lưu thông tin");
        return;
      }
      
      await originalHandleSaveProfile(e);
      
      // Chỉ hiển thị toast thành công khi không có callback onSaveSuccess
      if (!onSaveSuccess) {
        toast.success("Cập nhật thông tin cá nhân thành công");
      } else {
        // Gọi callback nếu có
        onSaveSuccess();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật thông tin";
      
      // Chỉ hiển thị toast lỗi khi không có callback onSaveError
      if (!onSaveError) {
        toast.error(errorMessage);
      } else {
        // Gọi callback nếu có
        onSaveError(errorMessage);
      }
    }
  };

  return (
    <form onSubmit={handleSaveProfile} className="animate-fadeIn">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Họ tên */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm text-gray-700 mb-1 font-medium">
            Họ tên <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <FaUser />
            </div>
            <input
              type="text"
              name="fullName"
              value={userData.fullName}
              onChange={handleProfileChange}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-md text-sm transition-all ${
                errors.fullName 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-400 focus:ring-blue-100'
              } focus:ring-4 outline-none`}
              placeholder="Họ và tên của bạn"
            />
          </div>
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
          )}
        </div>
        
        {/* Email */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm text-gray-700 mb-1 font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <FaEnvelope />
            </div>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleProfileChange}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-md text-sm transition-all ${
                errors.email 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-400 focus:ring-blue-100'
              } focus:ring-4 outline-none`}
              placeholder="Email của bạn"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        
        {/* Số điện thoại */}
        <div>
          <label className="block text-sm text-gray-700 mb-1 font-medium">
            Số điện thoại
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <FaPhone />
            </div>
            <input
              type="tel"
              name="phone"
              value={userData.phone}
              onChange={handleProfileChange}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-md text-sm transition-all ${
                errors.phone 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-400 focus:ring-blue-100'
              } focus:ring-4 outline-none`}
              placeholder="Số điện thoại của bạn"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>
        
        {/* Ngày sinh */}
        <div>
          <label className="block text-sm text-gray-700 mb-1 font-medium">
            Ngày sinh
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <FaCalendarAlt />
            </div>
            <input
              type="date"
              name="birthday"
              value={userData.birthday || ""}
              onChange={handleProfileChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-sm transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>
        
        {/* Giới tính */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm text-gray-700 mb-1 font-medium">
            Giới tính
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {renderGenderIcon()}
            </div>
            <select
              name="gender"
              value={userData.gender || ""}
              onChange={handleProfileChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-sm transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none appearance-none bg-white"
            >
              {!userData.gender && <option value="">Chọn giới tính</option>}
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSavingProfile}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-2 shadow-sm hover:shadow focus:ring-4 focus:ring-blue-200 focus:outline-none"
        >
          {isSavingProfile ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <IoSaveOutline className="text-lg" />
              <span>Lưu thay đổi</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default UserProfile; 