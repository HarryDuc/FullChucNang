import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import metamaskService from "@/common/services/metamask.service";
import { toast } from "react-toastify";
import axios from "axios";

const MetamaskLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleMetamaskLogin = async () => {
    // Ngăn nhiều lần click nếu đang xử lý
    if (loading) {
      return;
    }

    if (!metamaskService.isMetaMaskInstalled()) {
      toast.error("Vui lòng cài đặt MetaMask để tiếp tục");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      setLoading(true);

      // Thử lại tối đa 2 lần nếu có lỗi
      let attempts = 0;
      const maxAttempts = 2;
      let lastError = null;

      while (attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`Attempt ${attempts} to authenticate with MetaMask...`);

          // Authenticate with MetaMask
          const result = await metamaskService.authenticate();

          // Use the login function from AuthContext which will set user and token internally
          login(result.token);

          // Nếu thành công, thoát khỏi vòng lặp
          break;
        } catch (error: any) {
          lastError = error;
          console.error(`Authentication attempt ${attempts} failed:`, error);

          // Nếu lỗi không phải là lỗi mạng hoặc lỗi timeout, không thử lại
          if (
            !axios.isAxiosError(error) ||
            (error.code !== "ECONNABORTED" &&
              (!error.response ||
                (error.response.status !== 408 &&
                  error.response.status !== 504)))
          ) {
            throw error;
          }

          // Chờ 1 giây trước khi thử lại
          if (attempts < maxAttempts) {
            toast.info(`Đang thử kết nối lại... (${attempts}/${maxAttempts})`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      // Nếu đã thử tất cả các lần và vẫn thất bại
      if (attempts === maxAttempts && lastError) {
        throw lastError;
      }

      // Redirect to home page
      toast.success("Đăng nhập thành công");
      router.push("/");
    } catch (error: any) {
      console.error("Error during MetaMask login:", error);

      // Handle MetaMask specific errors
      if (error.code) {
        switch (error.code) {
          case 4001:
            // User rejected the request
            toast.error("Bạn đã từ chối kết nối với MetaMask");
            break;
          case -32002:
            // MetaMask đang xử lý yêu cầu khác
            toast.info(
              "MetaMask đang xử lý yêu cầu. Vui lòng kiểm tra cửa sổ MetaMask."
            );
            break;
          case -32603:
            // Internal JSON-RPC error
            toast.error("Lỗi nội bộ từ MetaMask. Vui lòng thử lại sau.");
            break;
          default:
            toast.error(`Lỗi MetaMask: ${error.message || "Không xác định"}`);
            break;
        }
      } else if (axios.isAxiosError(error)) {
        // Lỗi từ API
        if (error.response) {
          // Có phản hồi từ server, nhưng là lỗi
          const errorData = error.response.data;
          const errorMessage =
            typeof errorData === "string"
              ? errorData
              : errorData?.message ||
                errorData?.error ||
                "Lỗi không xác định từ server";

          toast.error(`Lỗi kết nối: ${errorMessage}`);
        } else if (error.request) {
          // Không nhận được phản hồi từ server
          toast.error(
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
          );
        } else {
          toast.error(`Lỗi kết nối: ${error.message}`);
        }
      } else if (
        error.message &&
        error.message.includes("Invalid response format")
      ) {
        // Lỗi định dạng phản hồi từ server
        toast.error(
          "Lỗi định dạng dữ liệu từ server. Vui lòng liên hệ quản trị viên."
        );
        console.error("API response format error:", error.message);
      } else {
        // Lỗi khác
        toast.error(
          "Đăng nhập thất bại: " + (error.message || "Đã có lỗi xảy ra")
        );
      }
    } finally {
      // Thêm một chút delay trước khi reset trạng thái loading
      // để tránh người dùng nhấp quá nhanh
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <button
      onClick={handleMetamaskLogin}
      disabled={loading}
      className="w-full h-12 rounded-md font-semibold mt-4 flex items-center justify-center"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #F6851B",
        color: "#000000",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      <div className="flex items-center">
        {loading ? (
          <span className="mr-2 w-5 h-5 border-t-2 border-[#F6851B] rounded-full animate-spin"></span>
        ) : (
          <img
            src="/metamask-fox.svg"
            alt="MetaMask"
            className="w-6 h-6 mr-2"
          />
        )}
        <span>{loading ? "Đang xử lý..." : "Đăng nhập với MetaMask"}</span>
      </div>
    </button>
  );
};

export default MetamaskLogin;
