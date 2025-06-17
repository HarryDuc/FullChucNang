"use client";

import { useState, useEffect } from "react";
import { FaKey, FaUser } from "react-icons/fa";
import toast from "react-hot-toast";
import { useUser } from "@/modules/admin/users/hooks/useUser";
import PageHeader from "./PageHeader";
import UserProfile from "./UserProfile";
import ChangePassword from "./ChangePassword";

// 📋 Interface cho thông tin cá nhân người dùng
interface UserProfileData {
  fullName: string;
  email: string;
  phone: string;
  birthday: string | null;
  gender: "male" | "female" | "other" | null;
}

// 📋 Interface cho thông tin mật khẩu
interface PasswordData {
  current: string;
  new: string;
  confirm: string;
}

// 🎯 Component chính
const AccountSettings = () => {
  // 🔄 State quản lý tab đang chọn
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // 🔄 Sử dụng hook useUser để lấy và cập nhật thông tin người dùng
  const { user, updateUserInfo, changePassword, isLoading: userLoading, isUpdating } = useUser();

  // 🔄 State quản lý thông tin tài khoản
  const [userData, setUserData] = useState<UserProfileData>({
    fullName: "",
    email: "",
    phone: "",
    birthday: null,
    gender: null,
  });

  // 🔄 State quản lý mật khẩu
  const [passwords, setPasswords] = useState<PasswordData>({
    current: "",
    new: "",
    confirm: "",
  });

  // 🔄 State quản lý giao diện
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 🔄 Cập nhật dữ liệu người dùng khi có thông tin từ API
  useEffect(() => {
    if (user) {
      setUserData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        birthday: user.birthday || null,
        gender: user.gender as "male" | "female" | "other" | null,
      });
    }
  }, [user]);

  // 🛠️ Xử lý thay đổi thông tin tài khoản
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });

    // Xóa lỗi khi người dùng sửa trường
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // 🛠️ Xử lý thay đổi mật khẩu
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords({
      ...passwords,
      [name]: value,
    });

    // Xóa lỗi khi người dùng sửa trường
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // 🛠️ Xử lý lưu thông tin tài khoản
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    // Kiểm tra Họ tên
    if (!userData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    }

    // Kiểm tra Email
    if (!userData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Kiểm tra Số điện thoại
    if (userData.phone && !/^[0-9]{10,11}$/.test(userData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    // Nếu có lỗi, hiển thị và dừng
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Gọi API cập nhật thông tin người dùng
      await updateUserInfo({
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        birthday: userData.birthday || undefined,
        gender: userData.gender || undefined,
      });
    } catch (error: any) {
      // Hiển thị thông báo lỗi chi tiết
      const errorMessage = error.message || "Có lỗi xảy ra khi cập nhật thông tin";
      throw new Error(errorMessage);
    }
  };

  // 🛠️ Xử lý đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

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
    if (passwords.new !== passwords.confirm) {
      newErrors.confirm = "Xác nhận mật khẩu không khớp";
    }

    // Nếu có lỗi, hiển thị và dừng
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Gọi API đổi mật khẩu
      await changePassword(passwords.current, passwords.new);

      // Chỉ reset form khi đổi mật khẩu thành công
      setPasswords({
        current: "",
        new: "",
        confirm: "",
      });
    } catch (error: any) {
      // Hiển thị thông báo lỗi chi tiết
      const errorMessage = error.message || "Có lỗi xảy ra khi đổi mật khẩu";

      // Không reset form khi có lỗi, giữ nguyên thông tin để người dùng chỉnh sửa
      throw new Error(errorMessage);
    }
  };

  // 🛠️ Xử lý hiển thị/ẩn mật khẩu
  const toggleShowPassword = (field: keyof typeof showPassword) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  // 📣 Xử lý hiển thị thông báo lưu thành công
  const handleProfileSaveSuccess = () => {
    toast.success(
      <div className="flex items-center gap-2">
        <div className="text-green-500 text-xl">✓</div>
        <div>
          <div className="font-medium">Cập nhật thông tin thành công</div>
          <div className="text-xs text-gray-500">Thông tin cá nhân của bạn đã được lưu</div>
        </div>
      </div>
    );
  };

  // 📣 Xử lý hiển thị thông báo lỗi
  const handleProfileSaveError = (errorMessage: string) => {
    toast.error(
      <div className="flex items-center gap-2">
        <div className="text-red-500 text-xl">✕</div>
        <div>
          <div className="font-medium">Không thể cập nhật thông tin</div>
          <div className="text-xs text-gray-500">{errorMessage}</div>
        </div>
      </div>
    );
  };

  // 📣 Xử lý hiển thị thông báo đổi mật khẩu thành công
  const handlePasswordChangeSuccess = () => {
    toast.success(
      <div className="flex items-center gap-2">
        <div className="text-green-500 text-xl">✓</div>
        <div>
          <div className="font-medium">Đổi mật khẩu thành công</div>
          <div className="text-xs text-gray-500">Mật khẩu của bạn đã được cập nhật</div>
        </div>
      </div>
    );

    // Reset form mật khẩu
    setPasswords({
      current: "",
      new: "",
      confirm: "",
    });
  };

  // 📣 Xử lý hiển thị thông báo lỗi đổi mật khẩu
  const handlePasswordChangeError = (errorMessage: string) => {
    toast.error(
      <div className="flex items-center gap-2">
        <div className="text-red-500 text-xl">✕</div>
        <div>
          <div className="font-medium">Không thể đổi mật khẩu</div>
          <div className="text-xs text-gray-500">{errorMessage}</div>
        </div>
      </div>
    );

    // Không reset form khi có lỗi, để người dùng có thể chỉnh sửa và thử lại
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Cài đặt tài khoản"
        description="Quản lý thông tin cá nhân và bảo mật tài khoản"
      />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Tab điều hướng */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${activeTab === 'profile'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <FaUser className={activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'} />
            <span>Thông tin cá nhân</span>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${activeTab === 'password'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <FaKey className={activeTab === 'password' ? 'text-blue-600' : 'text-gray-500'} />
            <span>Đổi mật khẩu</span>
          </button>
        </div>

        {/* Nội dung tab */}
        <div className="p-6">
          {/* Loading state */}
          {userLoading && (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Tab thông tin cá nhân */}
          {!userLoading && activeTab === 'profile' && (
            <UserProfile
              userData={userData}
              errors={errors}
              isSavingProfile={isUpdating}
              handleProfileChange={handleProfileChange}
              handleSaveProfile={handleSaveProfile}
              onSaveSuccess={handleProfileSaveSuccess}
              onSaveError={handleProfileSaveError}
            />
          )}

          {/* Tab đổi mật khẩu */}
          {!userLoading && activeTab === 'password' && (
            <ChangePassword
              passwords={passwords}
              showPassword={showPassword}
              errors={errors}
              isSavingPassword={isUpdating}
              handlePasswordChange={handlePasswordChange}
              handleChangePassword={(e) => {
                // Kiểm tra thông tin trước khi submit
                e.preventDefault();
                const newErrors: { [key: string]: string } = {};

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
                if (passwords.new !== passwords.confirm) {
                  newErrors.confirm = "Xác nhận mật khẩu không khớp";
                }

                // Nếu có lỗi, hiển thị và dừng
                if (Object.keys(newErrors).length > 0) {
                  setErrors(newErrors);
                  return;
                }

                // Nếu không có lỗi, tiến hành đổi mật khẩu
                handleChangePassword(e)
                  .then(handlePasswordChangeSuccess)
                  .catch(error => handlePasswordChangeError(error.message));
              }}
              toggleShowPassword={toggleShowPassword}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;