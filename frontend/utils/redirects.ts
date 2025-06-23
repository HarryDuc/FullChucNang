import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import axios from 'axios';
import { API_URL } from '@/config/api';

/**
 * Kiểm tra và xử lý redirect cho các URL cũ
 * @param context GetServerSidePropsContext từ Next.js
 * @param path Đường dẫn cần kiểm tra (mặc định lấy từ context)
 * @returns Đối tượng redirect nếu cần chuyển hướng, null nếu không
 */
export async function checkAndHandleRedirect(
  context: GetServerSidePropsContext,
  path?: string
): Promise<GetServerSidePropsResult<any> | null> {
  try {
    // Lấy đường dẫn từ context nếu không được cung cấp
    const pathToCheck = path || context.resolvedUrl;

    // Gọi API kiểm tra redirect
    const response = await axios.get(`${API_URL}/redirects/check`, {
      params: { path: pathToCheck },
    });

    // Nếu API trả về thông tin redirect
    if (response.data && response.data.newPath) {
      // Thêm query params từ URL gốc (nếu có)
      const originalUrl = context.resolvedUrl;
      const queryParams = originalUrl.includes('?') 
        ? originalUrl.split('?')[1] 
        : '';
        
      // Tạo URL đích với query params nếu có
      const destination = queryParams 
        ? `${response.data.newPath}?${queryParams}` 
        : response.data.newPath;

      // Trả về đối tượng redirect cho Next.js
      return {
        redirect: {
          destination,
          permanent: response.data.statusCode === 301,
        },
      };
    }
  } catch (error) {
    console.error('Lỗi kiểm tra redirect:', error);
  }

  // Không có redirect, trả về null
  return null;
}

/**
 * Hàm wrapper cho getServerSideProps để tự động xử lý redirect
 * @param getServerSidePropsFunc Function getServerSideProps gốc
 * @returns Function getServerSideProps mới có tích hợp xử lý redirect
 */
export function withRedirectHandling(
  getServerSidePropsFunc?: (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<any>>
) {
  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> => {
    // Kiểm tra và xử lý redirect
    const redirectResult = await checkAndHandleRedirect(context);
    
    // Nếu có redirect, trả về kết quả redirect
    if (redirectResult) {
      return redirectResult;
    }
    
    // Nếu không có redirect và có hàm getServerSideProps được truyền vào
    if (getServerSidePropsFunc) {
      // Gọi hàm gốc và trả về kết quả
      return await getServerSidePropsFunc(context);
    }
    
    // Mặc định trả về props rỗng nếu không có hàm getServerSideProps
    return { props: {} };
  };
} 