import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Impact } from './components/Impact';
import { Team } from './components/Team';
import { Method } from './components/Method';
import { PlatformPreview } from './components/PlatformPreview';
import { Testimonials } from './components/Testimonials';
import { Stats } from './components/Stats';
import { Contact } from './components/Contact';
import { VideoModal } from './components/VideoModal';
import { LoginPage, PatientUser } from './components/platform/LoginPage';
import { Dashboard } from './components/platform/Dashboard';
import { AdminLoginPage, AdminUser } from './components/admin/AdminLoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SuperAdminLoginPage, SuperAdminUser } from './components/superadmin/SuperAdminLoginPage';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { SignupPage } from './components/SignupPage';

type AppView = 'site' | 'login' | 'dashboard' | 'admin-login' | 'admin-dashboard' | 'superadmin-login' | 'superadmin-dashboard' | 'signup';

// Chaves do localStorage
const STORAGE_KEYS = {
  PATIENT: 'vitae_patient_session',
  ADMIN: 'vitae_admin_session',
  SUPERADMIN: 'vitae_superadmin_session',
  VIEW: 'vitae_current_view'
};

// URL do vídeo de demonstração - quando tiver o vídeo, coloque a URL do YouTube aqui
// Exemplo: const DEMO_VIDEO_URL = 'https://www.youtube.com/watch?v=SEU_VIDEO_ID';
const DEMO_VIDEO_URL = ''; // Deixe vazio para mostrar placeholder

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('site');
  const [patientUser, setPatientUser] = useState<PatientUser | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [superAdminUser, setSuperAdminUser] = useState<SuperAdminUser | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Restaurar sessão do localStorage ao iniciar
  useEffect(() => {
    const restoreSession = () => {
      try {
        // Verificar se há sessão de superadmin
        const savedSuperAdmin = localStorage.getItem(STORAGE_KEYS.SUPERADMIN);
        if (savedSuperAdmin) {
          const user = JSON.parse(savedSuperAdmin);
          setSuperAdminUser(user);
          setCurrentView('superadmin-dashboard');
          setIsLoading(false);
          return;
        }

        // Verificar se há sessão de admin
        const savedAdmin = localStorage.getItem(STORAGE_KEYS.ADMIN);
        if (savedAdmin) {
          const user = JSON.parse(savedAdmin);
          setAdminUser(user);
          setCurrentView('admin-dashboard');
          setIsLoading(false);
          return;
        }

        // Verificar se há sessão de paciente
        const savedPatient = localStorage.getItem(STORAGE_KEYS.PATIENT);
        if (savedPatient) {
          const user = JSON.parse(savedPatient);
          setPatientUser(user);
          setCurrentView('dashboard');
          setIsLoading(false);
          return;
        }

        // Nenhuma sessão encontrada
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
        // Limpar dados corrompidos
        localStorage.removeItem(STORAGE_KEYS.PATIENT);
        localStorage.removeItem(STORAGE_KEYS.ADMIN);
        localStorage.removeItem(STORAGE_KEYS.SUPERADMIN);
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Verificar hash da URL para rota secreta do super admin
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#superadmin') {
        setCurrentView('superadmin-login');
      }
    };
    
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Patient login handlers
  const handleLoginClick = () => {
    setCurrentView('login');
  };

  const handleLoginSuccess = (patient: PatientUser) => {
    setPatientUser(patient);
    setCurrentView('dashboard');
    // Salvar sessão no localStorage
    localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(patient));
  };

  const handleLogout = () => {
    setPatientUser(null);
    setCurrentView('site');
    // Limpar sessão do localStorage
    localStorage.removeItem(STORAGE_KEYS.PATIENT);
  };

  // Admin login handlers
  const handleAdminLoginClick = () => {
    setCurrentView('admin-login');
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setCurrentView('admin-dashboard');
    // Salvar sessão no localStorage
    localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(user));
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setCurrentView('site');
    // Limpar sessão do localStorage
    localStorage.removeItem(STORAGE_KEYS.ADMIN);
  };

  // Super Admin handlers
  const handleSuperAdminLoginSuccess = (user: SuperAdminUser) => {
    setSuperAdminUser(user);
    setCurrentView('superadmin-dashboard');
    // Salvar sessão no localStorage
    localStorage.setItem(STORAGE_KEYS.SUPERADMIN, JSON.stringify(user));
    // Limpar o hash da URL
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleSuperAdminLogout = () => {
    setSuperAdminUser(null);
    setCurrentView('site');
    // Limpar sessão do localStorage
    localStorage.removeItem(STORAGE_KEYS.SUPERADMIN);
  };

  // Signup handlers
  const handleSignupClick = (planId?: string) => {
    setSelectedPlanId(planId);
    setCurrentView('signup');
  };

  const handleSignupSuccess = () => {
    // Após cadastro bem-sucedido, redireciona para login do admin
    setCurrentView('admin-login');
  };

  // Mostrar loading enquanto restaura sessão
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Render Signup page
  if (currentView === 'signup') {
    return (
      <SignupPage 
        onBack={() => setCurrentView('site')} 
        onSuccess={handleSignupSuccess}
        initialPlanId={selectedPlanId}
      />
    );
  }

  // Render Super Admin pages
  if (currentView === 'superadmin-login') {
    return (
      <SuperAdminLoginPage 
        onLoginSuccess={handleSuperAdminLoginSuccess} 
        onBack={() => {
          setCurrentView('site');
          window.history.replaceState(null, '', window.location.pathname);
        }} 
      />
    );
  }

  if (currentView === 'superadmin-dashboard' && superAdminUser) {
    return <SuperAdminDashboard onLogout={handleSuperAdminLogout} user={superAdminUser} />;
  }

  // Render login pages
  if (currentView === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onBack={() => setCurrentView('site')} />;
  }

  if (currentView === 'admin-login') {
    return <AdminLoginPage onLoginSuccess={handleAdminLoginSuccess} onBack={() => setCurrentView('site')} />;
  }

  // Render dashboards
  if (currentView === 'dashboard' && patientUser) {
    return <Dashboard onLogout={handleLogout} patient={patientUser} />;
  }

  if (currentView === 'admin-dashboard' && adminUser) {
    return <AdminDashboard onLogout={handleAdminLogout} adminUser={adminUser} />;
  }

  // Render main site
  return (
    <div className="min-h-screen bg-white">
      <Header 
        onLoginClick={handleLoginClick} 
        onAdminClick={handleAdminLoginClick} 
        onSuperAdminClick={() => setCurrentView('superadmin-login')}
        onSignupClick={() => handleSignupClick()}
      />
      <Hero 
        onSignupClick={() => handleSignupClick()} 
        onWatchDemo={() => setIsVideoModalOpen(true)}
      />
      <Impact />
      <Team />
      <Method />
      <PlatformPreview />
      <Testimonials />
      <Stats onSignupClick={handleSignupClick} />
      <Contact />
      
      {/* Modal de Vídeo de Demonstração */}
      <VideoModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={DEMO_VIDEO_URL || undefined}
      />
    </div>
  );
}
