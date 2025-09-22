"use client";

import { useState } from 'react';
import { EmailConfigService } from '../services/email-config.service';

interface OrderEmailStatusProps {
  orderId: string;
  checkoutId: string;
  orderSlug: string;
}

const OrderEmailStatus = ({ orderId, checkoutId, orderSlug }: OrderEmailStatusProps) => {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const sendOrderConfirmationEmail = async () => {
    try {
      setSending(true);
      setResult(null);
      const response = await EmailConfigService.sendOrderConfirmationEmail({
        orderId,
        checkoutId,
        sendToUser: true,
        sendToAdmin: true,
      });
      setResult({ success: true, message: response.message });
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi email'
      });
    } finally {
      setSending(false);
    }
  };

  const sendPaymentSuccessEmail = async () => {
    try {
      setSending(true);
      setResult(null);
      const response = await EmailConfigService.sendPaymentSuccessEmail({
        orderId,
        checkoutId,
        sendToUser: true,
        sendToAdmin: true,
      });
      setResult({ success: true, message: response.message });
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi email'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Email Actions */}
      <div className="flex gap-1">
        <button
          onClick={sendOrderConfirmationEmail}
          disabled={sending}
          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Gửi email xác nhận đơn hàng"
        >
          {sending ? '...' : '📧 XN'}
        </button>
        <button
          onClick={sendPaymentSuccessEmail}
          disabled={sending}
          className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Gửi email thanh toán thành công"
        >
          {sending ? '...' : '💰 TT'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`text-xs p-1 rounded ${result.success
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
          }`}>
          {result.success ? '✅' : '❌'} {result.message}
        </div>
      )}

      {/* Order Info */}
      <div className="text-xs text-gray-500">
        <div>Order: {orderSlug}</div>
        <div>ID: {orderId.slice(-6)}</div>
      </div>
    </div>
  );
};

export default OrderEmailStatus;