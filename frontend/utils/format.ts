/**
 * Format a number as currency
 * @param value The value to format
 * @param locale The locale to use for formatting
 * @param currency The currency code
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number,
  locale: string = 'vi-VN',
  currency: string = 'VND'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format a date
 * @param date The date to format
 * @param locale The locale to use for formatting
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  locale: string = 'vi-VN'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a number with thousand separators
 * @param value The value to format
 * @param locale The locale to use for formatting
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number,
  locale: string = 'vi-VN'
): string => {
  return new Intl.NumberFormat(locale).format(value);
};

/**
 * Format a number as Vietnamese currency (VND)
 * @param amount - The amount to format
 * @returns Formatted string with VND currency
 */
export const formatCurrencyVietnamese = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};