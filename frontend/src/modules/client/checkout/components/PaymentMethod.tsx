import Image from "next/image";

interface PaymentMethodProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}

const PaymentMethod = ({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodProps) => {
  return (
    <div className="bg-white border mb-8">
      <div className="border-b py-4 px-6 font-medium text-lg bg-gray-50">
        PHƯƠNG THỨC THANH TOÁN
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="cod"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={() => onPaymentMethodChange("cod")}
              className="h-4 w-4 text-blue-900"
            />
            <label htmlFor="cod" className="ml-3 block text-gray-700">
              Thanh toán khi nhận hàng (COD)
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="bankTransfer"
              name="paymentMethod"
              value="bankTransfer"
              checked={paymentMethod === "bankTransfer"}
              onChange={() => onPaymentMethodChange("bankTransfer")}
              className="h-4 w-4 text-blue-900"
            />
            <label htmlFor="bankTransfer" className="ml-3 block text-gray-700">
              Chuyển khoản ngân hàng (Bank Transfer)
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="paypal"
              name="paymentMethod"
              value="paypal"
              checked={paymentMethod === "paypal"}
              onChange={() => onPaymentMethodChange("paypal")}
              className="h-4 w-4 text-blue-900"
            />
            <label
              htmlFor="paypal"
              className="ml-3 flex items-center text-gray-700"
            >
              PayPal{" "}
              <Image
                src="/paypal-logo.png"
                alt="PayPal"
                className="h-6 ml-2"
                width={24}
                height={24}
              />
              <span className="text-xs text-gray-500 ml-2">
                (Thanh toán quốc tế)
              </span>
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="radio"
              id="metamask"
              name="paymentMethod"
              value="metamask"
              checked={paymentMethod === "metamask"}
              onChange={() => onPaymentMethodChange("metamask")}
              className="h-4 w-4 text-blue-900"
            />
            <label
              htmlFor="metamask"
              className="ml-3 flex items-center text-gray-700"
            >
              MetaMask{" "}
              <Image
                src="/metamask-fox.svg"
                alt="MetaMask"
                className="h-6 ml-2"
                width={24}
                height={24}
              />
              <span className="text-xs text-gray-500 ml-2">
                (Thanh toán USDT)
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
