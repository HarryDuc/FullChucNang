import ClientLayout from "@/modules/client/common/layouts/ClientLayout";
import ResetPassword from "../../../../src/modules/auth/reset-password/ResetPassword";

export default function Page() {
  return (
      <ResetPassword />
  );
}

export const metadata = {
  title: "Đặt lại mật khẩu",
  description: "Đặt lại mật khẩu mới cho tài khoản của bạn",
};
