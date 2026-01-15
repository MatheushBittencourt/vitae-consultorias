import { 
  LayoutDashboard, 
  Stethoscope, 
  Apple, 
  Dumbbell, 
  HeartPulse, 
  Calendar, 
  TrendingUp,
  LogOut,
  User
} from 'lucide-react';
import { DashboardView } from './Dashboard';
import { PatientUser, ActiveModule } from './LoginPage';

interface DashboardSidebarProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  onLogout: () => void;
  patient: PatientUser;
}

interface MenuItem {
  id: DashboardView;
  label: string;
  icon: typeof LayoutDashboard;
  module?: ActiveModule; // Se definido, só aparece se o módulo estiver ativo
}

const allMenuItems: MenuItem[] = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'medical', label: 'Medicina', icon: Stethoscope, module: 'medical' },
  { id: 'nutrition', label: 'Nutrição', icon: Apple, module: 'nutrition' },
  { id: 'training', label: 'Treinamento', icon: Dumbbell, module: 'training' },
  { id: 'rehab', label: 'Reabilitação', icon: HeartPulse, module: 'rehab' },
  { id: 'appointments', label: 'Agendamentos', icon: Calendar },
  { id: 'progress', label: 'Progresso', icon: TrendingUp },
];

export function DashboardSidebar({ currentView, onViewChange, onLogout, patient }: DashboardSidebarProps) {
  const activeModules = patient.activeModules || [];
  
  // Filtrar menu items baseado nos módulos ativos
  const menuItems = allMenuItems.filter(item => {
    // Se não tem módulo associado, sempre mostra
    if (!item.module) return true;
    // Se tem módulo associado, só mostra se estiver ativo
    return activeModules.includes(item.module);
  });

  // Se nenhum módulo está ativo, mostrar todos (para não deixar o menu vazio)
  const displayItems = activeModules.length === 0 ? allMenuItems : menuItems;

  // Descrição do plano baseado nos módulos ativos
  const getPlanDescription = () => {
    if (activeModules.length === 0) {
      return 'Aguardando ativação';
    }
    
    const moduleNames: Record<ActiveModule, string> = {
      training: 'Personal',
      nutrition: 'Nutrição',
      medical: 'Medicina',
      rehab: 'Reabilitação'
    };
    
    const names = activeModules.map(m => moduleNames[m]);
    if (names.length === 4) return 'Plano Completo';
    if (names.length === 1) return names[0];
    return names.join(' + ');
  };

  return (
    <aside className="w-80 bg-black text-white fixed h-screen flex flex-col">
      {/* Logo */}
      <div className="p-8 border-b border-white/10">
        <h1 className="text-3xl font-bold tracking-tighter">VITAE</h1>
        <p className="text-sm text-white/60 mt-2">Plataforma do Paciente</p>
      </div>

      {/* User Info */}
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-lime-500 rounded-full flex items-center justify-center overflow-hidden">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patient.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-black" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg truncate">{patient.name}</div>
            <div className="text-sm text-white/60">{patient.sport} • {patient.club}</div>
          </div>
        </div>
        {/* Plano ativo */}
        <div className="mt-4 px-3 py-2 bg-lime-500/20 border border-lime-500/30 rounded">
          <div className="text-xs text-lime-400 font-bold tracking-wider">SEU PLANO</div>
          <div className="text-sm text-white font-medium">{getPlanDescription()}</div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {displayItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isDisabled = item.module && activeModules.length > 0 && !activeModules.includes(item.module);
            
            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && onViewChange(item.id)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded transition-colors ${
                  isDisabled
                    ? 'text-white/30 cursor-not-allowed'
                    : isActive
                    ? 'bg-lime-500 text-black font-bold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="tracking-wide">{item.label}</span>
                {isDisabled && (
                  <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded">Bloqueado</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-6 py-4 rounded text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="tracking-wide">Sair</span>
        </button>
      </div>
    </aside>
  );
}
