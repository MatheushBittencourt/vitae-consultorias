import { useState, useEffect } from 'react';
import { getAuthHeaders } from '../../services/api';
import { 
  User, Bell, Lock, Save, Users, CreditCard, 
  Plus, Trash2, Edit, X, Loader2, Check, AlertTriangle,
  Dumbbell, Apple, Stethoscope, HeartPulse, Crown, Shield,
  Building2, Palette, Upload, Image
} from 'lucide-react';
import { AdminUser } from './AdminLoginPage';
import { useToast } from '../ui/Toast';

const API_URL = '/api';

interface AdminSettingsSectionProps {
  adminUser: AdminUser;
}

interface Professional {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'coach' | 'nutritionist' | 'physio';
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

interface ConsultancyDetails {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  logo_url?: string;
  primary_color?: string;
  plan: string;
  price_monthly: number;
  has_training: boolean;
  has_nutrition: boolean;
  has_medical: boolean;
  has_rehab: boolean;
  max_professionals: number;
  max_patients: number;
  status: string;
  trial_ends_at?: string;
  currentProfessionals: number;
  currentPatients: number;
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  coach: 'Personal Trainer',
  nutritionist: 'Nutricionista',
  physio: 'Fisioterapeuta',
};

const roleIcons: Record<string, typeof User> = {
  admin: Crown,
  coach: Dumbbell,
  nutritionist: Apple,
  physio: HeartPulse,
};

const roleColors: Record<string, string> = {
  admin: 'bg-purple-500',
  coach: 'bg-orange-500',
  nutritionist: 'bg-green-500',
  physio: 'bg-pink-500',
};

// Configuração de capacidade
const capacityOptions = [
  { professionals: 3, patients: 30, basePrice: 0, label: 'Starter' },
  { professionals: 5, patients: 50, basePrice: 50, label: 'Growth' },
  { professionals: 10, patients: 100, basePrice: 150, label: 'Scale' },
  { professionals: 20, patients: 250, basePrice: 350, label: 'Enterprise' },
];

// Configuração de módulos
const moduleOptions = [
  { id: 'training' as const, name: 'Treinamento', icon: Dumbbell, price: 97, color: 'bg-orange-100 text-orange-600' },
  { id: 'nutrition' as const, name: 'Nutrição', icon: Apple, price: 97, color: 'bg-green-100 text-green-600' },
  { id: 'medical' as const, name: 'Médico', icon: Stethoscope, price: 127, color: 'bg-blue-100 text-blue-600' },
  { id: 'rehab' as const, name: 'Reabilitação', icon: HeartPulse, price: 97, color: 'bg-pink-100 text-pink-600' },
];

export function AdminSettingsSection({ adminUser }: AdminSettingsSectionProps) {
  const toast = useToast();
  const isAdminRole = adminUser.role === 'admin';
  const [activeTab, setActiveTab] = useState(isAdminRole ? 'team' : 'profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Dados
  const [consultancy, setConsultancy] = useState<ConsultancyDetails | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  
  // Modal de profissional
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [professionalForm, setProfessionalForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'coach' as 'admin' | 'coach' | 'nutritionist' | 'physio',
    password: '',
  });
  const [formError, setFormError] = useState('');
  
  // Formulário de plano
  const [planForm, setPlanForm] = useState({
    modules: {
      training: true,
      nutrition: true,
      medical: true,
      rehab: true,
    },
    maxProfessionals: 5,
    maxPatients: 50,
  });
  
  // Confirmação de exclusão
  const [deleteConfirm, setDeleteConfirm] = useState<Professional | null>(null);
  
  // Branding
  const [brandingForm, setBrandingForm] = useState({
    primary_color: '#84CC16',
    logo_url: '',
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const consultancyId = adminUser.consultancyId;

  // Tabs disponíveis - Equipe, Plano e Consultoria só para admins
  const allTabs = [
    { id: 'team', label: 'Equipe', icon: Users, adminOnly: true },
    { id: 'plan', label: 'Plano', icon: CreditCard, adminOnly: true },
    { id: 'branding', label: 'Consultoria', icon: Building2, adminOnly: true },
    { id: 'profile', label: 'Perfil', icon: User, adminOnly: false },
    { id: 'notifications', label: 'Notificações', icon: Bell, adminOnly: false },
    { id: 'security', label: 'Segurança', icon: Lock, adminOnly: false },
  ];

  const tabs = allTabs.filter(tab => !tab.adminOnly || isAdminRole);

  // Se não é admin e tentou acessar tab de admin, redireciona para profile
  useEffect(() => {
    if (!isAdminRole && (activeTab === 'team' || activeTab === 'plan')) {
      setActiveTab('profile');
    }
  }, [isAdminRole, activeTab]);

  useEffect(() => {
    if (consultancyId) {
      loadData();
    }
  }, [consultancyId]);

  // Roles disponíveis baseado nos módulos ativos da consultoria
  const getAvailableRoles = () => {
    const roles: { value: string; label: string }[] = [
      { value: 'admin', label: 'Administrador' },
    ];
    
    if (consultancy?.has_training) {
      roles.push({ value: 'coach', label: 'Personal Trainer' });
    }
    if (consultancy?.has_nutrition) {
      roles.push({ value: 'nutritionist', label: 'Nutricionista' });
    }
    if (consultancy?.has_rehab) {
      roles.push({ value: 'physio', label: 'Fisioterapeuta' });
    }
    // Médico não tem role específico no sistema, usa os módulos existentes
    
    return roles;
  };

  const loadData = async () => {
    if (!consultancyId) return;
    
    setLoading(true);
    try {
      const [consultancyRes, professionalsRes] = await Promise.all([
        fetch(`${API_URL}/consultancy/${consultancyId}`, { headers: getAuthHeaders() }).then(r => r.json()),
        fetch(`${API_URL}/consultancy/${consultancyId}/professionals`, { headers: getAuthHeaders() }).then(r => r.json()),
      ]);
      
      setConsultancy(consultancyRes);
      setProfessionals(professionalsRes);
      
      // Inicializar formulário do plano
      setPlanForm({
        modules: {
          training: consultancyRes.has_training,
          nutrition: consultancyRes.has_nutrition,
          medical: consultancyRes.has_medical,
          rehab: consultancyRes.has_rehab,
        },
        maxProfessionals: consultancyRes.max_professionals,
        maxPatients: consultancyRes.max_patients,
      });
      
      // Inicializar formulário de branding
      setBrandingForm({
        primary_color: consultancyRes.primary_color || '#84CC16',
        logo_url: consultancyRes.logo_url || '',
      });
    } catch (error) {
      console.error('Error loading settings data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ================== PROFISSIONAIS ==================

  const openAddProfessional = () => {
    setEditingProfessional(null);
    setProfessionalForm({
      name: '',
      email: '',
      phone: '',
      role: 'coach',
      password: '',
    });
    setFormError('');
    setShowProfessionalModal(true);
  };

  const openEditProfessional = (professional: Professional) => {
    setEditingProfessional(professional);
    setProfessionalForm({
      name: professional.name,
      email: professional.email,
      phone: professional.phone || '',
      role: professional.role,
      password: '',
    });
    setFormError('');
    setShowProfessionalModal(true);
  };

  const handleSaveProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultancyId) return;
    
    setFormError('');
    setSaving(true);
    
    try {
      if (editingProfessional) {
        // Atualizar
        const response = await fetch(
          `${API_URL}/consultancy/${consultancyId}/professionals/${editingProfessional.id}`,
          {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              name: professionalForm.name,
              role: professionalForm.role,
              phone: professionalForm.phone,
              is_active: true,
            }),
          }
        );
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro ao atualizar profissional');
        }
      } else {
        // Criar novo
        if (!professionalForm.password) {
          setFormError('Senha é obrigatória para novo profissional');
          setSaving(false);
          return;
        }
        
        const response = await fetch(
          `${API_URL}/consultancy/${consultancyId}/professionals`,
          {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              email: professionalForm.email,
              password: professionalForm.password,
              name: professionalForm.name,
              role: professionalForm.role,
              phone: professionalForm.phone,
            }),
          }
        );
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Erro ao adicionar profissional');
        }
      }
      
