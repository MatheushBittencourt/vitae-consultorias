import { useState } from 'react';
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

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return <DashboardOverview onNavigate={setCurrentView} patientName={patient.name} athleteId={patient.athleteId} activeModules={patient.activeModules || []} />;
      case 'medical':
        return <MedicalSection athleteId={patient.athleteId} />;
      case 'nutrition':
        return <NutritionSection athleteId={patient.athleteId} />;
      case 'training':
        return <TrainingSection athleteId={patient.athleteId} />;
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

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <DashboardSidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onLogout={onLogout}
        patient={patient}
      />
      <main className="flex-1 ml-80">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
