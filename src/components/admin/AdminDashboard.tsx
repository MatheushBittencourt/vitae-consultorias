import { useState } from 'react';
import { Menu } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { PatientsList } from './PatientsList';
import { PatientDetail } from './PatientDetail';
import { AdminTrainingSection } from './AdminTrainingSection';
import { AdminNutritionSection } from './AdminNutritionSection';
import { AdminMedicalSection } from './AdminMedicalSection';
import { AdminRehabSection } from './AdminRehabSection';
import { AdminAppointmentsSection } from './AdminAppointmentsSection';
import { AdminSettingsSection } from './AdminSettingsSection';
import { AdminUser } from './AdminLoginPage';

interface AdminDashboardProps {
  onLogout: () => void;
  adminUser: AdminUser;
}

export type AdminView = 
  | 'overview' 
  | 'patients' 
  | 'patient-detail'
  | 'training'
  | 'nutrition'
  | 'medical'
  | 'rehab'
  | 'appointments' 
  | 'settings';

export interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  sport: string;
  position: string;
  club: string;
  birthDate: string;
  height: number;
  weight: number;
  goals: string;
  status: 'active' | 'inactive' | 'pending';
  daysInProgram: number;
  adherence: number;
  avatarUrl?: string;
}

export function AdminDashboard({ onLogout, adminUser }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView('patient-detail');
  };

  const handleBackToPatients = () => {
    setSelectedPatient(null);
    setCurrentView('patients');
  };

  const consultancyId = adminUser.consultancyId;

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return <AdminOverview onNavigate={setCurrentView} onSelectPatient={handleSelectPatient} consultancyId={consultancyId} />;
      case 'patients':
        return <PatientsList onSelectPatient={handleSelectPatient} consultancyId={consultancyId} />;
      case 'patient-detail':
        return selectedPatient ? (
          <PatientDetail patient={selectedPatient} onBack={handleBackToPatients} consultancyId={consultancyId} />
        ) : (
          <PatientsList onSelectPatient={handleSelectPatient} consultancyId={consultancyId} />
        );
      case 'training':
        return <AdminTrainingSection consultancyId={consultancyId} adminUser={adminUser} />;
      case 'nutrition':
        return <AdminNutritionSection onSelectPatient={handleSelectPatient} consultancyId={consultancyId} adminUserId={adminUser.id} />;
      case 'medical':
        return <AdminMedicalSection onSelectPatient={handleSelectPatient} consultancyId={consultancyId} />;
      case 'rehab':
        return <AdminRehabSection onSelectPatient={handleSelectPatient} consultancyId={consultancyId} />;
      case 'appointments':
        return <AdminAppointmentsSection consultancyId={consultancyId} />;
      case 'settings':
        return <AdminSettingsSection adminUser={adminUser} />;
      default:
        return <AdminOverview onNavigate={setCurrentView} onSelectPatient={handleSelectPatient} consultancyId={consultancyId} />;
    }
  };

  // Título da view atual para o header mobile
  const getViewTitle = () => {
    const titles: Record<AdminView, string> = {
      overview: 'Visão Geral',
      patients: 'Pacientes',
      'patient-detail': 'Detalhes do Paciente',
      training: 'Treinos',
      nutrition: 'Nutrição',
      medical: 'Médico',
      rehab: 'Reabilitação',
      appointments: 'Agendamentos',
      settings: 'Configurações'
    };
    return titles[currentView] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-zinc-100 lg:flex">
      <AdminSidebar 
        currentView={currentView === 'patient-detail' ? 'patients' : currentView}
        onViewChange={setCurrentView}
        onLogout={onLogout}
        adminUser={adminUser}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Header mobile - apenas em telas pequenas */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-900 text-white flex items-center justify-between px-4 z-30">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg">{getViewTitle()}</h1>
        <div className="w-10" />
      </header>
      
      {/* Main content - desktop usa flex-1 ml-80, mobile usa pt-16 */}
      <main className="flex-1 pt-16 lg:pt-0 lg:ml-80">
        <div className="p-4 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