      setShowProfessionalModal(false);
      loadData();
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfessional = async () => {
    if (!deleteConfirm || !consultancyId) return;
    
    setSaving(true);
    try {
      const response = await fetch(
        `${API_URL}/consultancy/${consultancyId}/professionals/${deleteConfirm.id}`,
        { method: 'DELETE', headers: getAuthHeaders() }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover profissional');
      }
      
      setDeleteConfirm(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  // ================== PLANO ==================

  const calculatePrice = () => {
    const selectedModules = Object.entries(planForm.modules)
      .filter(([, selected]) => selected)
      .map(([id]) => moduleOptions.find(m => m.id === id)!);
    
    const modulesPrice = selectedModules.reduce((sum, m) => sum + m.price, 0);
    
    const capacityOption = capacityOptions.find(c => c.professionals === planForm.maxProfessionals);
    const capacityPrice = capacityOption?.basePrice || 0;
    
    return modulesPrice + capacityPrice;
  };

  const handleSavePlan = async () => {
    if (!consultancyId) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/consultancy/${consultancyId}/plan`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          modules: planForm.modules,
          maxProfessionals: planForm.maxProfessionals,
          maxPatients: planForm.maxPatients,
          priceMonthly: calculatePrice(),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar plano');
      }
      
      loadData();
      toast.success('Plano atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleModule = (moduleId: keyof typeof planForm.modules) => {
    setPlanForm({
      ...planForm,
      modules: {
        ...planForm.modules,
        [moduleId]: !planForm.modules[moduleId],
      },
    });
  };

  // ================== BRANDING ==================

  const handleSaveBranding = async () => {
    if (!consultancyId) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/consultancy/${consultancyId}/branding`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          primary_color: brandingForm.primary_color,
          logo_url: brandingForm.logo_url || null,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar branding');
      }
      
      loadData();
      toast.success('Personalização salva com sucesso!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.warning('Por favor, selecione uma imagem');
      return;
    }
    
    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.warning('A imagem deve ter no máximo 2MB');
      return;
    }
    
    setUploadingLogo(true);
    
    try {
      // Converter para base64 (para demo - em produção usar upload para S3/CloudStorage)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setBrandingForm({ ...brandingForm, logo_url: base64 });
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Erro ao fazer upload da logo');
      setUploadingLogo(false);
    }
  };

  // Cores predefinidas
  const presetColors = [
    '#84CC16', // lime-500 (padrão)
    '#22C55E', // green-500
    '#14B8A6', // teal-500
    '#06B6D4', // cyan-500
    '#3B82F6', // blue-500
    '#6366F1', // indigo-500
    '#8B5CF6', // violet-500
    '#A855F7', // purple-500
    '#EC4899', // pink-500
    '#EF4444', // red-500
    '#F97316', // orange-500
    '#EAB308', // yellow-500
  ];

  const activeProfessionals = professionals.filter(p => p.is_active);
  const canAddProfessional = consultancy ? activeProfessionals.length < consultancy.max_professionals : false;
  const selectedModulesCount = Object.values(planForm.modules).filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-lime-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold tracking-tighter mb-2">
          <span className="text-lime-500">CONFIGURAÇÕES</span>
        </h1>
        <p className="text-xl text-zinc-600">
          Gerencie sua equipe, plano e preferências
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-lime-500 text-black font-bold'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.id === 'team' && (
                  <span className="ml-auto bg-black text-white text-xs px-2 py-0.5 rounded">
                    {activeProfessionals.length}/{consultancy?.max_professionals || 0}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white p-8">
          
          {/* ================== ABA EQUIPE ================== */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Equipe</h2>
                  <p className="text-zinc-600">
                    Gerencie os profissionais da sua consultoria
                  </p>
                </div>
                <button
                  onClick={openAddProfessional}
                  disabled={!canAddProfessional}
                  className={`flex items-center gap-2 px-4 py-2 font-bold transition-colors ${
                    canAddProfessional
                      ? 'bg-black text-white hover:bg-lime-500 hover:text-black'
                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  ADICIONAR
                </button>
              </div>

              {/* Limite de profissionais */}
              <div className={`p-4 rounded flex items-center gap-3 ${
                canAddProfessional ? 'bg-lime-100 text-lime-800' : 'bg-amber-100 text-amber-800'
              }`}>
                <Users className="w-5 h-5" />
                <span>
                  <strong>{activeProfessionals.length}</strong> de <strong>{consultancy?.max_professionals}</strong> profissionais utilizados
                  {!canAddProfessional && (
                    <span className="ml-2">
                      — <button onClick={() => setActiveTab('plan')} className="underline font-bold">Aumente seu plano</button>
                    </span>
                  )}
                </span>
              </div>

              {/* Lista de profissionais */}
              <div className="space-y-3">
                {activeProfessionals.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500">
                    <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="font-bold text-lg mb-2">Nenhum profissional cadastrado</p>
                    <p className="text-sm">Adicione o primeiro profissional da sua equipe</p>
                  </div>
                ) : (
                  activeProfessionals.map((professional) => {
                    const RoleIcon = roleIcons[professional.role] || User;
                    const isCurrentUser = professional.id === adminUser.id;
                    
                    return (
                      <div
                        key={professional.id}
                        className="flex items-center gap-4 p-4 border-2 border-zinc-200 hover:border-zinc-300 transition-colors"
                      >
                        <div className={`w-12 h-12 ${roleColors[professional.role] || 'bg-zinc-500'} rounded-full flex items-center justify-center text-white`}>
                          <RoleIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{professional.name}</span>
                            {isCurrentUser && (
                              <span className="text-xs bg-lime-500 text-black px-2 py-0.5 rounded">VOCÊ</span>
                            )}
                          </div>
                          <div className="text-sm text-zinc-600">{professional.email}</div>
                          <div className="text-xs text-zinc-500 mt-1">
                            <span className={`inline-block px-2 py-0.5 rounded ${roleColors[professional.role]} text-white`}>
                              {roleLabels[professional.role]}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditProfessional(professional)}
                            className="p-2 hover:bg-zinc-100 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5 text-zinc-600" />
                          </button>
                          {!isCurrentUser && (
                            <button
                              onClick={() => setDeleteConfirm(professional)}
                              className="p-2 hover:bg-red-100 rounded transition-colors"
                              title="Remover"
                            >
                              <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ================== ABA PLANO ================== */}
          {activeTab === 'plan' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold">Seu Plano</h2>
                <p className="text-zinc-600">
                  Personalize os módulos e a capacidade da sua consultoria
                </p>
              </div>

              {/* Status atual */}
              {consultancy && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-zinc-50 border-l-4 border-lime-500">
                    <div className="text-sm text-zinc-500 mb-1">Status</div>
                    <div className="font-bold text-lg capitalize">
                      {consultancy.status === 'trial' ? (
                        <span className="text-amber-600">Trial</span>
                      ) : consultancy.status === 'active' ? (
                        <span className="text-green-600">Ativo</span>
                      ) : (
                        <span className="text-red-600">{consultancy.status}</span>
                      )}
                    </div>
                    {consultancy.trial_ends_at && (
                      <div className="text-xs text-zinc-500 mt-1">
                        Expira em {new Date(consultancy.trial_ends_at).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-zinc-50 border-l-4 border-black">
                    <div className="text-sm text-zinc-500 mb-1">Profissionais</div>
                    <div className="font-bold text-lg">
                      {consultancy.currentProfessionals} / {consultancy.max_professionals}
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-50 border-l-4 border-black">
                    <div className="text-sm text-zinc-500 mb-1">Pacientes</div>
                    <div className="font-bold text-lg">
                      {consultancy.currentPatients} / {consultancy.max_patients}
                    </div>
                  </div>
                </div>
              )}

              {/* Módulos */}
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Módulos Ativos
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {moduleOptions.map((module) => {
                    const Icon = module.icon;
                    const isSelected = planForm.modules[module.id];
                    
                    return (
                      <button
                        key={module.id}
                        type="button"
                        onClick={() => toggleModule(module.id)}
                        className={`p-4 rounded border-2 text-left transition-all ${
                          isSelected
                            ? 'border-lime-500 bg-lime-50'
                            : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${module.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold">{module.name}</span>
                              <span className="text-sm font-bold text-lime-600">R$ {module.price}/mês</span>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-lime-500 border-lime-500' : 'border-zinc-300'
                          }`}>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedModulesCount === 0 && (
                  <p className="mt-3 text-sm text-amber-600 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Selecione pelo menos 1 módulo
                  </p>
                )}
              </div>

              {/* Capacidade */}
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Capacidade
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {capacityOptions.map((option) => {
                    const isSelected = planForm.maxProfessionals === option.professionals;
                    const isDisabled = consultancy && consultancy.currentProfessionals > option.professionals;
                    
                    return (
                      <button
                        key={option.professionals}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setPlanForm({
                          ...planForm,
                          maxProfessionals: option.professionals,
                          maxPatients: option.patients,
                        })}
                        className={`p-4 rounded border-2 text-center transition-all ${
                          isDisabled
                            ? 'border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed'
                            : isSelected
                            ? 'border-lime-500 bg-lime-50'
                            : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div className="font-bold text-xl">{option.professionals}</div>
                        <div className="text-xs text-zinc-500">profissionais</div>
                        <div className="text-xs text-zinc-400 mt-1">{option.patients} pacientes</div>
                        {option.basePrice > 0 && (
                          <div className="text-xs font-bold text-lime-600 mt-2">+R$ {option.basePrice}</div>
                        )}
                        <div className="text-[10px] text-zinc-400 mt-1">{option.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resumo do preço */}
              <div className="bg-zinc-900 text-white p-6 rounded">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-zinc-400">Resumo do plano</span>
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-zinc-700">
                  {Object.entries(planForm.modules)
                    .filter(([, selected]) => selected)
                    .map(([id]) => {
                      const module = moduleOptions.find(m => m.id === id)!;
                      return (
                        <div key={id} className="flex justify-between text-sm">
                          <span>Módulo {module.name}</span>
                          <span>R$ {module.price}</span>
                        </div>
                      );
                    })}
                  {capacityOptions.find(c => c.professionals === planForm.maxProfessionals)?.basePrice! > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Capacidade ({planForm.maxProfessionals} prof. / {planForm.maxPatients} pac.)</span>
                      <span>R$ {capacityOptions.find(c => c.professionals === planForm.maxProfessionals)?.basePrice}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-sm text-zinc-400">Total mensal</div>
                    <div className="text-3xl font-bold">
                      R$ {calculatePrice()}<span className="text-lg text-zinc-400">/mês</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSavePlan}
                disabled={saving || selectedModulesCount === 0}
                className="flex items-center gap-2 px-6 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                SALVAR ALTERAÇÕES
              </button>
            </div>
          )}

          {/* ================== ABA CONSULTORIA (BRANDING) ================== */}
          {activeTab === 'branding' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold">Personalização da Consultoria</h2>
                <p className="text-zinc-600">
                  Personalize a identidade visual da sua consultoria
                </p>
              </div>

              {/* Logo */}
              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Logo da Consultoria
                </h3>
                
                <div className="flex items-start gap-6">
                  {/* Preview */}
                  <div className="w-32 h-32 border-2 border-dashed border-zinc-300 rounded-lg flex items-center justify-center bg-zinc-50 overflow-hidden">
                    {brandingForm.logo_url ? (
                      <img 
                        src={brandingForm.logo_url} 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-zinc-400">
                        <Building2 className="w-10 h-10 mx-auto mb-2" />
                        <span className="text-xs">Sem logo</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Upload */}
                  <div className="flex-1">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={uploadingLogo}
                      />
                      <div className="flex items-center gap-3">
                        <span className="px-4 py-2 bg-black text-white font-bold cursor-pointer hover:bg-zinc-800 transition-colors flex items-center gap-2">
                          {uploadingLogo ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {uploadingLogo ? 'ENVIANDO...' : 'ENVIAR LOGO'}
                        </span>
                        {brandingForm.logo_url && (
                          <button
                            onClick={() => setBrandingForm({ ...brandingForm, logo_url: '' })}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </label>
                    <p className="text-sm text-zinc-500 mt-2">
                      Recomendado: PNG ou SVG com fundo transparente. Máximo 2MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cor Principal */}
              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Cor Principal
                </h3>
                <p className="text-sm text-zinc-600">
                  Esta cor será usada como destaque em toda a plataforma
                </p>
                
                {/* Cores predefinidas */}
                <div className="flex flex-wrap gap-3">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBrandingForm({ ...brandingForm, primary_color: color })}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        brandingForm.primary_color === color 
                          ? 'border-black scale-110 shadow-lg' 
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {brandingForm.primary_color === color && (
                        <Check className="w-6 h-6 text-white mx-auto drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Cor personalizada */}
                <div className="flex items-center gap-4 mt-4">
                  <label className="flex items-center gap-3">
                    <span className="text-sm font-bold">Cor personalizada:</span>
                    <div className="relative">
                      <input
                        type="color"
                        value={brandingForm.primary_color}
                        onChange={(e) => setBrandingForm({ ...brandingForm, primary_color: e.target.value })}
                        className="w-12 h-12 rounded-lg border-2 border-zinc-200 cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={brandingForm.primary_color}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                          setBrandingForm({ ...brandingForm, primary_color: val });
                        }
                      }}
                      className="w-28 px-3 py-2 border-2 border-zinc-200 focus:border-lime-500 outline-none font-mono uppercase"
                      placeholder="#84CC16"
                    />
                  </label>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h3 className="font-bold">Prévia</h3>
                <div className="p-6 bg-zinc-100 rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    {brandingForm.logo_url ? (
                      <img src={brandingForm.logo_url} alt="Logo" className="w-12 h-12 object-contain" />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: brandingForm.primary_color }}
                      >
                        {consultancy?.name.charAt(0) || 'V'}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-lg">{consultancy?.name || 'Sua Consultoria'}</div>
                      <div className="text-sm text-zinc-500">Painel Profissional</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="px-4 py-2 text-white font-bold"
                      style={{ backgroundColor: brandingForm.primary_color }}
                    >
                      Botão Primário
                    </button>
                    <button 
                      className="px-4 py-2 border-2 font-bold"
                      style={{ borderColor: brandingForm.primary_color, color: brandingForm.primary_color }}
                    >
                      Botão Secundário
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveBranding}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                SALVAR PERSONALIZAÇÃO
              </button>
            </div>
          )}

