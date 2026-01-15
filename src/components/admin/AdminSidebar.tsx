import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings,
  LogOut,
  Shield,
  Dumbbell,
  Apple,
  Stethoscope,
  HeartPulse,
  Crown
} from 'lucide-react';
import { AdminView } from './AdminDashboard';
import { AdminUser } from './AdminLoginPage';

interface AdminSidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
  onLogout: () => void;
  adminUser: AdminUser;
}

// Menu items com indicação de qual módulo pertence
const menuItems = [
  { id: 'overview' as AdminView, label: 'Visão Geral', icon: LayoutDashboard, module: null },
  { id: 'patients' as AdminView, label: 'Pacientes', icon: Users, module: null },
  { id: 'training' as AdminView, label: 'Treinos', icon: Dumbbell, module: 'training' },
  { id: 'nutrition' as AdminView, label: 'Nutrição', icon: Apple, module: 'nutrition' },
  { id: 'medical' as AdminView, label: 'Médico', icon: Stethoscope, module: 'medical' },
  { id: 'rehab' as AdminView, label: 'Reabilitação', icon: HeartPulse, module: 'rehab' },
  { id: 'appointments' as AdminView, label: 'Agendamentos', icon: Calendar, module: null },
  { id: 'settings' as AdminView, label: 'Configurações', icon: Settings, module: null },
];

// Determinar o role/label baseado no role do usuário
const getRoleDisplay = (adminUser: AdminUser) => {
  // Primeiro, verificar o role direto do usuário
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
      return { label: 'Profissional', icon: Shield, color: 'bg-zinc-500' };
  }
};

export function AdminSidebar({ currentView, onViewChange, onLogout, adminUser }: AdminSidebarProps) {
  const roleDisplay = getRoleDisplay(adminUser);
  const RoleIcon = roleDisplay.icon;
  
  // Filtrar menu items baseado nos módulos habilitados
  const filteredMenuItems = menuItems.filter(item => {
    // Itens sem módulo sempre aparecem
    if (item.module === null) return true;
    
    // Verificar se o módulo está habilitado
    const modules = adminUser.modules;
    if (!modules) return true; // Se não tem info de módulos, mostra tudo
    
    return modules[item.module as keyof typeof modules];
  });

  return (
    <aside className="w-80 bg-zinc-900 text-white fixed h-screen flex flex-col">
      {/* Logo */}
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-lime-500" />
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">VITAE</h1>
            <p className="text-sm text-white/60">Painel Profissional</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 ${roleDisplay.color} rounded-full flex items-center justify-center`}>
            <RoleIcon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg truncate">{adminUser.name}</div>
            <div className="text-sm text-lime-500">{roleDisplay.label}</div>
            {adminUser.consultancyName && (
              <div className="text-xs text-white/50 truncate">{adminUser.consultancyName}</div>
            )}
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded transition-colors ${
                  isActive
                    ? 'bg-lime-500 text-black font-bold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="tracking-wide">{item.label}</span>
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
