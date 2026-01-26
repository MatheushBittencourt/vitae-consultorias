import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// URL da API - pode ser configurada via app.json
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://vitaeconsultorias.com.br/api';

// Chave para armazenar o token
const TOKEN_KEY = 'vitae_auth_token';
const USER_KEY = 'vitae_user_data';

// ===============================
// Gerenciamento de Token
// ===============================

export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
}

export async function removeAuthToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
}

export async function getUserData(): Promise<any | null> {
  try {
    const data = await SecureStore.getItemAsync(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

export async function setUserData(user: any): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error setting user data:', error);
  }
}

// ===============================
// Headers de Autenticação
// ===============================

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

// ===============================
// Funções de API
// ===============================

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
  
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    console.log(`📡 API Response: ${response.status} ${response.statusText}`);

    // Se não autorizado, limpar token
    if (response.status === 401) {
      await removeAuthToken();
      return { error: 'Sessão expirada', status: 401 };
    }

    const data = await response.json().catch(() => null);
    console.log('📡 API Data:', data);

    if (!response.ok) {
      return {
        error: data?.error || data?.message || 'Erro na requisição',
        status: response.status,
      };
    }

    return { data, status: response.status };
  } catch (error) {
    console.error('❌ API Request Error:', error);
    return { error: 'Erro de conexão. Verifique sua internet.', status: 0 };
  }
}

// ===============================
// Autenticação
// ===============================

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    athleteId?: number;
    consultancyId?: number;
  };
  activeModules?: string[];
}

export async function login(
  email: string, 
  password: string, 
  appRole: 'professional' | 'patient' = 'patient'
): Promise<ApiResponse<LoginResponse>> {
  // Usar endpoint correto baseado no tipo de usuário
  const endpoint = appRole === 'professional' 
    ? '/auth/admin/login' 
    : '/auth/patient/login';
  
  const response = await apiRequest<LoginResponse>(endpoint, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.data?.token) {
    await setAuthToken(response.data.token);
    await setUserData(response.data.user);
  }

  return response;
}

export async function logout(): Promise<void> {
  await removeAuthToken();
}

// ===============================
// Dados do Paciente
// ===============================

export interface TrainingPlan {
  id: number;
  name: string;
  description: string;
  objective: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface TrainingDay {
  id: number;
  day_letter: string;
  name: string;
  weekday: string;
  focus_muscles: string;
  exercises: TrainingExercise[];
}

export interface TrainingExercise {
  id: number;
  name: string;
  sets: number;
  reps: string;
  load: string;
  rest_seconds: number;
  cadence: string;
  video_url?: string;
  notes?: string;
}

export async function getTrainingPlans(athleteId: number): Promise<ApiResponse<TrainingPlan[]>> {
  return apiRequest<TrainingPlan[]>(`/training-plans?athlete_id=${athleteId}`);
}

export async function getTrainingPlanComplete(planId: number): Promise<ApiResponse<any>> {
  return apiRequest<any>(`/training-plans/${planId}/complete`);
}

// ===============================
// Nutrição
// ===============================

export interface NutritionPlan {
  id: number;
  name: string;
  objective: string;
  start_date: string;
  status: string;
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
}

export async function getNutritionPlans(athleteId: number): Promise<ApiResponse<NutritionPlan[]>> {
  return apiRequest<NutritionPlan[]>(`/nutrition-plans?athlete_id=${athleteId}`);
}

export async function getNutritionPlanComplete(planId: number): Promise<ApiResponse<any>> {
  return apiRequest<any>(`/nutrition-plans/${planId}/complete`);
}

// ===============================
// Fisioterapia
// ===============================

export async function getPhysioTreatmentPlans(athleteId: number): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`/physio/treatment-plans/${athleteId}`);
}

export async function getPhysioSessions(athleteId: number): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`/physio/sessions/${athleteId}`);
}

export async function getPhysioProgress(athleteId: number): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`/physio/progress/${athleteId}`);
}

// ===============================
// Agendamentos
// ===============================

export interface Appointment {
  id: number;
  type: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  location: string;
}

export async function getAppointments(athleteId: number): Promise<ApiResponse<Appointment[]>> {
  return apiRequest<Appointment[]>(`/appointments?athlete_id=${athleteId}`);
}

// ===============================
// Perfil
// ===============================

export async function getAthleteProfile(userId: number, consultancyId: number): Promise<ApiResponse<any>> {
  return apiRequest<any>(`/athletes?user_id=${userId}&consultancy_id=${consultancyId}`);
}

export async function updateProfile(userId: number, data: any): Promise<ApiResponse<any>> {
  return apiRequest<any>(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
