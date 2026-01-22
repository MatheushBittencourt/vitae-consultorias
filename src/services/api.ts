// Usa variável de ambiente ou fallback para localhost
const API_URL = import.meta.env.VITE_API_URL || '/api';

// ===============================
// GERENCIAMENTO DE TOKEN JWT
// ===============================
const TOKEN_KEY = 'vitae_auth_token';

// Obter token armazenado
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Salvar token
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Remover token (logout)
export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Verificar se está autenticado
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  
  // Verificar se token não expirou (decodifica sem validar assinatura)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// Obter headers com autenticação
const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Handler para respostas 401/403
const handleAuthError = (status: number): void => {
  if (status === 401 || status === 403) {
    // Token inválido ou expirado - limpar e redirecionar
    removeAuthToken();
    // Limpar sessões antigas
    localStorage.removeItem('vitae_patient_session');
    localStorage.removeItem('vitae_admin_session');
    localStorage.removeItem('vitae_superadmin_session');
    // Recarregar para forçar novo login
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
};

// API client com métodos HTTP e autenticação
const api = {
  get: async <T>(endpoint: string): Promise<{ data: T }> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      handleAuthError(response.status);
      const error = new Error(data.error || `HTTP ${response.status}`) as Error & { response?: { data?: { error?: string } } };
      error.response = { data };
      throw error;
    }
    return { data };
  },
  
  post: async <T>(endpoint: string, body: unknown): Promise<{ data: T }> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      handleAuthError(response.status);
      const error = new Error(data.error || `HTTP ${response.status}`) as Error & { response?: { data?: { error?: string } } };
      error.response = { data };
      throw error;
    }
    return { data };
  },
  
  put: async <T>(endpoint: string, body: unknown): Promise<{ data: T }> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      handleAuthError(response.status);
      const error = new Error(data.error || `HTTP ${response.status}`) as Error & { response?: { data?: { error?: string } } };
      error.response = { data };
      throw error;
    }
    return { data };
  },
  
  delete: async <T>(endpoint: string): Promise<{ data: T }> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      handleAuthError(response.status);
      const error = new Error(data.error || `HTTP ${response.status}`) as Error & { response?: { data?: { error?: string } } };
      error.response = { data };
      throw error;
    }
    return { data };
  },
};

export default api;

// Helper para fazer requisições (legado) - com suporte a autenticação
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    handleAuthError(response.status);
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// ===============================
// TYPES
// ===============================

export interface TrainingPlan {
  id: number;
  athlete_id: number;
  coach_id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  coach_name?: string;
}

export interface TrainingExercise {
  id: number;
  plan_id: number;
  name: string;
  description: string;
  sets: number;
  reps: string;
  weight: string;
  rest_seconds: number;
  notes: string;
  day_of_week: number;
  order_index: number;
}

export interface NutritionPlan {
  id: number;
  athlete_id: number;
  nutritionist_id: number;
  name: string;
  description: string;
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed';
  nutritionist_name?: string;
}

export interface Meal {
  id: number;
  plan_id: number;
  name: string;
  time: string;
  description: string;
  calories: number;
}

export interface MedicalRecord {
  id: number;
  athlete_id: number;
  doctor_id: number;
  record_date: string;
  type: 'exam' | 'consultation' | 'injury' | 'evaluation';
  title: string;
  description: string;
  diagnosis: string;
  treatment: string;
  attachments: { name: string; url: string; type: string }[];
  doctor_name?: string;
}

export interface RehabSession {
  id: number;
  athlete_id: number;
  physio_id: number;
  session_date: string;
  injury_description: string;
  treatment: string;
  exercises: string;
  progress_notes: string;
  next_session: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  physio_name?: string;
}

export interface Appointment {
  id: number;
  athlete_id: number;
  professional_id: number;
  type: 'training' | 'nutrition' | 'medical' | 'rehab' | 'evaluation';
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  location: string;
  notes: string;
  athlete_name?: string;
  professional_name?: string;
}

export interface AthleteProgress {
  id: number;
  athlete_id: number;
  record_date: string;
  weight: number;
  body_fat_percentage: number;
  muscle_mass: number;
  notes: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
}

// ===============================
// TRAINING API
// ===============================

