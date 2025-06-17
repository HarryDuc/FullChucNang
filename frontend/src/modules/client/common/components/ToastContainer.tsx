"use client";

import { Toaster } from 'react-hot-toast';

const ToastContainer = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2000,
        style: {
          background: '#fff',
          color: '#222',
          border: '1px solid #f0f0f0',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          maxWidth: '90vw',
          fontSize: '14px',
        },
        success: {
          style: {
            borderLeft: '4px solid #10B981',
          },
          iconTheme: {
            primary: '#10B981',
            secondary: '#FFFFFF',
          },
        },
        error: {
          style: {
            borderLeft: '4px solid #EF4444',
          },
          iconTheme: {
            primary: '#EF4444',
            secondary: '#FFFFFF',
          },
        },
        loading: {
          style: {
            borderLeft: '4px solid #3B82F6',
          },
        },
        className: 'toast-mobile-friendly',
      }}
    />
  );
};

export default ToastContainer; 