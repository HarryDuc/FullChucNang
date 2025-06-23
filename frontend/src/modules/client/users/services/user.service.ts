import { User, UserSettings } from "../models/user.model";

const BASE_API = process.env.NEXT_PUBLIC_API_URL!;
const AUTH_API = `${BASE_API}/auth`;
const IMAGE_UPLOAD_API = `${BASE_API}/images/upload`;

// 🔄 Hàm helper lấy token từ localStorage hoặc cookies
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;

  // Thử lấy từ localStorage
  let token = localStorage.getItem('token');

  // Nếu không có trong localStorage, thử lấy từ cookies
  if (!token) {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    if (tokenCookie) {
      token = tokenCookie.split('=')[1].trim();
    }
  }

  return token;
};

// 🔄 Hàm helper xử lý refresh token
const refreshToken = async () => {
  try {
    const refreshTokenValue = localStorage.getItem('refreshToken') || '';
    const response = await fetch(`${AUTH_API}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      return data.token;
    }
    return null;
  } catch (error) {
    console.error('Lỗi khi refresh token:', error);
    return null;
  }
};

// 🔄 Hàm helper xử lý phản hồi từ API
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    // Xử lý trường hợp token hết hạn
    if (response.status === 401 && errorData?.message?.includes('hết hạn')) {
      const newToken = await refreshToken();
      if (newToken) {
        // Thử lại request với token mới
        const retryResponse = await fetch(response.url, {
          ...response,
          headers: {
            ...response.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
        if (retryResponse.ok) {
          return retryResponse.json();
        }
      }
      // Nếu refresh token thất bại, xóa token và chuyển về trang đăng nhập
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    throw new Error(
      errorData?.message ||
      "Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau."
    );
  }
  return response.json();
};

// 🔄 Hàm helper tạo các options cho fetch
const fetchOptions = (method: string, data?: any) => {
  const token = getAuthToken();

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include', // Thêm option này để gửi cookies
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  return options;
};

// 📦 Service xử lý các thao tác với API người dùng
export const UserService = {
  // 📌 Lấy thông tin người dùng hiện tại
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await fetch(`${AUTH_API}/me`, fetchOptions('GET'));
      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      throw error;
    }
  },

  // 📌 Cập nhật thông tin người dùng
  updateUserInfo: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await fetch(`${AUTH_API}/update`, fetchOptions('PUT', userData));

      // Xử lý trường hợp lỗi từ API
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Lỗi khi cập nhật thông tin người dùng");
      }

      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
      throw error;
    }
  },

  // 📌 Thay đổi mật khẩu
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(
        `${AUTH_API}/change-password`,
        fetchOptions('POST', { currentPassword, newPassword })
      );

      // Xử lý trường hợp lỗi từ API
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Lỗi khi thay đổi mật khẩu");
      }

      return handleResponse(response);
    } catch (error) {
      console.error("Lỗi khi thay đổi mật khẩu:", error);
      throw error;
    }
  },

  // 📌 Upload avatar
  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // 📌 Lấy token từ localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const response = await fetch(IMAGE_UPLOAD_API, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const result = await handleResponse(response);
      if (!result.imageUrl) throw new Error("Không tìm thấy URL ảnh");

      return { url: result.imageUrl };
    } catch (error) {
      console.error("Lỗi khi upload avatar:", error);
      throw error;
    }
  },

  // // 📌 Lấy danh sách địa chỉ của người dùng
  // getUserAddresses: async (): Promise<UserAddress[]> => {
  //   try {
  //     const response = await fetch(`${USER_API}/addresses`, fetchOptions('GET'));
  //     return handleResponse(response);
  //   } catch (error) {
  //     console.error("Lỗi khi lấy danh sách địa chỉ:", error);
  //     throw error;
  //   }
  // },

  // 📌 Thêm địa chỉ mới
  // addAddress: async (address: Omit<UserAddress, 'id'>): Promise<UserAddress> => {
  //   try {
  //     const response = await fetch(`${USER_API}/addresses`, fetchOptions('POST', address));
  //     return handleResponse(response);
  //   } catch (error) {
  //     console.error("Lỗi khi thêm địa chỉ mới:", error);
  //     throw error;
  //   }
  // },

  // // 📌 Cập nhật địa chỉ
  // updateAddress: async (id: string, address: Partial<UserAddress>): Promise<UserAddress> => {
  //   try {
  //     const response = await fetch(
  //       `${USER_API}/addresses/${id}`,
  //       fetchOptions('PUT', address)
  //     );
  //     return handleResponse(response);
  //   } catch (error) {
  //     console.error(`Lỗi khi cập nhật địa chỉ ${id}:`, error);
  //     throw error;
  //   }
  // },

  // 📌 Xóa địa chỉ
  // deleteAddress: async (id: string): Promise<void> => {
  //   try {
  //     const response = await fetch(
  //       `${USER_API}/addresses/${id}`,
  //       fetchOptions('DELETE')
  //     );
  //     await handleResponse(response);
  //   } catch (error) {
  //     console.error(`Lỗi khi xóa địa chỉ ${id}:`, error);
  //     throw error;
  //   }
  // },

  // // 📌 Đặt địa chỉ mặc định
  // setDefaultAddress: async (id: string): Promise<UserAddress> => {
  //   try {
  //     const response = await fetch(
  //       `${USER_API}/addresses/${id}/default`,
  //       fetchOptions('PUT')
  //     );
  //     return handleResponse(response);
  //   } catch (error) {
  //     console.error(`Lỗi khi đặt địa chỉ ${id} làm mặc định:`, error);
  //     throw error;
  //   }
  // },

  // 📌 Lấy cài đặt người dùng
  getUserSettings: async (): Promise<UserSettings> => {
    try {
      // Lấy dữ liệu từ localStorage thay vì gọi API
      const storedSettings = localStorage.getItem('user-settings');

      // Nếu đã có dữ liệu, trả về dữ liệu đó
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }

      // Nếu chưa có, tạo cài đặt mặc định
      const defaultSettings: UserSettings = {
        id: 'local-settings',
        userId: typeof window !== 'undefined' && localStorage.getItem('userId') || 'guest',
        theme: 'light',
        language: 'vi',
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
      };

      // Lưu cài đặt mặc định vào localStorage
      localStorage.setItem('user-settings', JSON.stringify(defaultSettings));

      return defaultSettings;
    } catch (error) {
      console.error("Lỗi khi lấy cài đặt người dùng:", error);
      throw error;
    }
  },

  // 📌 Cập nhật cài đặt người dùng
  updateUserSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    try {
      // Lấy cài đặt hiện tại từ localStorage
      const storedSettings = localStorage.getItem('user-settings');
      let currentSettings: UserSettings;

      if (storedSettings) {
        currentSettings = JSON.parse(storedSettings);
      } else {
        // Nếu chưa có, khởi tạo mặc định
        currentSettings = await UserService.getUserSettings();
      }

      // Cập nhật cài đặt
      const updatedSettings: UserSettings = {
        ...currentSettings,
        ...settings,
        notifications: {
          ...currentSettings.notifications,
          ...(settings.notifications || {})
        },
        subscriptions: {
          ...currentSettings.subscriptions,
          ...(settings.subscriptions || {})
        }
      };

      // Lưu cài đặt mới vào localStorage
      localStorage.setItem('user-settings', JSON.stringify(updatedSettings));

      return updatedSettings;
    } catch (error) {
      console.error("Lỗi khi cập nhật cài đặt người dùng:", error);
      throw error;
    }
  },
};