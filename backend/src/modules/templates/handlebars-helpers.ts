import { HelperOptions } from 'handlebars';

/**
 * Handlebars helpers cho email templates
 */
export const handlebarsHelpers = {
  /**
   * Helper để so sánh equality
   * @param a - Giá trị thứ nhất
   * @param b - Giá trị thứ hai
   * @param options - Handlebars options
   * @returns true nếu a === b
   */
  eq: (a: any, b: any, options: HelperOptions) => a === b,

  /**
   * Helper để so sánh not equal
   * @param a - Giá trị thứ nhất
   * @param b - Giá trị thứ hai
   * @param options - Handlebars options
   * @returns true nếu a !== b
   */
  ne: (a: any, b: any, options: HelperOptions) => a !== b,

  /**
   * Helper để so sánh greater than
   * @param a - Giá trị thứ nhất
   * @param b - Giá trị thứ hai
   * @param options - Handlebars options
   * @returns true nếu a > b
   */
  gt: (a: any, b: any, options: HelperOptions) => a > b,

  /**
   * Helper để so sánh less than
   * @param a - Giá trị thứ nhất
   * @param b - Giá trị thứ hai
   * @param options - Handlebars options
   * @returns true nếu a < b
   */
  lt: (a: any, b: any, options: HelperOptions) => a < b,

  /**
   * Helper để so sánh greater than or equal
   * @param a - Giá trị thứ nhất
   * @param b - Giá trị thứ hai
   * @param options - Handlebars options
   * @returns true nếu a >= b
   */
  gte: (a: any, b: any, options: HelperOptions) => a >= b,

  /**
   * Helper để so sánh less than or equal
   * @param a - Giá trị thứ nhất
   * @param b - Giá trị thứ hai
   * @param options - Handlebars options
   * @returns true nếu a <= b
   */
  lte: (a: any, b: any, options: HelperOptions) => a <= b,

  /**
   * Helper để kiểm tra truthy
   * @param value - Giá trị cần kiểm tra
   * @param options - Handlebars options
   * @returns true nếu value là truthy
   */
  truthy: (value: any, options: HelperOptions) => !!value,

  /**
   * Helper để kiểm tra falsy
   * @param value - Giá trị cần kiểm tra
   * @param options - Handlebars options
   * @returns true nếu value là falsy
   */
  falsy: (value: any, options: HelperOptions) => !value,

  /**
   * Helper để format số tiền VND
   * @param amount - Số tiền
   * @param options - Handlebars options
   * @returns Chuỗi số tiền đã format
   */
  formatCurrency: (amount: number, options: HelperOptions) => {
    if (typeof amount !== 'number') return '0 ₫';
    return amount.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    });
  },

  /**
   * Helper để format ngày tháng
   * @param date - Ngày tháng
   * @param format - Định dạng (optional)
   * @param options - Handlebars options
   * @returns Chuỗi ngày tháng đã format
   */
  formatDate: (date: Date | string, format?: string, options?: HelperOptions) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    if (format === 'short') {
      return d.toLocaleDateString('vi-VN');
    } else if (format === 'long') {
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return d.toLocaleDateString('vi-VN');
  },

  /**
   * Helper để capitalize chuỗi
   * @param str - Chuỗi cần capitalize
   * @param options - Handlebars options
   * @returns Chuỗi đã capitalize
   */
  capitalize: (str: string, options: HelperOptions) => {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Helper để lấy ký tự đầu tiên
   * @param str - Chuỗi
   * @param options - Handlebars options
   * @returns Ký tự đầu tiên
   */
  firstChar: (str: string, options: HelperOptions) => {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase();
  },

  /**
   * Helper để kiểm tra mảng có phần tử không
   * @param arr - Mảng
   * @param options - Handlebars options
   * @returns true nếu mảng có phần tử
   */
  hasItems: (arr: any[], options: HelperOptions) => {
    return Array.isArray(arr) && arr.length > 0;
  },

  /**
   * Helper để lấy độ dài mảng
   * @param arr - Mảng
   * @param options - Handlebars options
   * @returns Độ dài mảng
   */
  length: (arr: any[], options: HelperOptions) => {
    return Array.isArray(arr) ? arr.length : 0;
  },

  /**
   * Helper để join mảng thành chuỗi
   * @param arr - Mảng
   * @param separator - Ký tự phân cách
   * @param options - Handlebars options
   * @returns Chuỗi đã join
   */
  join: (arr: any[], separator: string = ', ', options?: HelperOptions) => {
    if (!Array.isArray(arr)) return '';
    return arr.join(separator);
  },
};