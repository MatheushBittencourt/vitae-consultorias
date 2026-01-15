import { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-zinc-100 flex">
      <AdminSidebar 
        currentView={currentView === 'patient-detail' ? 'patients' : currentView}
        onViewChange={setCurrentView}
        onLogout={onLogout}
        adminUser={adminUser}
      />
      <main className="flex-1 ml-80">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