export const trainingApi = {
  getPlans: (athleteId?: number) => 
    fetchApi<TrainingPlan[]>(`/training-plans${athleteId ? `?athlete_id=${athleteId}` : ''}`),
  
  createPlan: (data: Omit<TrainingPlan, 'id'>) =>
    fetchApi<{ id: number }>('/training-plans', { method: 'POST', body: JSON.stringify(data) }),
  
  updatePlan: (id: number, data: Partial<TrainingPlan>) =>
    fetchApi<{ message: string }>(`/training-plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  deletePlan: (id: number) =>
    fetchApi<{ message: string }>(`/training-plans/${id}`, { method: 'DELETE' }),
  
  getExercises: (planId: number) =>
    fetchApi<TrainingExercise[]>(`/training-exercises?plan_id=${planId}`),
  
  createExercise: (data: Omit<TrainingExercise, 'id'>) =>
    fetchApi<{ id: number }>('/training-exercises', { method: 'POST', body: JSON.stringify(data) }),
  
  updateExercise: (id: number, data: Partial<TrainingExercise>) =>
    fetchApi<{ message: string }>(`/training-exercises/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  deleteExercise: (id: number) =>
    fetchApi<{ message: string }>(`/training-exercises/${id}`, { method: 'DELETE' }),
};

// ===============================
// NUTRITION API
// ===============================

export const nutritionApi = {
  getPlans: (athleteId?: number) =>
    fetchApi<NutritionPlan[]>(`/nutrition-plans${athleteId ? `?athlete_id=${athleteId}` : ''}`),
  
  createPlan: (data: Omit<NutritionPlan, 'id'>) =>
    fetchApi<{ id: number }>('/nutrition-plans', { method: 'POST', body: JSON.stringify(data) }),
  
  updatePlan: (id: number, data: Partial<NutritionPlan>) =>
    fetchApi<{ message: string }>(`/nutrition-plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  deletePlan: (id: number) =>
    fetchApi<{ message: string }>(`/nutrition-plans/${id}`, { method: 'DELETE' }),
  
  getMeals: (planId: number) =>
    fetchApi<Meal[]>(`/meals?plan_id=${planId}`),
  
  createMeal: (data: Omit<Meal, 'id'>) =>
    fetchApi<{ id: number }>('/meals', { method: 'POST', body: JSON.stringify(data) }),
  
  updateMeal: (id: number, data: Partial<Meal>) =>
    fetchApi<{ message: string }>(`/meals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  deleteMeal: (id: number) =>
    fetchApi<{ message: string }>(`/meals/${id}`, { method: 'DELETE' }),
};

// ===============================
// MEDICAL API
// ===============================

export const medicalApi = {
  getRecords: (athleteId?: number) =>
    fetchApi<MedicalRecord[]>(`/medical-records${athleteId ? `?athlete_id=${athleteId}` : ''}`),
  
  createRecord: (data: Omit<MedicalRecord, 'id'>) =>
    fetchApi<{ id: number }>('/medical-records', { method: 'POST', body: JSON.stringify(data) }),
  
  updateRecord: (id: number, data: Partial<MedicalRecord>) =>
    fetchApi<{ message: string }>(`/medical-records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  deleteRecord: (id: number) =>
    fetchApi<{ message: string }>(`/medical-records/${id}`, { method: 'DELETE' }),
};

// ===============================
// REHAB API
// ===============================

export const rehabApi = {
  getSessions: (athleteId?: number) =>
    fetchApi<RehabSession[]>(`/rehab-sessions${athleteId ? `?athlete_id=${athleteId}` : ''}`),
  
  createSession: (data: Omit<RehabSession, 'id'>) =>
    fetchApi<{ id: number }>('/rehab-sessions', { method: 'POST', body: JSON.stringify(data) }),
  
  updateSession: (id: number, data: Partial<RehabSession>) =>
    fetchApi<{ message: string }>(`/rehab-sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  deleteSession: (id: number) =>
    fetchApi<{ message: string }>(`/rehab-sessions/${id}`, { method: 'DELETE' }),
};

// ===============================
// APPOINTMENTS API
// ===============================

export const appointmentsApi = {
  getAll: (athleteId?: number) =>
    fetchApi<Appointment[]>(`/appointments${athleteId ? `?athlete_id=${athleteId}` : ''}`),
  
  create: (data: Omit<Appointment, 'id'>) =>
    fetchApi<{ id: number }>('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (id: number, data: Partial<Appointment>) =>
    fetchApi<{ message: string }>(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  delete: (id: number) =>
    fetchApi<{ message: string }>(`/appointments/${id}`, { method: 'DELETE' }),
};

// ===============================
// PROGRESS API
// ===============================

export const progressApi = {
  getAll: (athleteId: number) =>
    fetchApi<AthleteProgress[]>(`/progress?athlete_id=${athleteId}`),
  
  create: (data: Omit<AthleteProgress, 'id'>) =>
    fetchApi<{ id: number }>('/progress', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (id: number, data: Partial<AthleteProgress>) =>
    fetchApi<{ message: string }>(`/progress/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  delete: (id: number) =>
    fetchApi<{ message: string }>(`/progress/${id}`, { method: 'DELETE' }),
};

// ===============================
// MESSAGES API
// ===============================

export const messagesApi = {
  getAll: (userId: number) =>
    fetchApi<Message[]>(`/messages?user_id=${userId}`),
  
  send: (data: { sender_id: number; receiver_id: number; subject: string; content: string }) =>
    fetchApi<{ id: number }>('/messages', { method: 'POST', body: JSON.stringify(data) }),
  
  markAsRead: (id: number) =>
    fetchApi<{ message: string }>(`/messages/${id}/read`, { method: 'PUT' }),
  
  delete: (id: number) =>
    fetchApi<{ message: string }>(`/messages/${id}`, { method: 'DELETE' }),
};

// ===============================
// ATHLETES API
// ===============================

export const athletesApi = {
  getAll: () =>
    fetchApi<Array<{
      id: number;
      user_id: number;
      name: string;
      email: string;
      avatar_url: string;
      sport: string;
      position: string;
      club: string;
      birth_date: string;
      height: number;
      weight: number;
      goals: string;
    }>>('/athletes'),
  
  getById: (id: number) =>
    fetchApi<{
      id: number;
      user_id: number;
      name: string;
      email: string;
      avatar_url: string;
      sport: string;
      position: string;
      club: string;
      birth_date: string;
      height: number;
      weight: number;
      goals: string;
    }>(`/athletes/${id}`),
};
