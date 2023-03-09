import axios from 'axios';

export const http = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL, params: { orgId: process.env.NEXT_PUBLIC_HOTUS_ORG_ID } });

http.interceptors.request.use(
  async (config) => {
    config.headers['X-Language'] = window.location.href.includes('/en/') ? 'EN' : 'JA';

    return config;
  },
  (error) => Promise.reject(error),
);
