"use client";

import { useState } from "react";
import {
  FaSun,
  FaMoon,
  FaDesktop,
  FaBell,
  FaEnvelope,
  FaMobile,
  FaCheckCircle,
  FaToggleOn,
  FaToggleOff,
  FaNewspaper,
} from "react-icons/fa";
import { IoSaveOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import PageHeader from "../../account/components/PageHeader";

// 📋 Interface cho theme options
type ThemeOption = "light" | "dark" | "system";
type LanguageOption = "vi" | "en";

// 📋 Interface cho cài đặt ứng dụng
interface AppSettingsData {
  theme: ThemeOption;
  language: LanguageOption;
  notifications: {
    email: boolean;
    push: boolean;
    orderUpdates: boolean;
    marketing: boolean;
  };
  subscriptions: {
    newsletter: boolean;
    promotions: boolean;
    specialOffers: boolean;
    birthdaySpecial: boolean;
  };
}

const AppSetting = () => {
  // 🔄 State quản lý cài đặt
  const [settings, setSettings] = useState<AppSettingsData>({
    theme: "light",
    language: "vi",
    notifications: {
      email: true,
      push: true,
      orderUpdates: true,
      marketing: false,
    },
    subscriptions: {
      newsletter: true,
      promotions: false,
      specialOffers: true,
      birthdaySpecial: true,
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  // 🛠️ Xử lý thay đổi theme
  const handleThemeChange = (theme: ThemeOption) => {
    setSettings({
      ...settings,
      theme
    });
  };

  // 🛠️ Xử lý thay đổi ngôn ngữ
  const handleLanguageChange = (language: LanguageOption) => {
    setSettings({
      ...settings,
      language
    });
  };

  // 🛠️ Xử lý thay đổi thông báo
  const handleNotificationChange = (field: keyof typeof settings.notifications) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [field]: !settings.notifications[field]
      }
    });
  };

  // 🛠️ Xử lý thay đổi đăng ký
  const handleSubscriptionChange = (field: keyof typeof settings.subscriptions) => {
    setSettings({
      ...settings,
      subscriptions: {
        ...settings.subscriptions,
        [field]: !settings.subscriptions[field]
      }
    });
  };

  // 🛠️ Xử lý lưu cài đặt
  const handleSaveSettings = () => {
    setIsSaving(true);

    // Giả lập lưu cài đặt
    setTimeout(() => {
      setIsSaving(false);

      toast.success(
        <div className="flex items-center gap-2">
          <div className="text-green-500 text-xl">✓</div>
          <div>
            <div className="font-medium">Cập nhật cài đặt thành công</div>
            <div className="text-xs text-gray-500">Các thay đổi của bạn đã được lưu</div>
          </div>
        </div>
      );

      // Áp dụng theme (trong ứng dụng thực, cần xử lý ở cấp ứng dụng)
      console.log('Saved settings:', settings);
    }, 800);
  };

  // 🧩 Component xử lý hiển thị nút tắt/bật
  const ToggleButton = ({ enabled, onClick, label }: { enabled: boolean; onClick: () => void; label: string }) => (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center text-2xl transition-colors ${enabled ? 'text-blue-600' : 'text-gray-400'}`}
        aria-label={enabled ? 'Bật' : 'Tắt'}
      >
        {enabled ? <FaToggleOn /> : <FaToggleOff />}
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Cài đặt ứng dụng"
        description="Tùy chỉnh giao diện và thông báo theo sở thích của bạn"
      />

      <div className="space-y-6">
        {/* Cài đặt giao diện */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-blue-600">
                <FaDesktop />
              </span>
              Cài đặt giao diện
            </h3>

            <div className="mb-5">
              <h4 className="text-sm font-medium mb-3 text-gray-700">Chủ đề (Theme)</h4>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleThemeChange("light")}
                  className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${settings.theme === "light"
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <FaSun className={`text-xl ${settings.theme === "light" ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="text-sm">Sáng</span>
                  {settings.theme === "light" && (
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mt-1">
                      <FaCheckCircle className="text-white text-xs" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange("dark")}
                  className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${settings.theme === "dark"
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <FaMoon className={`text-xl ${settings.theme === "dark" ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="text-sm">Tối</span>
                  {settings.theme === "dark" && (
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mt-1">
                      <FaCheckCircle className="text-white text-xs" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange("system")}
                  className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${settings.theme === "system"
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <FaDesktop className={`text-xl ${settings.theme === "system" ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="text-sm">Hệ thống</span>
                  {settings.theme === "system" && (
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mt-1">
                      <FaCheckCircle className="text-white text-xs" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">Ngôn ngữ</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleLanguageChange("vi")}
                  className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${settings.language === "vi"
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                    <span className="text-sm font-medium">🇻🇳</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Tiếng Việt</span>
                    <span className="text-xs text-gray-500">Vietnamese</span>
                  </div>
                  {settings.language === "vi" && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <FaCheckCircle className="text-white text-xs" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleLanguageChange("en")}
                  className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${settings.language === "en"
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                    <span className="text-sm font-medium">🇬🇧</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Tiếng Anh</span>
                    <span className="text-xs text-gray-500">English</span>
                  </div>
                  {settings.language === "en" && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <FaCheckCircle className="text-white text-xs" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cài đặt thông báo */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-blue-600">
                <FaBell />
              </span>
              Cài đặt thông báo
            </h3>

            <div className="space-y-1 pb-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaMobile className="text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Kênh thông báo</h4>
                  <p className="text-xs text-gray-500">Chọn cách bạn muốn nhận thông báo</p>
                </div>
              </div>

              <ToggleButton
                enabled={settings.notifications.email}
                onClick={() => handleNotificationChange('email')}
                label="Thông báo qua email"
              />

              <ToggleButton
                enabled={settings.notifications.push}
                onClick={() => handleNotificationChange('push')}
                label="Thông báo đẩy trên thiết bị"
              />
            </div>

            <div className="border-t border-gray-100 pt-4 mt-3 space-y-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaBell className="text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Loại thông báo</h4>
                  <p className="text-xs text-gray-500">Chọn những thông báo bạn muốn nhận</p>
                </div>
              </div>

              <ToggleButton
                enabled={settings.notifications.orderUpdates}
                onClick={() => handleNotificationChange('orderUpdates')}
                label="Cập nhật về đơn hàng"
              />

              <ToggleButton
                enabled={settings.notifications.marketing}
                onClick={() => handleNotificationChange('marketing')}
                label="Tin tức và khuyến mãi"
              />
            </div>
          </div>
        </div>

        {/* Đăng ký nhận tin */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-blue-600">
                <FaEnvelope />
              </span>
              Đăng ký nhận tin
            </h3>

            <div className="space-y-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaNewspaper className="text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Bản tin & Thông báo</h4>
                  <p className="text-xs text-gray-500">Nhận thông tin mới nhất qua email</p>
                </div>
              </div>

              <ToggleButton
                enabled={settings.subscriptions.newsletter}
                onClick={() => handleSubscriptionChange('newsletter')}
                label="Bản tin hàng tháng"
              />

              <ToggleButton
                enabled={settings.subscriptions.promotions}
                onClick={() => handleSubscriptionChange('promotions')}
                label="Thông báo khuyến mãi"
              />

              <ToggleButton
                enabled={settings.subscriptions.specialOffers}
                onClick={() => handleSubscriptionChange('specialOffers')}
                label="Ưu đãi đặc biệt"
              />

              <ToggleButton
                enabled={settings.subscriptions.birthdaySpecial}
                onClick={() => handleSubscriptionChange('birthdaySpecial')}
                label="Quà tặng sinh nhật"
              />
            </div>
          </div>
        </div>

        {/* Nút lưu cài đặt */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-2 shadow-sm hover:shadow focus:ring-4 focus:ring-blue-200 focus:outline-none"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <IoSaveOutline className="text-lg" />
                <span>Lưu cài đặt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppSetting;