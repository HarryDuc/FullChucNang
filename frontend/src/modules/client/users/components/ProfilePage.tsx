"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaArrowLeft, FaUser, FaKey } from "react-icons/fa";
import PageHeader from "@/modules/client/account/components/PageHeader";
import toast from "react-hot-toast";
import { useUser } from "@/modules/client/users/hooks/useUser";
import { useAuth } from "@/context/AuthContext";

interface UserProfileData {
  fullName: string;
  email: string;
  avatar: string;
  role: string;
  status: string;
}

interface PasswordData {
  current: string;
  new: string;
  confirm: string;
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const { isAuthenticated } = useAuth();
  const {
    user,
    updateUserInfo,
    changePassword,
    isLoading: userLoading,
    isUpdating,
    fetchUserInfo,
  } = useUser();

  // Dữ liệu view / edit
  const [profileData, setProfileData] = useState<UserProfileData>({
    fullName: "",
    email: "",
    avatar: "",
    role: "",
    status: "",
  });
  const [editData, setEditData] = useState<UserProfileData>(profileData);
  const [isEditing, setIsEditing] = useState(false);

  const [passwords, setPasswords] = useState<PasswordData>({
    current: "",
    new: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Add useEffect to fetch user data when component mounts and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserInfo();
    }
  }, [isAuthenticated, fetchUserInfo]);

  // Load user data when user object changes
  useEffect(() => {
    if (user) {
      const d: UserProfileData = {
        fullName: user.fullName || "",
        email: user.email || "",
        avatar: user.avatar || "",
        role: user.role || "",
        status: user.status || "",
      };
      setProfileData(d);
      setEditData(d);
    }
  }, [user]);

  // Hiển thị avatar: nếu có avatarUrl sẽ dùng hình ảnh, còn không sẽ dùng chữ cái đầu của tên
  const renderAvatar = () => {
    if (profileData.avatar) {
      return (
        <div className="w-24 h-24 rounded-full overflow-hidden">
          <Image
            src={profileData.avatar}
            alt="Avatar"
            width={96}
            height={96}
            className="object-cover"
          />
        </div>
      );
    } else {
      const initials = profileData.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      return (
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-500">
          {initials || <FaUser size={32} />}
        </div>
      );
    }
  }

  // Profile edit handlers
  const startEdit = () => {
    setErrors({});
    setEditData(profileData);
    setIsEditing(true);
  };
  const cancelEdit = () => {
    setErrors({});
    setEditData(profileData);
    setIsEditing(false);
  };
  const onChangeProfile = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { [k: string]: string } = {};
    if (!editData.fullName.trim()) errs.fullName = "Nhập họ tên";
    if (!editData.email.trim()) errs.email = "Nhập email";
    else if (!/\S+@\S+\.\S+/.test(editData.email))
      errs.email = "Email không hợp lệ";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    try {
      await updateUserInfo({
        fullName: editData.fullName,
        email: editData.email,
        avatar: editData.avatar,
        role: editData.role,
        status: editData.status,
      });
      setProfileData(editData);
      setIsEditing(false);
      toast.success("Cập nhật thành công");
    } catch (err: any) {
      toast.error(err.message || "Cập nhật thất bại");
    }
  };


  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      {/* <Link
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FaArrowLeft className="mr-2" /> Trang Chủ
      </Link> */}

      <PageHeader
        title="Cài đặt tài khoản"
        description="Quản lý thông tin cá nhân & bảo mật"
      />

      <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Tabs */}
        <nav className="flex flex-wrap">
          {[
            { k: "profile", l: "Thông tin cá nhân", i: <FaUser /> },
            // { k: "password", l: "Đổi mật khẩu", i: <FaKey /> },
          ].map((tab) => (
            <button
              key={tab.k}
              onClick={() => {
                setActiveTab(tab.k as any);
                setIsEditing(false);
                setErrors({});
              }}
              className={`
                flex-1 py-3 text-center flex items-center justify-center gap-2 border-b-2
                transition
                ${
                  activeTab === tab.k
                    ? "text-blue-600 border-blue-600 bg-blue-50"
                    : "text-gray-600 border-transparent hover:bg-gray-100"
                }
              `}
            >
              {tab.i}
              <span>{tab.l}</span>
            </button>
          ))}
        </nav>

        <div className="p-6">
          {userLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : activeTab === "profile" ? (
            <section>
              <div className="flex flex-col md:flex-row md:items-center md:gap-6 mb-6">
                {renderAvatar()}
                <div className="mt-4 md:mt-0 flex-1">
                  <h2 className="text-2xl font-semibold">
                    {profileData.fullName || "—"}
                  </h2>
                  <p className="text-gray-500 break-words">
                    {profileData.email || "—"}
                  </p>
                </div>
                {!isEditing && (
                  <button
                    onClick={startEdit}
                    className="self-start md:self-auto text-blue-600 hover:underline mt-4 md:mt-0"
                  >
                    Sửa
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={saveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { n: "fullName", l: "Họ và tên", t: "text" },
                      { n: "email", l: "Email", t: "email" },
                      { n: "avatar", l: "Avatar URL", t: "url" },
                      { n: "role", l: "Vai trò", t: "text", disabled: true },
                      {
                        n: "status",
                        l: "Trạng thái",
                        t: "text",
                        disabled: true,
                      },
                    ].map((f) => (
                      <div key={f.n}>
                        <label className="block text-sm font-medium mb-1">
                          {f.l}
                        </label>
                        <input
                          type={f.t}
                          name={f.n}
                          value={(editData as any)[f.n] || ""}
                          onChange={onChangeProfile}
                          disabled={f.disabled}
                          className={`block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[f.n] ? "border-red-500" : "border-gray-300"
                          } ${f.disabled ? "bg-gray-100" : ""}`}
                        />
                        {errors[f.n] && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors[f.n]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
                    >
                      Lưu
                    </button>
                  </div>
                </form>
              ) : (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Họ và tên
                    </dt>
                    <dd className="mt-1 break-words">
                      {profileData.fullName || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 break-words">
                      {profileData.email || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Vai trò
                    </dt>
                    <dd className="mt-1">{profileData.role || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Trạng thái
                    </dt>
                    <dd className="mt-1">{profileData.status || "—"}</dd>
                  </div>
                </dl>
              )}
            </section>
          ) : (
            <div className="flex justify-center py-16">
              Tính năng đang bảo trì
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
