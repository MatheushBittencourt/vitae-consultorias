import { useState, useEffect } from 'react';
import { 
  Crown, 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Dumbbell,
  Apple,
  Stethoscope,
  HeartPulse,
  Check,
  X,
  Loader2,
  Search,
  LayoutDashboard,
  Settings,
  Eye,
  ArrowLeft,
  Mail,
  Activity,
  Clock,
  UserCheck,
  ChevronRight,
  BarChart3,
  PieChart,
  User,
  Lock,
  Save,
  Shield,
  Menu
} from 'lucide-react';
import { SuperAdminUser } from './SuperAdminLoginPage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Consultancy {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string;
  logo_url: string;
  plan: 'basic' | 'professional' | 'enterprise';
  price_monthly: number;
  has_training: boolean;
  has_nutrition: boolean;
  has_medical: boolean;
  has_rehab: boolean;
  max_professionals: number;
  max_patients: number;
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  trial_ends_at: string;
  created_at: string;
  professionals_count?: number;
  patients_count?: number;
}

interface ConsultancyDetails extends Consultancy {
  professionals: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string;
    is_active: boolean;
    created_at: string;
  }>;
  patients: Array<{
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
    sport: string;
    club: string;
  }>;
  stats: {
    trainingPlans: number;
    nutritionPlans: number;
    appointments: number;
    professionalsCount: number;
    patientsCount: number;
  };
  recentActivity: Array<{
    name: string;
    email: string;
    role: string;
    last_activity: string;
  }>;
}

interface Stats {
  totalConsultancies: number;
  activeConsultancies: number;
  trialConsultancies: number;
  suspendedConsultancies: number;
  cancelledConsultancies: number;
  monthlyRevenue: number;
  totalProfessionals: number;
  totalPatients: number;
  modulesCount: {
    training: number;
    nutrition: number;
    medical: number;
    rehab: number;
  };
  monthlyGrowth: Array<{ month: string; count: number }>;
  topConsultancies: Array<{
    id: number;
    name: string;
    status: string;
    price_monthly: number;
    patients_count: number;
    professionals_count: number;
  }>;
  recentConsultancies: Array<{
    id: number;
    name: string;
    email: string;
    status: string;
    created_at: string;
    price_monthly: number;
  }>;
  planDistribution: Array<{ plan: string; count: number }>;
}

type View = 'overview' | 'consultancies' | 'settings' | 'consultancy-details';

interface SuperAdminDashboardProps {
  onLogout: () => void;
  user: SuperAdminUser;
}

