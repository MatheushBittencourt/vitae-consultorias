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
  Settings
} from 'lucide-react';
import { SuperAdminUser } from './SuperAdminLoginPage';

const API_URL = 'http://localhost:3001/api';

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

interface Stats {
  totalConsultancies: number;
  activeConsultancies: number;
  trialConsultancies: number;
  monthlyRevenue: number;
  totalProfessionals: number;
  totalPatients: number;
}

type View = 'overview' | 'consultancies' | 'settings';

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

  const filteredConsultancies = consultancies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const renderContent = () => {
    if (currentView === 'overview') {
      return (
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2">
              Olá, <span className="text-lime-500">{user.name.split(' ')[0]}</span>
            </h1>
            <p className="text-zinc-600">
              Aqui está o resumo do seu SaaS.
            </p>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 border-l-4 border-lime-500">
                <div className="flex items-center gap-4">
                  <Building2 className="w-8 h-8 text-lime-500" />
                  <div>
                    <p className="text-3xl font-bold">{stats.totalConsultancies}</p>
                    <p className="text-sm text-zinc-500 tracking-wider">CONSULTORIAS</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 border-l-4 border-black">
                <div className="flex items-center gap-4">
                  <TrendingUp className="w-8 h-8" />
                  <div>
                    <p className="text-3xl font-bold">{stats.activeConsultancies}</p>
                    <p className="text-sm text-zinc-500 tracking-wider">ATIVAS</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 border-l-4 border-black">
                <div className="flex items-center gap-4">
                  <DollarSign className="w-8 h-8" />
                  <div>
                    <p className="text-3xl font-bold">
                      R$ {Number(stats.monthlyRevenue).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-zinc-500 tracking-wider">MRR</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 border-l-4 border-black">
                <div className="flex items-center gap-4">
                  <Users className="w-8 h-8" />
                  <div>
                    <p className="text-3xl font-bold">{stats.totalPatients}</p>
                    <p className="text-sm text-zinc-500 tracking-wider">PACIENTES</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Consultancies */}
          <div className="bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Consultorias Recentes</h2>
              <button
                onClick={() => setCurrentView('consultancies')}
                className="text-sm text-lime-600 hover:text-lime-700 font-bold"
              >
                VER TODAS →
              </button>
            </div>
            <div className="space-y-4">
              {consultancies.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-100 flex items-center justify-center font-bold text-zinc-600">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{c.name}</p>
                      <p className="text-sm text-zinc-500">{c.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(c.status)}
                    <span className="font-bold">R$ {Number(c.price_monthly).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (currentView === 'consultancies') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tighter">Consultorias</h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                />
              </div>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
                NOVA
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
            <div className="bg-white overflow-hidden">
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
                        <p className="font-bold">R$ {Number(consultancy.price_monthly).toLocaleString('pt-BR')}</p>
                        <p className="text-xs text-zinc-500">/mês</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
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
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tighter">Configurações</h1>
        <div className="bg-white p-8">
          <p className="text-zinc-500">Em breve...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-black text-white fixed h-screen flex flex-col">
        {/* Logo */}
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-lime-500" />
            <div>
              <h1 className="text-3xl font-bold tracking-tighter">VITAE</h1>
              <p className="text-sm text-white/60">Master Admin</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-lime-500 rounded-full flex items-center justify-center">
              <Crown className="w-7 h-7 text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-lg truncate">{user.name}</div>
              <div className="text-sm text-lime-500">Super Admin</div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
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

      {/* Main Content */}
      <main className="flex-1 ml-80">
        <div className="p-8">
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
