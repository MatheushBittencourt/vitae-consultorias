import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings,
  LogOut,
  Dumbbell,
  Apple,
  Stethoscope,
  HeartPulse,
  Crown,
  ChevronRight,
  X,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { AdminView } from './AdminDashboard';
import { AdminUser } from './AdminLoginPage';
import { LogoIcon } from '../ui/Logo';
import { Avatar } from '../ui/Avatar';
import { NotificationBadge } from '../ui/Badge';

interface AdminSidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
  onLogout: () => void;
  adminUser: AdminUser;
  isOpen?: boolean;
  onClose?: () => void;
}

// Menu simplificado - foco no paciente
const menuItems = [
  { id: 'overview' as AdminView, label: 'Visão Geral', icon: LayoutDashboard, description: 'Dashboard e métricas' },
  { id: 'patients' as AdminView, label: 'Pacientes', icon: Users, description: 'Gerenciar pacientes' },
  { id: 'appointments' as AdminView, label: 'Agendamentos', icon: Calendar, description: 'Consultas e agenda' },
];

// Ferramentas (recursos globais)
const toolItems = [
  { id: 'library' as AdminView, label: 'Biblioteca', icon: BookOpen, module: null },
];

// Determinar o role/label baseado no role do usuário
const getRoleDisplay = (adminUser: AdminUser) => {
  switch (adminUser.role) {
    case 'admin':
      return { label: 'Administrador', icon: Crown, color: 'bg-purple-500' };
    case 'coach':
      return { label: 'Personal Trainer', icon: Dumbbell, color: 'bg-orange-500' };
    case 'nutritionist':
      return { label: 'Nutricionista', icon: Apple, color: 'bg-green-500' };
    case 'physio':
      return { label: 'Fisioterapeuta', icon: HeartPulse, color: 'bg-pink-500' };
    default:
      return { label: 'Profissional', icon: Sparkles, color: 'bg-zinc-500' };
  }
};

export function AdminSidebar({ currentView, onViewChange, onLogout, adminUser, isOpen = false, onClose }: AdminSidebarProps) {
  const roleDisplay = getRoleDisplay(adminUser);
  
  // Filtrar ferramentas baseado nos módulos habilitados
  const filterTools = () => {
    return toolItems.filter(item => {
      if (item.module === null) return true;
      const modules = adminUser.modules;
      if (!modules) return true;
      return modules[item.module as keyof typeof modules];
    });
  };

  const handleViewChange = (view: AdminView) => {
    onViewChange(view);
    onClose?.();
  };

  // Verificar se está em uma view de paciente (patient-detail ou suas sub-views)
  const isPatientView = currentView === 'patient-detail' || currentView === 'patients';

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
          w-72 lg:w-80 bg-zinc-900 text-white fixed h-screen flex flex-col z-50
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-5 lg:p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoIcon size="lg" />
              <div>
                <h1 className="font-bold text-white text-lg">VITAE</h1>
                <p className="text-xs text-white/50">Painel Profissional</p>
              </div>
            </div>
            {/* Botão fechar - apenas mobile */}
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
                name={adminUser.name} 
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{adminUser.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${roleDisplay.color}`} />
                  <span className="text-xs text-white/60">{roleDisplay.label}</span>
                </div>
              </div>
            </div>
            {adminUser.consultancyName && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Consultoria</p>
                <p className="text-sm text-white/80 truncate">{adminUser.consultancyName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 overflow-y-auto">
          {/* Menu Principal */}
          <div>
            <p className="px-4 text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
              Menu
            </p>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === 'patients' 
                  ? isPatientView 
                  : currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200 group
                      ${isActive
                        ? 'bg-lime-500 text-black shadow-lg shadow-lime-500/20'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-110'} transition-transform`} />
                    <div className="flex-1 text-left">
                      <span className="font-medium block">{item.label}</span>
                      <span className={`text-[11px] ${isActive ? 'text-black/60' : 'text-white/40'}`}>
                        {item.description}
                      </span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ferramentas */}
          {filterTools().length > 0 && (
            <div className="mt-6">
              <p className="px-4 text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                Ferramentas
              </p>
              <div className="space-y-1">
                {filterTools().map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleViewChange(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                        transition-all duration-200 group
                        ${isActive
                          ? 'bg-white/10 text-white'
                          : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 lg:p-4 border-t border-white/10">
          {/* Settings */}
          <button
            onClick={() => handleViewChange('settings')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2
              transition-all duration-200
              ${currentView === 'settings'
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white/80'
              }
            `}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configurações</span>
          </button>
          
          {/* Logout */}
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
