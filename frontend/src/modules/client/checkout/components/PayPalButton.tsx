import { useEffect, useRef, useState } from "react";
import { paypalService } from "../services/paypalService";

interface PayPalButtonProps {
  amount: number; // Amount in VND
  orderRef: string; // Reference to our order
  onSuccess: (paypalOrderId: string) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

declare global {
  interface Window {
    paypal: any;
  }
}

const PayPalButton = ({
  amount,
  orderRef,
  onSuccess,
  onError,
  onCancel,
}: PayPalButtonProps) => {
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const amountUSD = paypalService.convertVNDtoUSD(amount);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;

    // Load the PayPal SDK script
    const loadPayPalScript = () => {
      if (!isMounted.current) return;

      setIsLoading(true);
      setErrorMessage(null);

      // Check if script is already loaded
      if (document.querySelector('script[src*="paypal.com/sdk/js"]')) {
        initializePayPalButton();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;
      script.onload = () => {
        if (!isMounted.current) return;
        console.log("PayPal SDK loaded successfully");
        initializePayPalButton();
      };
      script.onerror = (e) => {
        if (!isMounted.current) return;
        console.error("Failed to load PayPal SDK:", e);
        setErrorMessage("Không thể tải PayPal SDK. Vui lòng thử lại sau.");
        setIsLoading(false);
        onError(new Error("Could not load PayPal SDK"));
      };
      document.body.appendChild(script);
    };

    // Initialize the PayPal button once the SDK is loaded
    const initializePayPalButton = () => {
      if (!isMounted.current) return;

      if (!paypalContainerRef.current || !window.paypal) {
        setErrorMessage(
          "Không thể khởi tạo PayPal button. Vui lòng làm mới trang và thử lại."
        );
        setIsLoading(false);
        return;
      }

      try {
        paypalContainerRef.current.innerHTML = "";

        const paypalButtonInstance = window.paypal.Buttons({
          createOrder: async () => {
            try {
              if (!isMounted.current) return;
              setIsLoading(true);
              // Create a PayPal order through our backend
              console.log(
                "Creating PayPal order for amount:",
                amount,
                "USD:",
                amountUSD
              );
              const order = await paypalService.createPayPalOrder(
                amount,
                orderRef
              );
              console.log("PayPal order created:", order);
              if (!isMounted.current) return;
              setIsLoading(false);
              return order.id;
            } catch (error: any) {
              if (!isMounted.current) return;
              console.error("Error creating PayPal order:", error);
              setErrorMessage(
                `Lỗi tạo đơn hàng PayPal: ${
                  error.message || "Lỗi không xác định"
                }`
              );
              setIsLoading(false);
              onError(error);
              throw error;
            }
          },
          onApprove: async (data: any) => {
            try {
              if (!isMounted.current) return;
              setIsLoading(true);
              console.log("PayPal payment approved:", data);

              // Capture the payment
              const captureResult = await paypalService.capturePayment(
                data.orderID
              );
              console.log("PayPal payment captured:", captureResult);

              // If successful, call onSuccess with the PayPal order ID
              if (!isMounted.current) return;
              onSuccess(data.orderID);
              setIsLoading(false);

              return captureResult;
            } catch (error: any) {
              if (!isMounted.current) return;
              console.error("Error capturing PayPal payment:", error);
              setErrorMessage(
                `Lỗi xử lý thanh toán PayPal: ${
                  error.message || "Lỗi không xác định"
                }`
              );
              setIsLoading(false);
              onError(error);
              throw error;
            }
          },
          onCancel: () => {
            if (!isMounted.current) return;
            console.log("PayPal payment cancelled by user");
            setErrorMessage("Bạn đã hủy thanh toán PayPal");
            onCancel();
          },
          onError: (error: any) => {
            if (!isMounted.current) return;
            console.error("PayPal error:", error);
            setErrorMessage(
              `Lỗi PayPal: ${error.message || "Lỗi không xác định"}`
            );
            setIsLoading(false);
            onError(error);
          },
          style: {
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "pay",
          },
        });

        if (paypalContainerRef.current) {
          paypalButtonInstance.render(paypalContainerRef.current);
        }

        if (isMounted.current) {
          setIsLoading(false);
        }
      } catch (error: any) {
        if (!isMounted.current) return;
        console.error("Error rendering PayPal button:", error);
        setErrorMessage(
          `Lỗi hiển thị nút PayPal: ${error.message || "Lỗi không xác định"}`
        );
        setIsLoading(false);
        onError(error);
      }
    };

    loadPayPalScript();

    // Cleanup
    return () => {
      isMounted.current = false;
    };
  }, [amount, orderRef, onSuccess, onError, onCancel, amountUSD]);

  return (
    <div className="my-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Tổng thanh toán:</span>
          <span className="font-bold text-lg">
            {amount.toLocaleString()} VND
          </span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Quy đổi USD (PayPal):</span>
          <span>${amountUSD.toFixed(2)} USD</span>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{errorMessage}</p>
          <button
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded text-sm"
            onClick={() => window.location.reload()}
          >
            Làm mới trang
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          <span className="ml-2">Đang tải PayPal...</span>
        </div>
      )}

      <div ref={paypalContainerRef} className="paypal-button-container"></div>

      <div className="text-xs text-gray-500 mt-2">
        <p>
          * Thanh toán bằng PayPal sẽ được quy đổi từ VND sang USD theo tỷ giá
          hiện tại.
        </p>
        <p>
          * Một khoản phí nhỏ có thể được tính bởi ngân hàng của bạn cho giao
          dịch quốc tế.
        </p>
      </div>
    </div>
  );
};

export default PayPalButton;
