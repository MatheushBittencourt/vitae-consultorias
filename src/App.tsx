import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Impact } from './components/Impact';
import { Team } from './components/Team';
import { Method } from './components/Method';
import { Stats } from './components/Stats';
import { Contact } from './components/Contact';
import { LoginPage, PatientUser } from './components/platform/LoginPage';
import { Dashboard } from './components/platform/Dashboard';
import { AdminLoginPage, AdminUser } from './components/admin/AdminLoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SuperAdminLoginPage, SuperAdminUser } from './components/superadmin/SuperAdminLoginPage';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { SignupPage } from './components/SignupPage';

type AppView = 'site' | 'login' | 'dashboard' | 'admin-login' | 'admin-dashboard' | 'superadmin-login' | 'superadmin-dashboard' | 'signup';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('site');
  const [patientUser, setPatientUser] = useState<PatientUser | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [superAdminUser, setSuperAdminUser] = useState<SuperAdminUser | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);

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
  };

  const handleLogout = () => {
    setPatientUser(null);
    setCurrentView('site');
  };

  // Admin login handlers
  const handleAdminLoginClick = () => {
    setCurrentView('admin-login');
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setCurrentView('admin-dashboard');
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setCurrentView('site');
  };

  // Super Admin handlers
  const handleSuperAdminLoginSuccess = (user: SuperAdminUser) => {
    setSuperAdminUser(user);
    setCurrentView('superadmin-dashboard');
    // Limpar o hash da URL
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleSuperAdminLogout = () => {
    setSuperAdminUser(null);
    setCurrentView('site');
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
      <Hero onSignupClick={() => handleSignupClick()} />
      <Impact />
      <Team />
      <Method />
      <Stats onSignupClick={handleSignupClick} />
      <Contact />
    </div>
  );
}
