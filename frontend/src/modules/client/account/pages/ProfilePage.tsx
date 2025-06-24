"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import UserProfile from "../components/UserProfile";
import WalletManagement from "../components/WalletManagement";
import { useAccount } from "../hooks/useAccount";
import { User } from "../models/account.model";

// Make sure this matches the interface in the UserProfile component
interface UserData {
  fullName: string;
  email: string;
  phone: string;
  birthday: string | null;
  gender: "male" | "female" | "other" | null;
}

const ProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { user, updateUserInfo, isLoading, isUpdating } = useAccount();

  // User profile state
  const [userData, setUserData] = useState<UserData>({
    fullName: "",
    email: "",
    phone: "",
    birthday: null,
    gender: null,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState("profile");

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setUserData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        birthday: user.birthday || null,
        gender: (user.gender as "male" | "female" | "other" | null) || null,
      });
    }
  }, [user]);

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Handle profile changes
  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Special handling for gender to ensure it's the correct type
    if (name === "gender") {
      setUserData((prevData) => ({
        ...prevData,
        [name]: value === "" ? null : (value as "male" | "female" | "other"),
      }));
    } else {
      setUserData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!userData.fullName.trim()) {
      newErrors.fullName = "Họ tên không được để trống";
    }

    if (!userData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (userData.phone && !/^[0-9]{10,11}$/.test(userData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (cần 10-11 số)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Convert UserData to User by adding required fields
      const userToUpdate: User = {
        id: user?.id,
        email: userData.email,
        role: user?.role || "user",
        status: user?.status || "active",
        fullName: userData.fullName,
        phone: userData.phone,
        // Convert null to undefined for compatibility with User type
        birthday: userData.birthday || undefined,
        gender: userData.gender || undefined,
      };

      await updateUserInfo(userToUpdate);
      toast.success("Cập nhật thông tin cá nhân thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center my-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { key: "profile", label: "Thông tin cá nhân" },
    { key: "wallets", label: "Ví MetaMask" },
    { key: "settings", label: "Cài đặt" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Tài khoản của tôi
      </h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === "profile" && (
          <div className="p-6">
            <UserProfile
              userData={userData}
              errors={errors}
              isSavingProfile={isUpdating}
              handleProfileChange={handleProfileChange}
              handleSaveProfile={handleSaveProfile}
            />
          </div>
        )}

        {activeTab === "wallets" && (
          <div className="p-6">
            <WalletManagement />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="p-6">
            <p className="text-gray-600">
              Cài đặt tài khoản sẽ được phát triển trong tương lai.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
