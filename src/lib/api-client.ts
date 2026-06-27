import axios from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor for responses to automatically extract data and show error toasts
api.interceptors.response.use(
  (response) => {
    // If the backend returns a success flag and data wrapper, we can handle it
    return response;
  },
  (error) => {
    const responseData = error.response?.data;
    const message = responseData?.message || responseData?.error || error.message || "An unexpected error occurred";
    
    // Auto-alert errors unless handled explicitly by passing a custom config flag
    if (error.config?.showToast !== false) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Declare custom module block for Axios to support custom config options like showToast
declare module "axios" {
  export interface AxiosRequestConfig {
    showToast?: boolean;
  }
}
