import ClientLayout from "@/modules/client/common/layouts/ClientLayout";
import ForgotPassword from "../../../../src/modules/auth/forgot-password/ForgotPassword";

export default function Page() {
  return (
      <ForgotPassword />
  );
}

export const metadata = {
  title: "Quên mật khẩu",
  description: "Đặt lại mật khẩu cho tài khoản của bạn",
};
