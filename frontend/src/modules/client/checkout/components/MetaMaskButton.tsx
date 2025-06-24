import React, { useState, useEffect } from "react";
import metamaskPaymentService from "../services/metamaskService";
import { toast } from "react-toastify";

interface MetaMaskButtonProps {
  amount: number;
  orderSlug: string;
  onSuccess: (transactionHash: string) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

// Địa chỉ ví cửa hàng nhận tiền - có thể chuyển thành config
const SHOP_WALLET_ADDRESS = "0x867Ab1D4c125C9126D6C29904A0E61Ba0cdF3ad4";

const MetaMaskButton: React.FC<MetaMaskButtonProps> = ({
  amount,
  orderSlug,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Kiểm tra MetaMask đã được cài đặt chưa
  useEffect(() => {
    const checkMetaMask = () => {
      if (!metamaskPaymentService.isMetaMaskInstalled()) {
        setError(
          "MetaMask chưa được cài đặt. Vui lòng cài đặt tiện ích MetaMask trước."
        );
      }
    };

    checkMetaMask();
  }, []);

  // Xử lý thanh toán qua MetaMask
  const handleMetaMaskPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Kết nối với ví MetaMask
      const address = await metamaskPaymentService.connectWallet();
      setWalletAddress(address);
      console.log("Đã kết nối với ví:", address);

      // 2. Chuyển đổi số tiền sang BNB (giả định 1 USD = 0.0033 BNB và 1 VND = 0.000042 USD)
      // Trong thực tế, bạn sẽ cần API chuyển đổi tỷ giá
      const VND_TO_USD = 0.000038; // 1 VND = 0.000042 USD (xấp xỉ)
      const USD_TO_BNB = 0.0015; // 1 USD = 0.0033 BNB (xấp xỉ)
      const exchangeRate = VND_TO_USD * USD_TO_BNB;

      // Đảm bảo số tiền tối thiểu là 0.001 BNB để tránh giao dịch quá nhỏ
      let amountInBNB = (amount * exchangeRate).toFixed(6);
      const minAmountInBNB = 0.001;

      if (parseFloat(amountInBNB) < minAmountInBNB) {
        console.log(
          `Điều chỉnh số tiền từ ${amountInBNB} lên ${minAmountInBNB} BNB (số tiền tối thiểu)`
        );
        amountInBNB = minAmountInBNB.toFixed(6);
      }

      toast.info(`Đang chuẩn bị giao dịch thanh toán ${amountInBNB} BNB...`);

      // 3. Thực hiện thanh toán
      const transactionHash = await metamaskPaymentService.makePayment(
        SHOP_WALLET_ADDRESS,
        amountInBNB
      );

      toast.success("Giao dịch đã được gửi thành công!");
      console.log("Giao dịch thành công với hash:", transactionHash);

      // 4. Xác minh giao dịch với backend
      // Bổ sung "-payment" vào slug để khớp với format checkout trong backend
      const checkoutSlug = `${orderSlug}-payment`;
      console.log(`Xác minh giao dịch với slug: ${checkoutSlug}`);

      await metamaskPaymentService.verifyTransaction(
        checkoutSlug,
        transactionHash,
        parseFloat(amountInBNB),
        address
      );

      toast.success("Đã xác minh giao dịch với máy chủ!");

      // 5. Gọi callback thành công
      onSuccess(transactionHash);
    } catch (error: any) {
      console.error("Lỗi thanh toán MetaMask:", error);

      // Kiểm tra lỗi user cancel
      if (error.code === 4001) {
        setError("Bạn đã hủy giao dịch.");
        onCancel();
      } else {
        setError(`Lỗi thanh toán: ${error.message}`);
        onError(error);
      }

      toast.error(error.message || "Đã xảy ra lỗi khi thanh toán");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {error && (
        <div className="text-red-500 mb-4 p-3 bg-red-50 rounded-md text-sm">
          {error}
          {!metamaskPaymentService.isMetaMaskInstalled() && (
            <div className="mt-2">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Cài đặt MetaMask
              </a>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleMetaMaskPayment}
        disabled={isProcessing || !!error}
        className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-md ${
          isProcessing || !!error
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-orange-500 hover:bg-orange-600"
        } text-white font-medium transition-colors`}
      >
        {isProcessing ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Đang xử lý...</span>
          </>
        ) : (
          <>
            <img
              src="/metamask-fox.svg"
              alt="MetaMask"
              className="h-6 w-6 mr-2"
            />
            <span>Thanh toán với MetaMask</span>
          </>
        )}
      </button>

      {walletAddress && (
        <div className="mt-2 text-sm text-gray-600">
          Ví của bạn: {walletAddress.substring(0, 6)}...
          {walletAddress.substring(walletAddress.length - 4)}
        </div>
      )}
    </div>
  );
};

export default MetaMaskButton;
