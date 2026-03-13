import { User, Meal, WaterLog } from "../types";

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('nutrisnap_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  throw new Error('Expected JSON response but received something else');
};

export const api = {
  async getProfile(): Promise<User> {
    const res = await fetch(`${API_BASE}/profile`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async updateProfile(data: Partial<User>) {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getMeals(): Promise<Meal[]> {
    const res = await fetch(`${API_BASE}/meals`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async addMeal(data: any) {
    const res = await fetch(`${API_BASE}/meals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async uploadImage(base64: string): Promise<{ url: string }> {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ image: base64 }),
    });
    return handleResponse(res);
  },

  async getWater(): Promise<WaterLog[]> {
    const res = await fetch(`${API_BASE}/water`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async addWater(amount: number) {
    const res = await fetch(`${API_BASE}/water`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount }),
    });
    return handleResponse(res);
  },
};