          {/* ================== ABA PERFIL ================== */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Informações do Perfil</h2>
              <div className="flex items-center gap-6 pb-6 border-b border-zinc-200">
                <div className="w-24 h-24 bg-lime-500 rounded-full flex items-center justify-center text-black text-3xl font-bold">
                  {adminUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <button className="px-4 py-2 bg-black text-white text-sm font-bold hover:bg-zinc-800 transition-colors">
                    ALTERAR FOTO
                  </button>
                  <p className="text-sm text-zinc-500 mt-2">JPG, PNG ou GIF. Máximo 2MB.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">NOME</label>
                  <input type="text" defaultValue={adminUser.name} className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">EMAIL</label>
                  <input type="email" defaultValue={adminUser.email} className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">TELEFONE</label>
                  <input type="tel" placeholder="(11) 99999-0000" className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">CONSULTORIA</label>
                  <input type="text" defaultValue={consultancy?.name || ''} disabled className="w-full px-4 py-3 border-2 border-zinc-200 bg-zinc-50 text-zinc-500" />
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors">
                <Save className="w-5 h-5" />
                SALVAR ALTERAÇÕES
              </button>
            </div>
          )}

          {/* ================== ABA NOTIFICAÇÕES ================== */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Preferências de Notificação</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-zinc-50 cursor-pointer">
                  <div>
                    <div className="font-bold">Novos agendamentos</div>
                    <div className="text-sm text-zinc-500">Receba notificações quando um paciente agendar uma consulta</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-lime-500" />
                </label>
                <label className="flex items-center justify-between p-4 bg-zinc-50 cursor-pointer">
                  <div>
                    <div className="font-bold">Lembretes de consulta</div>
                    <div className="text-sm text-zinc-500">Lembrete 30 minutos antes de cada consulta</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-lime-500" />
                </label>
                <label className="flex items-center justify-between p-4 bg-zinc-50 cursor-pointer">
                  <div>
                    <div className="font-bold">Relatórios semanais</div>
                    <div className="text-sm text-zinc-500">Resumo semanal de atividades e métricas</div>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-lime-500" />
                </label>
                <label className="flex items-center justify-between p-4 bg-zinc-50 cursor-pointer">
                  <div>
                    <div className="font-bold">Novos pacientes</div>
                    <div className="text-sm text-zinc-500">Notificação quando um novo paciente for cadastrado</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-lime-500" />
                </label>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors">
                <Save className="w-5 h-5" />
                SALVAR PREFERÊNCIAS
              </button>
            </div>
          )}

          {/* ================== ABA SEGURANÇA ================== */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Segurança da Conta</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-4">Alterar Senha</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">SENHA ATUAL</label>
                      <input type="password" className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">NOVA SENHA</label>
                      <input type="password" className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">CONFIRMAR NOVA SENHA</label>
                      <input type="password" className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" />
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-zinc-200">
                  <h3 className="font-bold mb-4">Autenticação em Duas Etapas</h3>
                  <p className="text-zinc-600 mb-4">Adicione uma camada extra de segurança à sua conta.</p>
                  <button className="px-6 py-3 border-2 border-black font-bold hover:bg-black hover:text-white transition-colors">
                    ATIVAR 2FA
                  </button>
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors">
                <Save className="w-5 h-5" />
                ATUALIZAR SENHA
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ================== MODAL ADICIONAR/EDITAR PROFISSIONAL ================== */}
      {showProfessionalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200">
              <h3 className="text-xl font-bold">
                {editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
              </h3>
              <button onClick={() => setShowProfessionalModal(false)} className="p-2 hover:bg-zinc-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfessional} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-100 text-red-700 text-sm rounded flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {formError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold mb-2">NOME *</label>
                <input
                  type="text"
                  value={professionalForm.name}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">EMAIL *</label>
                <input
                  type="email"
                  value={professionalForm.email}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                  required
                  disabled={!!editingProfessional}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">TELEFONE</label>
                <input
                  type="tel"
                  value={professionalForm.phone}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                  placeholder="(11) 99999-0000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">FUNÇÃO *</label>
                <select
                  value={professionalForm.role}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, role: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                  required
                >
                  {getAvailableRoles().map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500 mt-1">
                  Apenas funções dos módulos ativos estão disponíveis
                </p>
              </div>
              
              {!editingProfessional && (
                <div>
                  <label className="block text-sm font-bold mb-2">SENHA *</label>
                  <input
                    type="password"
                    value={professionalForm.password}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, password: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                    placeholder="Senha de acesso"
                    required={!editingProfessional}
                  />
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfessionalModal(false)}
                  className="flex-1 py-3 border-2 border-zinc-300 font-bold hover:border-black transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {editingProfessional ? 'ATUALIZAR' : 'ADICIONAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================== MODAL CONFIRMAR EXCLUSÃO ================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Remover Profissional</h3>
                <p className="text-zinc-600 text-sm">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            
            <p className="mb-6">
              Tem certeza que deseja remover <strong>{deleteConfirm.name}</strong> da equipe?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border-2 border-zinc-300 font-bold hover:border-black transition-colors"
              >
                CANCELAR
              </button>
              <button
                onClick={handleDeleteProfessional}
                disabled={saving}
                className="flex-1 py-3 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                REMOVER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
