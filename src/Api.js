import axios from "axios";
import config from "./Config";

const api = axios.create({
    baseURL: config.API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

let refreshPromise = null;

const validateContentType = (response) => {
  const contentType = response.headers?.["content-type"] || "";
  if (!contentType.includes("json")) {
    console.warn("JSON이 아닌 응답 Content-Type:", contentType);
  }
};


export const renewAccessToken = async () => {
    if (!refreshPromise) {
        refreshPromise = axios
            .post(config.AUTH.REISSUE, {}, { withCredentials: true })
            .then(({ data }) => {
                const token = data?.result;

                if (
                    data?.isSuccess === false ||
                    typeof token !== "string" ||
                    !token
                ) {
                    throw new Error("토큰 재발급에 실패했습니다");
                }

                localStorage.setItem("accessToken", token);

                window.dispatchEvent(new Event("auth:changed"));

                return token;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};


api.interceptors.request.use((request) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
        request.headers.Authorization = `Bearer ${accessToken}`;
    }

    return request;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        const url = original?.url || "";
        
        if (
            error.response?.status !== 401 ||
            !original ||
            original._retry ||
            url.includes(config.AUTH.KAKAO) ||
            url.includes(config.AUTH.REISSUE)
        ) {
            return Promise.reject(error);
        }

        original._retry = true;
        
        try {
            const newAccessToken = await renewAccessToken();
            original.headers = original.headers || {};

            original.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(original);
        } catch (refreshError) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("auth:changed"));
            return Promise.reject(refreshError);
        }
    }
)

// ===== 공통 요청 함수들 =====

// GET
export const get = async (endpoint, params = {}, options = {}) => {
  const response = await api.get(endpoint, { params, ...options });
  validateContentType(response);
  return response.data;
};

// PUT (JSON)
export const put = async (endpoint, data = {}, options = {}) => {
  const response = await api.put(endpoint, data, options);
  validateContentType(response);
  return response.data;
};

// PATCH (일반 JSON PATCH)
export const patch = async (endpoint, data = {}, options = {}) => {
  const response = await api.patch(endpoint, data, options);
  validateContentType(response);
  return response.data;
};

export const uploadProfile = async (endpoint, { imageFile }, options = {}) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await api.request({
    url: endpoint,
    method: "put",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
    ...options,
  });

  validateContentType(response);
  return response.data;
};

export default api;
