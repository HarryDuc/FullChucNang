import { API_URL } from "@/config/api";
import axios from "axios";

export async function checkRedirect(path: string) {
  try {
    const response = await axios.get(`${API_URL}/redirects/check`, {
      params: { path }
    });

    if (response.data && response.data.newPath) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Lỗi kiểm tra redirect:', error);
    return null;
  }
}