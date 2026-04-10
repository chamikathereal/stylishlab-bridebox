import Axios, { AxiosRequestConfig, AxiosError } from 'axios';

export const AXIOS_INSTANCE = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
});

AXIOS_INSTANCE.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('bridebox_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bridebox_token');
        localStorage.removeItem('bridebox_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error - adding cancel method to promise
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

export default customInstance;

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
