import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  getAuthToken, 
  getUserData,
  setUserData,
  LoginResponse 
} from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  athleteId?: number;
  consultancyId?: number;
  appRole?: 'professional' | 'patient'; // Role selecionado no app
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isProfessional: boolean;
  login: (email: string, password: string, appRole?: 'professional' | 'patient') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar token ao iniciar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        const userData = await getUserData();
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, appRole: 'professional' | 'patient' = 'patient') => {
    try {
      const response = await apiLogin(email, password, appRole);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data?.user) {
        const userData = { ...response.data.user, appRole };
        setUser(userData);
        await setUserData(userData);
        return { success: true };
      }

      return { success: false, error: 'Erro desconhecido' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      setUserData(updatedUser);
    }
  };

  // Verifica se é profissional (pelo role do backend ou pelo appRole selecionado)
  const isProfessional = user?.role === 'admin' || user?.role === 'professional' || user?.appRole === 'professional';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isProfessional,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