export function SuperAdminDashboard({ onLogout, user }: SuperAdminDashboardProps) {
  const [currentView, setCurrentView] = useState<View>('overview');
  const [consultancies, setConsultancies] = useState<Consultancy[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingConsultancy, setEditingConsultancy] = useState<Consultancy | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedConsultancy, setSelectedConsultancy] = useState<ConsultancyDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Settings state
  const [settingsTab, setSettingsTab] = useState<'profile' | 'security'>('profile');
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    plan: 'basic' as Consultancy['plan'],
    price_monthly: 297,
    has_training: true,
    has_nutrition: true,
    has_medical: true,
    has_rehab: true,
    max_professionals: 5,
    max_patients: 50,
    status: 'trial' as Consultancy['status'],
    trial_ends_at: ''
  });

  const menuItems = [
    { id: 'overview' as View, label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'consultancies' as View, label: 'Consultorias', icon: Building2 },
    { id: 'settings' as View, label: 'Configurações', icon: Settings },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [consultanciesRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/superadmin/consultancies`),
        fetch(`${API_URL}/superadmin/stats`)
      ]);
      
      const consultanciesData = await consultanciesRes.json();
      const statsData = await statsRes.json();
      
      setConsultancies(consultanciesData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConsultancyDetails = async (id: number) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(`${API_URL}/superadmin/consultancies/${id}/details`);
      const data = await response.json();
      setSelectedConsultancy(data);
      setCurrentView('consultancy-details');
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const openAddModal = () => {
    setEditingConsultancy(null);
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);
    setForm({
      name: '',
      slug: '',
      email: '',
      phone: '',
      plan: 'basic',
      price_monthly: 297,
      has_training: true,
      has_nutrition: true,
      has_medical: true,
      has_rehab: true,
      max_professionals: 5,
      max_patients: 50,
      status: 'trial',
      trial_ends_at: trialEnd.toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const openEditModal = (consultancy: Consultancy) => {
    setEditingConsultancy(consultancy);
    setForm({
      name: consultancy.name,
      slug: consultancy.slug,
      email: consultancy.email,
      phone: consultancy.phone || '',
      plan: consultancy.plan,
      price_monthly: consultancy.price_monthly,
      has_training: consultancy.has_training,
      has_nutrition: consultancy.has_nutrition,
      has_medical: consultancy.has_medical,
      has_rehab: consultancy.has_rehab,
      max_professionals: consultancy.max_professionals,
      max_patients: consultancy.max_patients,
      status: consultancy.status,
      trial_ends_at: consultancy.trial_ends_at?.split('T')[0] || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingConsultancy 
        ? `${API_URL}/superadmin/consultancies/${editingConsultancy.id}`
        : `${API_URL}/superadmin/consultancies`;
      
      const response = await fetch(url, {
        method: editingConsultancy ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setShowModal(false);
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await fetch(`${API_URL}/superadmin/consultancies/${deletingId}`, {
        method: 'DELETE'
      });
      setShowDeleteConfirm(false);
      setDeletingId(null);
      loadData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const filteredConsultancies = consultancies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Consultancy['status']) => {
    const styles = {
      active: 'bg-lime-500 text-black',
      trial: 'bg-yellow-500 text-black',
      suspended: 'bg-red-500 text-white',
      cancelled: 'bg-zinc-500 text-white'
    };
    const labels = {
      active: 'ATIVO',
      trial: 'TRIAL',
      suspended: 'SUSPENSO',
      cancelled: 'CANCELADO'
    };
    return (
      <span className={`px-2 py-1 text-xs font-bold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getPlanBadge = (plan: Consultancy['plan']) => {
    const styles = {
      basic: 'bg-zinc-200 text-zinc-800',
      professional: 'bg-blue-500 text-white',
      enterprise: 'bg-black text-lime-500 border border-lime-500'
    };
    const labels = {
      basic: 'BASIC',
      professional: 'PRO',
      enterprise: 'ENTERPRISE'
    };
    return (
      <span className={`px-2 py-1 text-xs font-bold ${styles[plan]}`}>
        {labels[plan]}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700',
      coach: 'bg-orange-100 text-orange-700',
      nutritionist: 'bg-green-100 text-green-700',
      physio: 'bg-pink-100 text-pink-700',
      athlete: 'bg-blue-100 text-blue-700'
    };
    const labels: Record<string, string> = {
      admin: 'Admin',
      coach: 'Personal',
      nutritionist: 'Nutricionista',
      physio: 'Fisio',
      athlete: 'Paciente'
    };
    return (
      <span className={`px-2 py-1 text-xs font-bold ${styles[role] || 'bg-zinc-100 text-zinc-700'}`}>
        {labels[role] || role}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Render Consultancy Details View
  const renderConsultancyDetails = () => {
    if (!selectedConsultancy) return null;

    return (
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
          <button
            onClick={() => {
              setCurrentView('consultancies');
              setSelectedConsultancy(null);
            }}
            className="self-start p-2 hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-black text-lime-500 flex items-center justify-center font-bold text-lg lg:text-xl flex-shrink-0">
                {selectedConsultancy.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl lg:text-2xl font-bold truncate">{selectedConsultancy.name}</h1>
                <p className="text-sm lg:text-base text-zinc-500 truncate">{selectedConsultancy.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {getStatusBadge(selectedConsultancy.status)}
            {getPlanBadge(selectedConsultancy.plan)}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="bg-white p-3 lg:p-4 border-l-4 border-lime-500">
            <div className="flex items-center gap-2 lg:gap-3">
              <Users className="w-5 lg:w-6 h-5 lg:h-6 text-lime-500 flex-shrink-0" />
              <div>
                <p className="text-xl lg:text-2xl font-bold">{selectedConsultancy.stats.patientsCount}</p>
                <p className="text-[10px] lg:text-xs text-zinc-500 tracking-wider">PACIENTES</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 lg:p-4 border-l-4 border-blue-500">
            <div className="flex items-center gap-2 lg:gap-3">
              <UserCheck className="w-5 lg:w-6 h-5 lg:h-6 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xl lg:text-2xl font-bold">{selectedConsultancy.stats.professionalsCount}</p>
                <p className="text-[10px] lg:text-xs text-zinc-500 tracking-wider">PROFISSIONAIS</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 lg:p-4 border-l-4 border-orange-500">
            <div className="flex items-center gap-2 lg:gap-3">
              <Dumbbell className="w-5 lg:w-6 h-5 lg:h-6 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-xl lg:text-2xl font-bold">{selectedConsultancy.stats.trainingPlans}</p>
                <p className="text-[10px] lg:text-xs text-zinc-500 tracking-wider">PLANOS TREINO</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 lg:p-4 border-l-4 border-green-500">
            <div className="flex items-center gap-2 lg:gap-3">
              <Apple className="w-5 lg:w-6 h-5 lg:h-6 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-xl lg:text-2xl font-bold">{selectedConsultancy.stats.nutritionPlans}</p>
                <p className="text-[10px] lg:text-xs text-zinc-500 tracking-wider">PLANOS NUTRIÇÃO</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Informações Gerais */}
          <div className="bg-white p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-bold mb-3 lg:mb-4 flex items-center gap-2">
              <Building2 className="w-4 lg:w-5 h-4 lg:h-5 text-lime-500" />
              Informações Gerais
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500">Slug (URL)</span>
                <span className="font-mono text-sm">{selectedConsultancy.slug}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500">Telefone</span>
                <span>{selectedConsultancy.phone || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500">Plano</span>
                <span className="capitalize">{selectedConsultancy.plan}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500">Valor Mensal</span>
                <span className="font-bold">{formatCurrency(selectedConsultancy.price_monthly)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500">Limite Profissionais</span>
                <span>{selectedConsultancy.stats.professionalsCount}/{selectedConsultancy.max_professionals}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500">Limite Pacientes</span>
                <span>{selectedConsultancy.stats.patientsCount}/{selectedConsultancy.max_patients}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500">Criada em</span>
                <span>{formatDate(selectedConsultancy.created_at)}</span>
              </div>
            </div>
            {/* Módulos */}
            <div className="mt-4 pt-4 border-t border-zinc-200">
              <p className="text-sm font-bold mb-3">MÓDULOS ATIVOS</p>
              <div className="flex flex-wrap gap-2">
                {selectedConsultancy.has_training && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-sm">
                    <Dumbbell className="w-4 h-4" /> Treino
                  </span>
                )}
                {selectedConsultancy.has_nutrition && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm">
                    <Apple className="w-4 h-4" /> Nutrição
                  </span>
                )}
                {selectedConsultancy.has_medical && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm">
                    <Stethoscope className="w-4 h-4" /> Médico
                  </span>
                )}
                {selectedConsultancy.has_rehab && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 text-sm">
                    <HeartPulse className="w-4 h-4" /> Reabilitação
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Atividade Recente */}
          <div className="bg-white p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-bold mb-3 lg:mb-4 flex items-center gap-2">
              <Activity className="w-4 lg:w-5 h-4 lg:h-5 text-lime-500" />
              Atividade Recente
            </h3>
            <div className="space-y-3">
              {selectedConsultancy.recentActivity.length === 0 ? (
                <p className="text-zinc-400 text-center py-4">Sem atividades recentes</p>
              ) : (
                selectedConsultancy.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 py-2 border-b border-zinc-100 last:border-0">
                    <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">
                      {activity.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{activity.name}</p>
                      <p className="text-xs text-zinc-500">{activity.email}</p>
                    </div>
                    {getRoleBadge(activity.role)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Profissionais e Pacientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Profissionais */}
          <div className="bg-white p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-bold mb-3 lg:mb-4 flex items-center gap-2">
              <UserCheck className="w-4 lg:w-5 h-4 lg:h-5 text-blue-500" />
              Profissionais ({selectedConsultancy.professionals.length})
            </h3>
            <div className="space-y-2 max-h-60 lg:max-h-80 overflow-y-auto">
              {selectedConsultancy.professionals.length === 0 ? (
                <p className="text-zinc-400 text-center py-4 text-sm">Nenhum profissional cadastrado</p>
              ) : (
                selectedConsultancy.professionals.map((prof) => (
                  <div key={prof.id} className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 border border-zinc-100 hover:border-zinc-200">
                    <div className="w-8 lg:w-10 h-8 lg:h-10 bg-zinc-100 rounded-full flex items-center justify-center font-bold text-sm lg:text-base flex-shrink-0">
                      {prof.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm lg:text-base">{prof.name}</p>
                      <p className="text-[10px] lg:text-xs text-zinc-500 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" /> {prof.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                      {getRoleBadge(prof.role)}
                      {prof.is_active ? (
                        <span className="w-2 h-2 bg-lime-500 rounded-full" title="Ativo" />
                      ) : (
                        <span className="w-2 h-2 bg-red-500 rounded-full" title="Inativo" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pacientes */}
          <div className="bg-white p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-bold mb-3 lg:mb-4 flex items-center gap-2">
              <Users className="w-4 lg:w-5 h-4 lg:h-5 text-lime-500" />
              Pacientes ({selectedConsultancy.patients.length})
            </h3>
            <div className="space-y-2 max-h-60 lg:max-h-80 overflow-y-auto">
              {selectedConsultancy.patients.length === 0 ? (
                <p className="text-zinc-400 text-center py-4 text-sm">Nenhum paciente cadastrado</p>
              ) : (
                selectedConsultancy.patients.map((patient) => (
                  <div key={patient.id} className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 border border-zinc-100 hover:border-zinc-200">
                    <div className="w-8 lg:w-10 h-8 lg:h-10 bg-lime-100 rounded-full flex items-center justify-center font-bold text-lime-700 text-sm lg:text-base flex-shrink-0">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm lg:text-base">{patient.name}</p>
                      <p className="text-[10px] lg:text-xs text-zinc-500 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" /> {patient.email}
                      </p>
                    </div>
                    <div className="text-right text-[10px] lg:text-xs text-zinc-500 flex-shrink-0">
                      <p>{patient.sport || '-'}</p>
                      <p>{patient.club || '-'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              const c = selectedConsultancy;
              openEditModal({
                ...c,
                professionals_count: c.stats.professionalsCount,
                patients_count: c.stats.patientsCount
              });
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 lg:py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors text-sm lg:text-base"
          >
            <Edit className="w-4 h-4" />
            EDITAR CONSULTORIA
          </button>
          <button
            onClick={() => {
              setDeletingId(selectedConsultancy.id);
              setShowDeleteConfirm(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 lg:py-3 border-2 border-red-500 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-colors text-sm lg:text-base"
          >
            <Trash2 className="w-4 h-4" />
            EXCLUIR
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (currentView === 'consultancy-details') {
      return renderConsultancyDetails();
    }

    if (currentView === 'overview') {
      return (
        <div className="space-y-6 lg:space-y-8">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter mb-2">
              Olá, <span className="text-lime-500">{user.name.split(' ')[0]}</span>
            </h1>
            <p className="text-sm md:text-base text-zinc-600">
              Aqui está o resumo completo do seu SaaS.
            </p>
          </div>

          {stats && (
            <>
              {/* Main Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                <div className="bg-white p-4 lg:p-6 border-l-4 border-lime-500">
                  <div className="flex items-center gap-2 lg:gap-4">
                    <Building2 className="w-6 lg:w-8 h-6 lg:h-8 text-lime-500 flex-shrink-0" />
                    <div>
                      <p className="text-xl lg:text-3xl font-bold">{stats.totalConsultancies}</p>
                      <p className="text-xs lg:text-sm text-zinc-500 tracking-wider">CONSULTORIAS</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 lg:p-6 border-l-4 border-green-500">
                  <div className="flex items-center gap-2 lg:gap-4">
                    <TrendingUp className="w-6 lg:w-8 h-6 lg:h-8 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-xl lg:text-3xl font-bold">{stats.activeConsultancies}</p>
                      <p className="text-xs lg:text-sm text-zinc-500 tracking-wider">ATIVAS</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 lg:p-6 border-l-4 border-emerald-500">
                  <div className="flex items-center gap-2 lg:gap-4">
                    <DollarSign className="w-6 lg:w-8 h-6 lg:h-8 text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-lg lg:text-3xl font-bold">
                        {formatCurrency(stats.monthlyRevenue)}
                      </p>
                      <p className="text-xs lg:text-sm text-zinc-500 tracking-wider">MRR</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 lg:p-6 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 lg:gap-4">
                    <Users className="w-6 lg:w-8 h-6 lg:h-8 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-xl lg:text-3xl font-bold">{stats.totalPatients}</p>
                      <p className="text-xs lg:text-sm text-zinc-500 tracking-wider">PACIENTES</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <div className="bg-white p-3 lg:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs lg:text-base text-zinc-500">Trial</span>
                    <span className="text-lg lg:text-xl font-bold text-yellow-600">{stats.trialConsultancies}</span>
                  </div>
                </div>
                <div className="bg-white p-3 lg:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs lg:text-base text-zinc-500">Suspensas</span>
                    <span className="text-lg lg:text-xl font-bold text-red-600">{stats.suspendedConsultancies}</span>
                  </div>
                </div>
                <div className="bg-white p-3 lg:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs lg:text-base text-zinc-500">Profissionais</span>
                    <span className="text-lg lg:text-xl font-bold">{stats.totalProfessionals}</span>
                  </div>
                </div>
                <div className="bg-white p-3 lg:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs lg:text-base text-zinc-500">Canceladas</span>
                    <span className="text-lg lg:text-xl font-bold text-zinc-500">{stats.cancelledConsultancies}</span>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Módulos */}
                <div className="bg-white p-4 lg:p-6">
                  <h3 className="text-base lg:text-lg font-bold mb-3 lg:mb-4 flex items-center gap-2">
                    <PieChart className="w-4 lg:w-5 h-4 lg:h-5 text-lime-500" />
                    Módulos Contratados
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="flex items-center gap-2 text-sm">
                          <Dumbbell className="w-4 h-4 text-orange-500" /> Treinamento
                        </span>
                        <span className="font-bold">{stats.modulesCount.training}</span>
                      </div>
                      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${(stats.modulesCount.training / stats.totalConsultancies) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="flex items-center gap-2 text-sm">
                          <Apple className="w-4 h-4 text-green-500" /> Nutrição
                        </span>
                        <span className="font-bold">{stats.modulesCount.nutrition}</span>
                      </div>
                      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${(stats.modulesCount.nutrition / stats.totalConsultancies) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="flex items-center gap-2 text-sm">
                          <Stethoscope className="w-4 h-4 text-blue-500" /> Médico
                        </span>
                        <span className="font-bold">{stats.modulesCount.medical}</span>
                      </div>
                      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(stats.modulesCount.medical / stats.totalConsultancies) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="flex items-center gap-2 text-sm">
                          <HeartPulse className="w-4 h-4 text-pink-500" /> Reabilitação
                        </span>
                        <span className="font-bold">{stats.modulesCount.rehab}</span>
                      </div>
                      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-pink-500 rounded-full"
                          style={{ width: `${(stats.modulesCount.rehab / stats.totalConsultancies) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Crescimento Mensal */}
                <div className="bg-white p-4 lg:p-6">
                  <h3 className="text-base lg:text-lg font-bold mb-3 lg:mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 lg:w-5 h-4 lg:h-5 text-lime-500" />
                    Crescimento (últimos 6 meses)
                  </h3>
                  <div className="flex items-end gap-1 lg:gap-2 h-32 lg:h-40">
                    {stats.monthlyGrowth.length === 0 ? (
                      <p className="text-zinc-400 text-center w-full">Sem dados suficientes</p>
                    ) : (
                      stats.monthlyGrowth.map((item, index) => {
                        const maxCount = Math.max(...stats.monthlyGrowth.map(i => i.count));
                        const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs font-bold">{item.count}</span>
                            <div 
                              className="w-full bg-lime-500 rounded-t transition-all"
                              style={{ height: `${Math.max(height, 10)}%` }}
                            />
                            <span className="text-xs text-zinc-500">{item.month.split('-')[1]}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Top Consultancies & Recent */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Top Consultorias */}
                <div className="bg-white p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4 lg:mb-6">
                    <h2 className="text-base lg:text-lg font-bold flex items-center gap-2">
                      <TrendingUp className="w-4 lg:w-5 h-4 lg:h-5 text-lime-500" />
                      Top Consultorias
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {stats.topConsultancies.map((c, index) => (
                      <div key={c.id} className="flex items-center gap-4 py-3 border-b border-zinc-100 last:border-0">
                        <span className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-bold">{c.name}</p>
                          <p className="text-xs text-zinc-500">
                            {c.patients_count} pacientes • {c.professionals_count} profissionais
                          </p>
                        </div>
                        <span className="font-bold text-lime-600">{formatCurrency(c.price_monthly)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consultorias Recentes */}
                <div className="bg-white p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4 lg:mb-6">
                    <h2 className="text-base lg:text-lg font-bold flex items-center gap-2">
                      <Clock className="w-4 lg:w-5 h-4 lg:h-5 text-lime-500" />
                      Recentes
                    </h2>
                    <button
                      onClick={() => setCurrentView('consultancies')}
                      className="text-sm text-lime-600 hover:text-lime-700 font-bold"
                    >
                      VER TODAS →
                    </button>
                  </div>
                  <div className="space-y-4">
                    {stats.recentConsultancies.map((c) => (
                      <div 
                        key={c.id} 
                        className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0 cursor-pointer hover:bg-zinc-50 -mx-2 px-2"
                        onClick={() => loadConsultancyDetails(c.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-zinc-100 flex items-center justify-center font-bold text-zinc-600">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold">{c.name}</p>
                            <p className="text-sm text-zinc-500">{formatDate(c.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(c.status as Consultancy['status'])}
                          <ChevronRight className="w-4 h-4 text-zinc-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Plan Distribution */}
              <div className="bg-white p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-bold mb-3 lg:mb-4 flex items-center gap-2">
                  <PieChart className="w-4 lg:w-5 h-4 lg:h-5 text-lime-500" />
                  Distribuição por Plano
                </h3>
                <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                  {stats.planDistribution.map((item) => (
                    <div key={item.plan} className="flex items-center gap-2 lg:gap-3">
                      {getPlanBadge(item.plan as Consultancy['plan'])}
                      <span className="text-xl lg:text-2xl font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    if (currentView === 'consultancies') {
      return (
        <div className="space-y-4 lg:space-y-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tighter">Consultorias</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border-2 border-zinc-200 focus:border-lime-500 outline-none text-sm lg:text-base"
              >
                <option value="all">Todos</option>
                <option value="active">Ativas</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspensas</option>
                <option value="cancelled">Canceladas</option>
              </select>
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-auto pl-10 pr-4 py-2 border-2 border-zinc-200 focus:border-lime-500 outline-none text-sm lg:text-base"
                />
              </div>
              <button
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors text-sm lg:text-base"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">NOVA</span>
                <span className="sm:hidden">NOVA CONSULTORIA</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-zinc-400" />
            </div>
          ) : filteredConsultancies.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 bg-white">
              Nenhuma consultoria encontrada
            </div>
          ) : (
            <>
              {/* Mobile: Cards */}
              <div className="lg:hidden space-y-3">
                {filteredConsultancies.map((consultancy) => (
                  <div key={consultancy.id} className="bg-white p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black text-lime-500 flex items-center justify-center font-bold flex-shrink-0">
                          {consultancy.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold truncate">{consultancy.name}</p>
                          <p className="text-xs text-zinc-500 truncate">{consultancy.email}</p>
                        </div>
                      </div>
                      {getStatusBadge(consultancy.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500">Plano:</span>
                        {getPlanBadge(consultancy.plan)}
                      </div>
                      <div>
                        <span className="text-zinc-500">Valor: </span>
                        <span className="font-bold">{formatCurrency(consultancy.price_monthly)}/mês</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Prof: </span>
                        <span className="font-bold">{consultancy.professionals_count || 0}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Pac: </span>
                        <span className="font-bold">{consultancy.patients_count || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-3">
                      {consultancy.has_training && (
                        <span title="Treino" className="w-6 h-6 bg-orange-100 flex items-center justify-center">
                          <Dumbbell className="w-3 h-3 text-orange-600" />
                        </span>
                      )}
                      {consultancy.has_nutrition && (
                        <span title="Nutrição" className="w-6 h-6 bg-green-100 flex items-center justify-center">
                          <Apple className="w-3 h-3 text-green-600" />
                        </span>
                      )}
                      {consultancy.has_medical && (
                        <span title="Médico" className="w-6 h-6 bg-blue-100 flex items-center justify-center">
                          <Stethoscope className="w-3 h-3 text-blue-600" />
                        </span>
                      )}
                      {consultancy.has_rehab && (
                        <span title="Reabilitação" className="w-6 h-6 bg-pink-100 flex items-center justify-center">
                          <HeartPulse className="w-3 h-3 text-pink-600" />
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                      <button
                        onClick={() => loadConsultancyDetails(consultancy.id)}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 transition-colors"
                        disabled={loadingDetails}
                      >
                        {loadingDetails ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                        Ver
                      </button>
                      <button
                        onClick={() => openEditModal(consultancy)}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setDeletingId(consultancy.id);
                          setShowDeleteConfirm(true);
                        }}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table */}
              <div className="hidden lg:block bg-white overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="text-left p-4 text-sm font-bold tracking-wider">CONSULTORIA</th>
                      <th className="text-left p-4 text-sm font-bold tracking-wider">PLANO</th>
                      <th className="text-left p-4 text-sm font-bold tracking-wider">MÓDULOS</th>
                      <th className="text-left p-4 text-sm font-bold tracking-wider">USUÁRIOS</th>
                      <th className="text-left p-4 text-sm font-bold tracking-wider">STATUS</th>
                      <th className="text-left p-4 text-sm font-bold tracking-wider">VALOR</th>
                      <th className="text-right p-4 text-sm font-bold tracking-wider">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConsultancies.map((consultancy) => (
                      <tr key={consultancy.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black text-lime-500 flex items-center justify-center font-bold">
                              {consultancy.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold">{consultancy.name}</p>
                              <p className="text-sm text-zinc-500">{consultancy.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {getPlanBadge(consultancy.plan)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {consultancy.has_training && (
                              <span title="Treino" className="w-7 h-7 bg-orange-100 flex items-center justify-center">
                                <Dumbbell className="w-4 h-4 text-orange-600" />
                              </span>
                            )}
                            {consultancy.has_nutrition && (
                              <span title="Nutrição" className="w-7 h-7 bg-green-100 flex items-center justify-center">
                                <Apple className="w-4 h-4 text-green-600" />
                              </span>
                            )}
                            {consultancy.has_medical && (
                              <span title="Médico" className="w-7 h-7 bg-blue-100 flex items-center justify-center">
                                <Stethoscope className="w-4 h-4 text-blue-600" />
                              </span>
                            )}
                            {consultancy.has_rehab && (
                              <span title="Reabilitação" className="w-7 h-7 bg-pink-100 flex items-center justify-center">
                                <HeartPulse className="w-4 h-4 text-pink-600" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <p className="font-bold">{consultancy.professionals_count || 0} prof.</p>
                            <p className="text-zinc-500">{consultancy.patients_count || 0} pac.</p>
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(consultancy.status)}
                        </td>
                        <td className="p-4">
                          <p className="font-bold">{formatCurrency(consultancy.price_monthly)}</p>
                          <p className="text-xs text-zinc-500">/mês</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => loadConsultancyDetails(consultancy.id)}
                              className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Ver detalhes"
                              disabled={loadingDetails}
                            >
                              {loadingDetails ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => openEditModal(consultancy)}
                              className="p-2 text-zinc-400 hover:text-lime-600 hover:bg-lime-50 transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingId(consultancy.id);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      );
    }

    const handleSaveProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setSavingProfile(true);
      setProfileMessage(null);

      try {
        const response = await fetch(`${API_URL}/superadmin/${user.id}/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileForm)
        });

        if (response.ok) {
          setProfileMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        } else {
          const data = await response.json();
          setProfileMessage({ type: 'error', text: data.error || 'Erro ao atualizar perfil' });
        }
      } catch {
        setProfileMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
      } finally {
        setSavingProfile(false);
      }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordMessage(null);

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordMessage({ type: 'error', text: 'As senhas não conferem' });
        return;
      }

      if (passwordForm.newPassword.length < 8) {
        setPasswordMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 8 caracteres' });
        return;
      }

      setSavingPassword(true);

      try {
        const response = await fetch(`${API_URL}/superadmin/${user.id}/password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
          })
        });

        if (response.ok) {
          setPasswordMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
          const data = await response.json();
          setPasswordMessage({ type: 'error', text: data.error || 'Erro ao alterar senha' });
        }
      } catch {
        setPasswordMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
      } finally {
        setSavingPassword(false);
      }
    };

    return (
      <div className="space-y-4 lg:space-y-6">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tighter">Configurações</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 lg:gap-4 border-b border-zinc-200 overflow-x-auto">
          <button
            onClick={() => setSettingsTab('profile')}
            className={`pb-3 lg:pb-4 px-2 font-bold text-xs lg:text-sm tracking-wider transition-colors whitespace-nowrap ${
              settingsTab === 'profile'
                ? 'border-b-2 border-lime-500 text-black'
                : 'text-zinc-400 hover:text-black'
            }`}
          >
            <span className="flex items-center gap-1 lg:gap-2">
              <User className="w-4 h-4" />
              PERFIL
            </span>
          </button>
          <button
            onClick={() => setSettingsTab('security')}
            className={`pb-3 lg:pb-4 px-2 font-bold text-xs lg:text-sm tracking-wider transition-colors whitespace-nowrap ${
              settingsTab === 'security'
                ? 'border-b-2 border-lime-500 text-black'
                : 'text-zinc-400 hover:text-black'
            }`}
          >
            <span className="flex items-center gap-1 lg:gap-2">
              <Lock className="w-4 h-4" />
              SEGURANÇA
            </span>
          </button>
        </div>

        {/* Profile Tab */}
        {settingsTab === 'profile' && (
          <div className="bg-white p-4 lg:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 lg:mb-8">
              <div className="w-16 lg:w-20 h-16 lg:h-20 bg-lime-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Crown className="w-8 lg:w-10 h-8 lg:h-10 text-black" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl lg:text-2xl font-bold">{profileForm.name}</h2>
                <p className="text-sm lg:text-base text-zinc-500 flex items-center justify-center sm:justify-start gap-2">
                  <Shield className="w-4 h-4" />
                  Super Administrador
                </p>
              </div>
            </div>

            {profileMessage && (
              <div className={`p-3 lg:p-4 mb-4 lg:mb-6 text-sm lg:text-base ${
                profileMessage.type === 'success' 
                  ? 'bg-lime-50 border border-lime-500 text-lime-700' 
                  : 'bg-red-50 border border-red-500 text-red-700'
              }`}>
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 lg:space-y-6">
              <div>
                <label className="block text-xs lg:text-sm font-bold mb-2 tracking-wider">NOME COMPLETO</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none text-base lg:text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-bold mb-2 tracking-wider">EMAIL</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none text-base lg:text-lg"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors disabled:opacity-50 text-sm lg:text-base"
              >
                {savingProfile ? (
                  <Loader2 className="w-4 lg:w-5 h-4 lg:h-5 animate-spin" />
                ) : (
                  <Save className="w-4 lg:w-5 h-4 lg:h-5" />
                )}
                SALVAR ALTERAÇÕES
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {settingsTab === 'security' && (
          <div className="bg-white p-4 lg:p-8">
            <div className="flex items-center gap-2 lg:gap-3 mb-6 lg:mb-8">
              <Lock className="w-5 lg:w-6 h-5 lg:h-6 text-lime-500" />
              <h2 className="text-lg lg:text-xl font-bold">Alterar Senha</h2>
            </div>

            {passwordMessage && (
              <div className={`p-3 lg:p-4 mb-4 lg:mb-6 text-sm lg:text-base ${
                passwordMessage.type === 'success' 
                  ? 'bg-lime-50 border border-lime-500 text-lime-700' 
                  : 'bg-red-50 border border-red-500 text-red-700'
              }`}>
                {passwordMessage.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 lg:space-y-6">
              <div>
                <label className="block text-xs lg:text-sm font-bold mb-2 tracking-wider">SENHA ATUAL</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none text-base lg:text-lg"
                  required
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-bold mb-2 tracking-wider">NOVA SENHA</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none text-base lg:text-lg"
                  required
                  placeholder="••••••••"
                  minLength={8}
                />
                <p className="text-xs lg:text-sm text-zinc-500 mt-1">Mínimo de 8 caracteres</p>
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-bold mb-2 tracking-wider">CONFIRMAR NOVA SENHA</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none text-base lg:text-lg"
                  required
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors disabled:opacity-50 text-sm lg:text-base"
              >
                {savingPassword ? (
                  <Loader2 className="w-4 lg:w-5 h-4 lg:h-5 animate-spin" />
                ) : (
                  <Lock className="w-4 lg:w-5 h-4 lg:h-5" />
                )}
                ALTERAR SENHA
              </button>
            </form>

            <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-zinc-200">
              <h3 className="text-base lg:text-lg font-bold mb-3 lg:mb-4 text-red-600">Zona de Perigo</h3>
              <p className="text-sm lg:text-base text-zinc-600 mb-4">
                Ações irreversíveis que afetam sua conta.
              </p>
              <button
                onClick={onLogout}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 lg:px-6 py-2 lg:py-3 border-2 border-red-500 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-colors text-sm lg:text-base"
              >
                <LogOut className="w-4 lg:w-5 h-4 lg:h-5" />
                SAIR DE TODAS AS SESSÕES
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Título da view atual para o header mobile
  const getViewTitle = () => {
    const titles: Record<View, string> = {
      overview: 'Visão Geral',
      consultancies: 'Consultorias',
      settings: 'Configurações',
      'consultancy-details': 'Detalhes'
    };
    return titles[currentView] || 'Dashboard';
  };

  const handleMenuClick = (viewId: View) => {
    setCurrentView(viewId);
    setSelectedConsultancy(null);
    setSidebarOpen(false); // Fechar sidebar em mobile
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Overlay para mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-[280px] lg:w-80 bg-black text-white flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 lg:p-8 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-7 lg:w-8 h-7 lg:h-8 text-lime-500" />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tighter">VITAE</h1>
                <p className="text-xs lg:text-sm text-white/60">Master Admin</p>
              </div>
            </div>
            {/* Botão fechar em mobile */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 lg:p-8 border-b border-white/10">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-12 lg:w-14 h-12 lg:h-14 bg-lime-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 lg:w-7 h-6 lg:h-7 text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-base lg:text-lg truncate">{user.name}</div>
              <div className="text-xs lg:text-sm text-lime-500">Super Admin</div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 lg:p-4 overflow-y-auto">
          <div className="space-y-1 lg:space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || 
                (currentView === 'consultancy-details' && item.id === 'consultancies');
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 rounded transition-colors ${
                    isActive
                      ? 'bg-lime-500 text-black font-bold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="tracking-wide text-sm lg:text-base">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 lg:p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 rounded text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="tracking-wide text-sm lg:text-base">Sair</span>
          </button>
        </div>
      </aside>

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

      {/* Main Content */}
      <main className="lg:ml-80 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          {renderContent()}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingConsultancy ? 'Editar Consultoria' : 'Nova Consultoria'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">NOME</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">SLUG (URL)</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                    required
                    disabled={!!editingConsultancy}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">EMAIL</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">TELEFONE</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">PLANO</label>
                  <select
                    value={form.plan}
                    onChange={(e) => setForm({ ...form, plan: e.target.value as Consultancy['plan'] })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                  >
                    <option value="basic">Basic</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">VALOR MENSAL</label>
                  <input
                    type="number"
                    value={form.price_monthly}
                    onChange={(e) => setForm({ ...form, price_monthly: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">STATUS</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Consultancy['status'] })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Ativo</option>
                    <option value="suspended">Suspenso</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-3">MÓDULOS</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, has_training: !form.has_training })}
                    className={`p-3 border-2 flex items-center gap-2 transition-all ${
                      form.has_training 
                        ? 'bg-orange-50 border-orange-500 text-orange-700' 
                        : 'border-zinc-200 text-zinc-400'
                    }`}
                  >
                    <Dumbbell className="w-4 h-4" />
                    <span className="text-sm font-bold">Treino</span>
                    {form.has_training && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, has_nutrition: !form.has_nutrition })}
                    className={`p-3 border-2 flex items-center gap-2 transition-all ${
                      form.has_nutrition 
                        ? 'bg-green-50 border-green-500 text-green-700' 
                        : 'border-zinc-200 text-zinc-400'
                    }`}
                  >
                    <Apple className="w-4 h-4" />
                    <span className="text-sm font-bold">Nutrição</span>
                    {form.has_nutrition && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, has_medical: !form.has_medical })}
                    className={`p-3 border-2 flex items-center gap-2 transition-all ${
                      form.has_medical 
                        ? 'bg-blue-50 border-blue-500 text-blue-700' 
                        : 'border-zinc-200 text-zinc-400'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span className="text-sm font-bold">Médico</span>
                    {form.has_medical && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, has_rehab: !form.has_rehab })}
                    className={`p-3 border-2 flex items-center gap-2 transition-all ${
                      form.has_rehab 
                        ? 'bg-pink-50 border-pink-500 text-pink-700' 
                        : 'border-zinc-200 text-zinc-400'
                    }`}
                  >
                    <HeartPulse className="w-4 h-4" />
                    <span className="text-sm font-bold">Reab</span>
                    {form.has_rehab && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">MÁX. PROFISSIONAIS</label>
                  <input
                    type="number"
                    value={form.max_professionals}
                    onChange={(e) => setForm({ ...form, max_professionals: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">MÁX. PACIENTES</label>
                  <input
                    type="number"
                    value={form.max_patients}
                    onChange={(e) => setForm({ ...form, max_patients: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">TRIAL ATÉ</label>
                  <input
                    type="date"
                    value={form.trial_ends_at}
                    onChange={(e) => setForm({ ...form, trial_ends_at: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border-2 border-black font-bold hover:bg-black hover:text-white transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {editingConsultancy ? 'SALVAR' : 'CRIAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Excluir Consultoria</h3>
              <p className="text-zinc-600">
                Tem certeza? Esta ação irá remover todos os dados da consultoria.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingId(null);
                }}
                className="flex-1 py-3 border-2 border-black font-bold hover:bg-black hover:text-white transition-colors"
              >
                CANCELAR
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
              >
                EXCLUIR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
