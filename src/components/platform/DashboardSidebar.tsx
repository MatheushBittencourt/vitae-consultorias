import { 
  LayoutDashboard, 
  Stethoscope, 
  Apple, 
  Dumbbell, 
  HeartPulse, 
  Calendar, 
  TrendingUp,
  LogOut,
  X,
  ChevronRight,
  Lock
} from 'lucide-react';
import { DashboardView } from './Dashboard';
import { PatientUser, ActiveModule } from './LoginPage';
import { LogoIcon } from '../ui/Logo';
import { Avatar } from '../ui/Avatar';

interface DashboardSidebarProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  onLogout: () => void;
  patient: PatientUser;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: DashboardView;
  label: string;
  icon: typeof LayoutDashboard;
  module?: ActiveModule;
}

const menuSections = [
  {
    title: 'Principal',
    items: [
      { id: 'overview' as DashboardView, label: 'Visão Geral', icon: LayoutDashboard },
      { id: 'appointments' as DashboardView, label: 'Agendamentos', icon: Calendar },
      { id: 'progress' as DashboardView, label: 'Progresso', icon: TrendingUp },
    ]
  },
  {
    title: 'Seus Módulos',
    items: [
      { id: 'training' as DashboardView, label: 'Treinamento', icon: Dumbbell, module: 'training' as ActiveModule },
      { id: 'nutrition' as DashboardView, label: 'Nutrição', icon: Apple, module: 'nutrition' as ActiveModule },
      { id: 'medical' as DashboardView, label: 'Medicina', icon: Stethoscope, module: 'medical' as ActiveModule },
      { id: 'rehab' as DashboardView, label: 'Fisioterapia', icon: HeartPulse, module: 'rehab' as ActiveModule },
    ]
  }
];

export function DashboardSidebar({ currentView, onViewChange, onLogout, patient, isOpen, onClose }: DashboardSidebarProps) {
  const activeModules = patient.activeModules || [];
  
  // Descrição do plano baseado nos módulos ativos
  const getPlanDescription = () => {
    if (activeModules.length === 0) {
      return 'Aguardando ativação';
    }
    
    const moduleNames: Record<ActiveModule, string> = {
      training: 'Personal',
      nutrition: 'Nutrição',
      medical: 'Medicina',
      rehab: 'Fisioterapia'
    };
    
    const names = activeModules.map(m => moduleNames[m]);
    if (names.length === 4) return 'Plano Completo';
    if (names.length === 1) return names[0];
    if (names.length === 2) return names.join(' + ');
    return `${names.length} módulos ativos`;
  };

  const handleViewChange = (view: DashboardView) => {
    onViewChange(view);
    onClose();
  };

  return (
    <>
      {/* Overlay para mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full w-72 lg:w-80 bg-black text-white flex flex-col z-50
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-5 lg:p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoIcon size="lg" />
              <div>
                <h1 className="font-bold text-white text-lg">VITAE</h1>
                <p className="text-xs text-white/50">Área do Paciente</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 lg:p-5 border-b border-white/10">
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Avatar 
                name={patient.name} 
                src={patient.avatarUrl}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{patient.name}</p>
                <p className="text-xs text-white/60 truncate">
                  {patient.sport}{patient.club && ` • ${patient.club}`}
                </p>
              </div>
            </div>
            
            {/* Plan Badge */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Seu Plano</p>
                  <p className="text-sm text-lime-400 font-medium">{getPlanDescription()}</p>
                </div>
                {activeModules.length > 0 && (
                  <div className="flex items-center gap-0.5">
                    {activeModules.map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-lime-500" />
                    ))}
                    {Array.from({ length: 4 - activeModules.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 overflow-y-auto">
          {menuSections.map((section, idx) => (
            <div key={section.title} className={idx > 0 ? 'mt-6' : ''}>
              <p className="px-4 text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  const isLocked = item.module && activeModules.length > 0 && !activeModules.includes(item.module);
                  const isModuleItem = !!item.module;
                  
                  // Se é item de módulo e não há módulos ativos, mostrar todos
                  const showItem = !isModuleItem || activeModules.length === 0 || activeModules.includes(item.module!);
                  
                  if (!showItem && isModuleItem) {
                    // Mostrar como bloqueado
                    return (
                      <div
                        key={item.id}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                   text-white/30 cursor-not-allowed"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium flex-1 text-left">{item.label}</span>
                        <Lock className="w-4 h-4" />
                      </div>
                    );
                  }
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => !isLocked && handleViewChange(item.id)}
                      disabled={isLocked}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl
                        transition-all duration-200 group
                        ${isActive
                          ? 'bg-lime-500 text-black shadow-lg shadow-lime-500/20'
                          : isLocked
                          ? 'text-white/30 cursor-not-allowed'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-110'} transition-transform`} />
                      <span className="font-medium flex-1 text-left">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4" />}
                      {isLocked && <Lock className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 lg:p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                       text-white/60 hover:bg-red-500/10 hover:text-red-400
                       transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
