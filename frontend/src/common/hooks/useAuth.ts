"use client";
import { useState } from "react";
import axios from "axios";
import { API_URL_CLIENT } from "@/config/apiRoutes";
import { config } from "@/config/config";

const API_URL = API_URL_CLIENT + config.ROUTES.AUTH.BASE;

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const register = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/register`, { email, password });
            console.log("Đăng ký thành công:", response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Đã có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    return { register, loading, error };
};
