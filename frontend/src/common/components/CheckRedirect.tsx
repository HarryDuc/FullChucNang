import axios from "axios";
import { API_URL_CLIENT } from "@/config/apiRoutes";
import { config } from "@/config/config";

const API_URL = API_URL_CLIENT + config.ROUTES.REDIRECTS.BASE;

export async function checkRedirect(path: string) {
  try {
    const response = await axios.get(`${API_URL}/check`, {
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