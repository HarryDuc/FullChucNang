import axios, { AxiosResponse } from "axios";

// 🌐 Lấy API URL từ môi trường
import { config } from "@/config/config";
import { API_URL_CLIENT } from "@/config/apiRoutes";

const API_URL = API_URL_CLIENT + config.ROUTES.AUTH.BASE;

// =====================
// 📦 Kiểu dữ liệu chuẩn
// =====================
export interface AuthResponse {
  message: string;
  token: string;
  user?: {
    email: string;
    role: string;
    fullName?: string;
    avatar?: string;
  };
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatar?: string;
  role: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

interface EmailCheckResponse {
  isValid: boolean;
  googleId?: string;
}

// 🔥 Type lỗi chuẩn từ Axios
interface CustomAxiosError extends Error {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  request?: unknown;
  message: string;
}

// =====================
// 🚀 API: Đăng ký
// =====================
export const registerAPI = async (
  email: string,
  password: string,
  fullName: string
): Promise<AuthResponse> => {
  try {
    const response: AxiosResponse<AuthResponse> = await axios.post(
      `${API_URL}/register`,
      { email, password, fullName },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: false,
      }
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as CustomAxiosError;
    handleAPIError(err, "đăng ký");
    throw err;
  }
};

// =====================
// 🔍 API: Kiểm tra email
// =====================
export const checkEmailAPI = async (
  email: string
): Promise<EmailCheckResponse> => {
  try {
    const response: AxiosResponse<EmailCheckResponse> = await axios.get(
      `${API_URL}/check-email`,
      { params: { email } }
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as CustomAxiosError;
    if (
      err.response &&
      err.response.status === 400 &&
      err.response.data?.message
    ) {
      throw new Error(err.response.data.message);
    }
    handleAPIError(err, "kiểm tra email");
    throw new Error("Lỗi không xác định khi kiểm tra email.");
  }
};

// =====================
// 🔐 API: Đăng nhập
// =====================
export const loginAPI = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response: AxiosResponse<AuthResponse> = await axios.post(
      `${API_URL}/login`,
      { email, password },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: false,
      }
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as CustomAxiosError;
    handleAPIError(err, "đăng nhập");
    throw err;
  }
};

// =====================
// 🧠 API: Lấy user từ token
// =====================
export const fetchUserByToken = async (token: string): Promise<User> => {
  try {
    const response: AxiosResponse<User> = await axios.get(
      `${API_URL}/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as CustomAxiosError;
    handleAPIError(err, "lấy thông tin người dùng");
    throw err;
  }
};

// =====================
// 🚪 API: Đăng xuất
// =====================
export const logoutAPI = async (): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ message: string }> = await axios.post(
      `${API_URL}/logout`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: false,
      }
    );

    localStorage.removeItem("token");
    window.location.href = "/";
    return response.data;
  } catch (error: unknown) {
    const err = error as CustomAxiosError;
    handleAPIError(err, "đăng xuất");
    throw err;
  }
};

// =====================
// 🔑 API: Yêu cầu đặt lại mật khẩu
// =====================
export const requestPasswordResetAPI = async (
  email: string,
  resetMethod: 'link' | 'otp'
): Promise<PasswordResetResponse> => {
  try {
    const response: AxiosResponse<PasswordResetResponse> = await axios.post(
      `${API_URL}/request-password-reset`,
      { email, resetMethod },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as CustomAxiosError;
    handleAPIError(err, "yêu cầu đặt lại mật khẩu");
    throw err;
  }
};

// =====================
// ✅ API: Xác thực OTP
// =====================
export const verifyOtpAPI = async (
  email: string,
  otp: string
): Promise<PasswordResetResponse> => {
  try {
    const response: AxiosResponse<PasswordResetResponse> = await axios.post(
      `${API_URL}/verify-otp`,
      { email, otp },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as CustomAxiosError;
    handleAPIError(err, "xác thực OTP");
    throw err;
  }
};

// =====================
// 🔄 API: Đặt lại mật khẩu với token
// =====================
export const resetPasswordWithTokenAPI = async (
  token: string,
  newPassword: string
): Promise<PasswordResetResponse> => {
  try {
    const response: AxiosResponse<PasswordResetResponse> = await axios.post(
      `${API_URL}/reset-password/token`,
      { token, newPassword },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as CustomAxiosError;
    handleAPIError(err, "đặt lại mật khẩu");
    throw err;
  }
};

// =====================
// 🔄 API: Đặt lại mật khẩu với OTP
// =====================
export const resetPasswordWithOtpAPI = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<PasswordResetResponse> => {
  try {
    const response: AxiosResponse<PasswordResetResponse> = await axios.post(
      `${API_URL}/reset-password/otp`,
      { email, otp, newPassword },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as CustomAxiosError;
    handleAPIError(err, "đặt lại mật khẩu");
    throw err;
  }
};

// =====================
// 🔐 API: Đăng nhập bằng Google
// =====================
export const initiateGoogleLogin = () => {
  // Chuyển hướng người dùng đến endpoint Google auth của backend
  window.location.href = `${API_URL}/google`;
};

// =====================
// 🔄 API: Xử lý callback từ Google
// =====================
export const handleGoogleCallback = async (token: string): Promise<AuthResponse> => {
  try {
    // Verify token với backend
    const response = await axios.get(`${API_URL}/verify-token`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return {
      message: "Đăng nhập Google thành công",
      token,
      user: response.data.user
    };
  } catch (error: unknown) {
    const err = error as CustomAxiosError;
    handleAPIError(err, "xác thực token Google");
    throw err;
  }
};

// =====================
// 🛠️ Hàm xử lý lỗi
// =====================
const handleAPIError = (error: CustomAxiosError, action: string) => {
  if (error.response) {
    console.error(`❌ Lỗi từ server khi ${action}:`, error.response.data);
    alert(
      `Lỗi từ server khi ${action}: ${error.response.data?.message || "Không xác định"
      }`
    );
  } else if (error.request) {
    console.error(`❌ Lỗi mạng hoặc CORS khi ${action}:`, error.message);
    alert(`Lỗi mạng hoặc CORS khi ${action}. Vui lòng kiểm tra kết nối mạng.`);
  } else {
    console.error(`❌ Lỗi không xác định khi ${action}:`, error.message);
    alert(`Lỗi không xác định khi ${action}. Vui lòng thử lại sau.`);
  }
};
