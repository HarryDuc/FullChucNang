import { useState, useEffect } from 'react';
import { EmailConfigService, EmailConfig } from '../services/email-config.service';

export const useEmailConfig = () => {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Load email configuration
  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const emailConfig = await EmailConfigService.getEmailConfiguration();
      setConfig(emailConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load email configuration');
      console.error('Error loading email config:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update email configuration
  const updateConfig = async (newConfig: Partial<EmailConfig>) => {
    try {
      setUpdating(true);
      setError(null);
      const updatedConfig = await EmailConfigService.updateEmailConfiguration(newConfig);
      setConfig(updatedConfig);
      return updatedConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email configuration');
      console.error('Error updating email config:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Toggle email system
  const toggleEmailSystem = async (enabled: boolean) => {
    try {
      setUpdating(true);
      setError(null);
      const updatedConfig = await EmailConfigService.toggleEmailSystem(enabled);
      setConfig(updatedConfig);
      return updatedConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle email system');
      console.error('Error toggling email system:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Toggle user emails
  const toggleUserEmails = async (orderConfirmation: boolean, paymentSuccess: boolean) => {
    try {
      setUpdating(true);
      setError(null);
      const updatedConfig = await EmailConfigService.toggleUserEmails(orderConfirmation, paymentSuccess);
      setConfig(updatedConfig);
      return updatedConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle user emails');
      console.error('Error toggling user emails:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Toggle admin emails
  const toggleAdminEmails = async (orderNotification: boolean, paymentSuccess: boolean) => {
    try {
      setUpdating(true);
      setError(null);
      const updatedConfig = await EmailConfigService.toggleAdminEmails(orderNotification, paymentSuccess);
      setConfig(updatedConfig);
      return updatedConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle admin emails');
      console.error('Error toggling admin emails:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Add admin email
  const addAdminEmail = async (email: string) => {
    try {
      setUpdating(true);
      setError(null);
      const updatedConfig = await EmailConfigService.addAdminEmail(email);
      setConfig(updatedConfig);
      return updatedConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add admin email');
      console.error('Error adding admin email:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Remove admin email
  const removeAdminEmail = async (email: string) => {
    try {
      setUpdating(true);
      setError(null);
      const updatedConfig = await EmailConfigService.removeAdminEmail(email);
      setConfig(updatedConfig);
      return updatedConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove admin email');
      console.error('Error removing admin email:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Test email
  const testEmail = async (orderId: string, checkoutId: string, type: 'confirmation' | 'payment-success', sendToUser = true, sendToAdmin = true) => {
    try {
      setUpdating(true);
      setError(null);
      const result = await EmailConfigService.testEmail({
        orderId,
        checkoutId,
        type,
        sendToUser,
        sendToAdmin,
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test email');
      console.error('Error testing email:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Send order confirmation email
  const sendOrderConfirmationEmail = async (orderId: string, checkoutId: string, sendToUser = true, sendToAdmin = true) => {
    try {
      setUpdating(true);
      setError(null);
      const result = await EmailConfigService.sendOrderConfirmationEmail({
        orderId,
        checkoutId,
        sendToUser,
        sendToAdmin,
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send order confirmation email');
      console.error('Error sending order confirmation email:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Send payment success email
  const sendPaymentSuccessEmail = async (orderId: string, checkoutId: string, sendToUser = true, sendToAdmin = true) => {
    try {
      setUpdating(true);
      setError(null);
      const result = await EmailConfigService.sendPaymentSuccessEmail({
        orderId,
        checkoutId,
        sendToUser,
        sendToAdmin,
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send payment success email');
      console.error('Error sending payment success email:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    loading,
    error,
    updating,
    loadConfig,
    updateConfig,
    toggleEmailSystem,
    toggleUserEmails,
    toggleAdminEmails,
    addAdminEmail,
    removeAdminEmail,
    testEmail,
    sendOrderConfirmationEmail,
    sendPaymentSuccessEmail,
  };
};