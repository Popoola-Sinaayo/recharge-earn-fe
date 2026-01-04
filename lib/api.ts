import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://recharge-earn-be.vercel.app/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{
    msg: string;
    param: string;
    location: string;
  }>;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface WalletBalance {
  balance: number;
  currency: string;
}

export type TransactionCategory = 
  | 'funding' 
  | 'data_purchase' 
  | 'airtime_purchase' 
  | 'electricity_purchase' 
  | 'cable_purchase' 
  | 'refund' 
  | 'withdrawal' 
  | 'referral_reward';

export interface Transaction {
  _id: string;
  userId: string;
  walletId: string;
  type: 'credit' | 'debit';
  category: TransactionCategory;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  reference: string;
  description: string;
  token?: string; // For electricity tokens
  metadata?: {
    phone_number?: string;
    plan_id?: string | number;
    reference?: string;
    network?: string;
    amount?: string | number;
    meter_number?: string;
    smartcard_number?: string;
    originalTransaction?: string;
    reason?: string;
    thirdPartyResponse?: unknown;
    error?: string;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInitResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface DataPlan {
  id: number;
  name: string;
  atm_price: string;
  wallet_price: string;
  api_price: string;
  status: number;
  airtime_value?: string;
  mb_value?: string;
  price: string;
  type: number;
  message?: string;
  master_name: string;
  master_status: number;
  master_message?: string;
  network: string;
}

export interface DataPlansResponse {
 
    MTN: DataPlan[];
    AIRTEL: DataPlan[];
    GLO: DataPlan[];
    '9MOBILE': DataPlan[];

}

// API Functions

// Health Check
export const checkHealth = async (): Promise<ApiResponse<{ timestamp: string }>> => {
  const response = await apiClient.get('/health');
  return response.data;
};

// User Endpoints
export const registerUser = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  referralCode?: string;
}): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.post('/users/register', data);
  return response.data;
};

export const verifyOTP = async (data: {
  email: string;
  otp: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  referralCode?: string;
}): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post('/users/verify-otp', data);
  return response.data;
};

export const resendOTP = async (data: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}): Promise<ApiResponse<Record<string, never>>> => {
  const response = await apiClient.post('/users/resend-otp', data);
  return response.data;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post('/users/login', data);
  return response.data;
};

export const getUserProfile = async (): Promise<ApiResponse<User>> => {
  const response = await apiClient.get('/users/profile');
  return response.data;
};

export const forgotPassword = async (data: {
  email: string;
}): Promise<ApiResponse<Record<string, never>>> => {
  const response = await apiClient.post('/users/forgot-password', data);
  return response.data;
};

export const resetPassword = async (data: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<ApiResponse<Record<string, never>>> => {
  const response = await apiClient.post('/users/reset-password', data);
  return response.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ApiResponse<Record<string, never>>> => {
  const response = await apiClient.post('/users/change-password', data);
  return response.data;
};

// Wallet Endpoints
export const getWalletBalance = async (): Promise<ApiResponse<WalletBalance>> => {
  const response = await apiClient.get('/wallet/balance');
  return response.data;
};

export const getWalletTransactions = async (params?: {
  limit?: number;
  skip?: number;
}): Promise<ApiResponse<Transaction[]>> => {
  const response = await apiClient.get('/wallet/transactions', { params });
  return response.data;
};

// Payment Endpoints
export const initializePayment = async (data: {
  email: string;
  amount: number;
}): Promise<ApiResponse<PaymentInitResponse>> => {
  const response = await apiClient.post('/payments/initialize', data);
  return response.data;
};

export const verifyPayment = async (reference: string): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.get(`/payments/verify?reference=${reference}`);
  return response.data;
};

// Utilities Endpoints
export const getDataPlans = async (): Promise<ApiResponse<{ status: string; message: string; data: DataPlansResponse }>> => {
  const response = await apiClient.get('/utilities/data');
  return response.data;
};

export const purchaseData = async (data: {
  phone_number: string;
  plan_id: number;
  reference: string;
  network: string;
}): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.post('/utilities/data_purchase', data);
  return response.data;
};

export const purchaseAirtime = async (data: {
  phone_number: string;
  amount: number;
  network: string;
  reference: string;
}): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.post('/utilities/airtime_purchase', data);
  return response.data;
};

export const verifyMeter = async (data: {
  plan_id: number;
  meter_number: string;
}): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.post('/utilities/verify_meter', data);
  return response.data;
};

export const purchaseElectricity = async (data: {
  phone_number: string;
  plan_id: number;
  amount: number;
  meter_number: string;
}): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.post('/utilities/electric_purchase', data);
  return response.data;
};

export const purchaseCable = async (data: {
  smartcard_number: string;
  plan_id: number;
}): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.post('/utilities/cable_purchase', data);
  return response.data;
};

export const getTransactionByReference = async (refId: string): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.get(`/utilities/transactions/reference/${refId}`);
  return response.data;
};

// Referral Endpoints
export interface ReferralCodeResponse {
  referralCode: string;
}

export interface ReferralStatsResponse {
  referralCode: string;
  totalReferrals: number;
  totalRewards: number;
}

export const getReferralCode = async (): Promise<ApiResponse<ReferralCodeResponse>> => {
  const response = await apiClient.get('/referrals/code');
  return response.data;
};

export const getReferralStats = async (): Promise<ApiResponse<ReferralStatsResponse>> => {
  const response = await apiClient.get('/referrals/stats');
  return response.data;
};

export default apiClient;

