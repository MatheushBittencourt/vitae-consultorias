import { useState } from 'react';
import { Menu, Dumbbell, Apple, ArrowLeft } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { PatientsList } from './PatientsList';
import { PatientDetail } from './PatientDetail';
import { AdminAppointmentsSection } from './AdminAppointmentsSection';
import { AdminSettingsSection } from './AdminSettingsSection';
import { AdminUser } from './AdminLoginPage';
import { RecipeManager } from '../nutrition';
import { FoodLibrary } from './FoodLibrary';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';

type LibrarySubView = 'main' | 'exercises' | 'foods';

// Componente para Biblioteca
function LibrarySection({ consultancyId }: { consultancyId: number }) {
  const [subView, setSubView] = useState<LibrarySubView>('main');

  if (subView === 'foods') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSubView('main')}
          className="flex items-center gap-2 text-zinc-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Biblioteca
        </button>
        <FoodLibrary consultancyId={consultancyId} />
      </div>
    );
  }

  if (subView === 'exercises') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSubView('main')}
          className="flex items-center gap-2 text-zinc-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Biblioteca
        </button>
        <Card className="p-8">
          <EmptyState
            icon="training"
            title="Biblioteca de Exercícios"
            description="Em breve você poderá gerenciar exercícios com vídeos, descrições e categorias."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-2">
            <span className="text-purple-500">BIBLIOTECA</span>
          </h1>
          <p className="text-lg lg:text-xl text-zinc-600">Banco de exercícios, alimentos e templates</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer group hover:border-lime-500"
          onClick={() => setSubView('exercises')}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-lime-500/10 rounded-2xl flex items-center justify-center group-hover:bg-lime-500/20 transition-colors">
              <Dumbbell className="w-7 h-7 text-lime-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900">Exercícios</h3>
              <p className="text-zinc-500">Banco de exercícios global</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-600">
            Acesse e gerencie o banco de exercícios com vídeos, descrições e categorias.
          </p>
        </Card>
        
        <Card 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer group hover:border-orange-500"
          onClick={() => setSubView('foods')}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <Apple className="w-7 h-7 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900">Alimentos</h3>
              <p className="text-zinc-500">Tabela TACO e personalizados</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-600">
            Consulte informações nutricionais e adicione alimentos personalizados.
          </p>
        </Card>
      </div>
    </div>
  );
}

interface AdminDashboardProps {
  onLogout: () => void;
  adminUser: AdminUser;
}

export type AdminView = 
  | 'overview' 
  | 'patients' 
  | 'patient-detail'
  | 'appointments' 
  | 'settings'
  | 'recipes'
  | 'library';

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
          <PatientDetail 
            patient={selectedPatient} 
            onBack={handleBackToPatients} 
            consultancyId={consultancyId}
            adminUser={adminUser}
          />
        ) : (
          <PatientsList onSelectPatient={handleSelectPatient} consultancyId={consultancyId} />
        );
      case 'appointments':
        return <AdminAppointmentsSection consultancyId={consultancyId} />;
      case 'recipes':
        return <RecipeManager consultancyId={consultancyId} userId={adminUser.id} />;
      case 'library':
        return <LibrarySection consultancyId={consultancyId} />;
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
      'patient-detail': selectedPatient?.name || 'Paciente',
      appointments: 'Agendamentos',
      settings: 'Configurações',
      recipes: 'Receitas',
      library: 'Biblioteca'
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
