'use client';
import { useEffect } from 'react';

const PaypalButton = () => {
  const paypalEnv = process.env.NEXT_PUBLIC_PAYPAL_ENV;
  const clientId =
    paypalEnv === 'live'
      ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE
      : process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_SANDBOX;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.${paypalEnv === 'live' ? '' : 'sandbox.'}paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [clientId, paypalEnv]);

  return <div id="paypal-button-container"></div>;
};

export default PaypalButton;
