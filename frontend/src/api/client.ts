import axios from 'axios';
import { Platform } from 'react-native';

// Tự động xác định địa chỉ API dựa trên môi trường Web Cloud (erp-yusung.pages.dev) hoặc Local
export const getBaseApiUrl = () => {
  // 1. Nếu có biến môi trường build
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Nếu đang chạy trên Web Cloudflare Pages (erp-yusung.pages.dev)
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('pages.dev') || host.includes('erp-yusung')) {
      // Backend Cloud API (Render/Fly.io với HTTPS bảo mật)
      return 'https://erp-yusung-api.onrender.com/api/v1';
    }
    return `http://${host}:9600/api/v1`;
  }

  // 3. Fallback cho Mobile App
  return 'https://erp-yusung-api.onrender.com/api/v1';
};

export const getWebSocketUrl = () => {
  if (process.env.EXPO_PUBLIC_WS_URL) {
    return process.env.EXPO_PUBLIC_WS_URL;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('pages.dev') || host.includes('erp-yusung')) {
      return 'wss://erp-yusung-api.onrender.com/ws/realtime';
    }
    return `ws://${host}:9600/ws/realtime`;
  }

  return 'wss://erp-yusung-api.onrender.com/ws/realtime';
};

const api = axios.create({
  baseURL: getBaseApiUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gắn token JWT vào header của mỗi request nếu có
api.interceptors.request.use((config) => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('ERP_ACCESS_TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const erpApi = {
  // Auth
  login: (data: any) => api.post('/auth/login', data),

  // Planning
  getScheduleDates: () => api.get('/planning/dates'),
  getPlans: (params?: { schedule_date?: string; remain_only?: boolean }) =>
    api.get('/planning/plans', { params }),
  getMappings: () => api.get('/planning/mappings'),

  // Barcode
  generateBarcode: (data: any) => api.post('/barcode/generate', data),
  scanBarcode: (data: { raw_barcode: string; scanned_by?: string }) =>
    api.post('/barcode/scan', data),
  commitScans: (data: any) => api.post('/barcode/commit', data),
  getBarcodeHistory: (params: any) => api.get('/barcode/history', { params }),
};

export default api;
