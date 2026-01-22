import { useState } from 'react';
import { Menu } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardOverview } from './DashboardOverview';
import { MedicalSection } from './MedicalSection';
import { NutritionSection } from './NutritionSection';
import { TrainingSection } from './TrainingSection';
import { RehabSection } from './RehabSection';
import { AppointmentsSection } from './AppointmentsSection';
import { ProgressSection } from './ProgressSection';
import { PatientUser } from './LoginPage';

interface DashboardProps {
  onLogout: () => void;
  patient: PatientUser;
}

export type DashboardView = 
  | 'overview' 
  | 'medical' 
  | 'nutrition' 
  | 'training' 
  | 'rehab' 
  | 'appointments' 
  | 'progress';

export function Dashboard({ onLogout, patient }: DashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return <DashboardOverview onNavigate={setCurrentView} patientName={patient.name} athleteId={patient.athleteId} activeModules={patient.activeModules || []} />;
      case 'medical':
        return <MedicalSection athleteId={patient.athleteId} />;
      case 'nutrition':
        return <NutritionSection athleteId={patient.athleteId} primaryColor={patient.primaryColor} />;
      case 'training':
        return <TrainingSection athleteId={patient.athleteId} primaryColor={patient.primaryColor} />;
      case 'rehab':
        return <RehabSection athleteId={patient.athleteId} />;
      case 'appointments':
        return <AppointmentsSection userId={patient.id} />;
      case 'progress':
        return <ProgressSection athleteId={patient.athleteId} />;
      default:
        return <DashboardOverview onNavigate={setCurrentView} patientName={patient.name} athleteId={patient.athleteId} activeModules={patient.activeModules || []} />;
    }
  };

  // Título da view atual para o header mobile
  const getViewTitle = () => {
    const titles: Record<DashboardView, string> = {
      overview: 'Visão Geral',
      medical: 'Medicina',
      nutrition: 'Nutrição',
      training: 'Treinamento',
      rehab: 'Reabilitação',
      appointments: 'Agendamentos',
      progress: 'Progresso'
    };
    return titles[currentView] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <DashboardSidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onLogout={onLogout}
        patient={patient}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Header mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black text-white flex items-center justify-between px-4 z-30">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg">{getViewTitle()}</h1>
        <div className="w-10" /> {/* Spacer para centralizar o título */}
      </header>
      
      <main className="lg:ml-80 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
