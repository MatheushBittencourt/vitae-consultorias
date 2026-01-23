import { useState, useEffect } from 'react';
import { getAuthHeaders } from '../../services/api';
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  X, 
  ChevronDown,
  UserPlus,
  ArrowUpRight
} from 'lucide-react';
import { useToast } from '../ui/Toast';
import { Patient } from './AdminDashboard';
import { Card, StatCard } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { StatusBadge, Badge, ProgressBadge } from '../ui/Badge';
import { EmptyState, ListSkeleton, StatSkeleton } from '../ui/EmptyState';

const API_URL = '/api';

interface PatientsListProps {
  onSelectPatient: (patient: Patient) => void;
  consultancyId?: number;
}

interface AthleteData {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  sport: string;
  position: string;
  club: string;
  birth_date: string;
  height: number;
  weight: number;
  goals: string;
}

export function PatientsList({ onSelectPatient, consultancyId }: PatientsListProps) {
  const toast = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Patient | null>(null);
  
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    sport: '',
    position: '',
    club: '',
    height: '',
    weight: '',
    goals: '',
    password: ''
  });

  useEffect(() => {
    loadPatients();
  }, [consultancyId]);

  const loadPatients = async () => {
    try {
      if (!consultancyId) {
        setPatients([]);
        setLoading(false);
        return;
      }
      const response = await fetch(`${API_URL}/athletes?consultancy_id=${consultancyId}`, { headers: getAuthHeaders() });
      const data: AthleteData[] = await response.json();
      
      // Transform API data to Patient interface
      const transformedPatients: Patient[] = data.map((athlete) => ({
        id: athlete.user_id,
        name: athlete.name,
        email: athlete.email,
        phone: athlete.phone || '',
        sport: athlete.sport || 'Não definido',
        position: athlete.position || '',
        club: athlete.club || '',
        birthDate: athlete.birth_date || '',
        height: athlete.height || 0,
        weight: athlete.weight || 0,
        goals: athlete.goals || '',
        status: 'active' as const,
        daysInProgram: Math.floor(Math.random() * 200) + 1, // TODO: Calculate from created_at
        adherence: Math.floor(Math.random() * 30) + 70, // TODO: Calculate real adherence
        avatarUrl: athlete.avatar_url,
      }));
      
      setPatients(transformedPatients);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    if (!consultancyId) {
      toast.error('Erro: consultoria não identificada');
      setSaving(false);
      return;
    }
    
    try {
      const userResponse = await fetch(`${API_URL}/superadmin/consultancies/${consultancyId}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          email: newPatient.email,
          password: newPatient.password || 'senha123',
          name: newPatient.name,
          role: 'athlete',
          phone: newPatient.phone
        })
      });
      
      if (!userResponse.ok) {
        const error = await userResponse.json();
        toast.error(error.error || 'Erro ao criar paciente');
        return;
      }
      
      setShowAddModal(false);
      setNewPatient({
        name: '', email: '', phone: '', birthDate: '', sport: '',
        position: '', club: '', height: '', weight: '', goals: '', password: ''
      });
      loadPatients();
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error('Erro ao criar paciente');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (!consultancyId) return;
    
    setDeletingId(patient.id);
    try {
      const response = await fetch(`${API_URL}/superadmin/consultancies/${consultancyId}/users/${patient.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Erro ao remover paciente');
        return;
      }
      
      setShowDeleteConfirm(null);
      loadPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Erro ao remover paciente');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.sport.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    pending: patients.filter(p => p.status === 'pending').length,
    inactive: patients.filter(p => p.status === 'inactive').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-start justify-between">
          <div>
            <div className="h-10 w-48 bg-zinc-200 rounded-lg animate-pulse mb-2" />
            <div className="h-5 w-64 bg-zinc-200 rounded animate-pulse" />
          </div>
          <div className="h-12 w-40 bg-zinc-200 rounded-xl animate-pulse" />
        </div>
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
        
        {/* List Skeleton */}
        <ListSkeleton items={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
            <span className="text-lime-500">Pacientes</span>
          </h1>
          <p className="text-zinc-500 mt-1">
            Gerencie todos os pacientes cadastrados
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-5 py-3 
                     font-semibold rounded-xl hover:bg-lime-500 hover:text-black 
                     transition-all duration-200 shadow-sm hover:shadow-lg
                     transform hover:-translate-y-0.5 w-full sm:w-auto"
        >
          <UserPlus className="w-5 h-5" />
          Novo Paciente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-50 border-0">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
        </Card>
        <Card className="bg-green-50 border-0">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Ativos</p>
          <p className="text-2xl font-bold text-green-700">{stats.active}</p>
        </Card>
        <Card className="bg-amber-50 border-0">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Pendentes</p>
          <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
        </Card>
        <Card className="bg-zinc-100 border-0">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Inativos</p>
          <p className="text-2xl font-bold text-zinc-600">{stats.inactive}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou esporte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-zinc-200 
                       focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 
                       outline-none transition-all text-sm"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="pl-12 pr-10 py-3 bg-white rounded-xl border border-zinc-200 
                       focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 
                       outline-none transition-all text-sm font-medium appearance-none cursor-pointer
                       min-w-[160px]"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="pending">Pendentes</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      {/* Patient List */}
      {filteredPatients.length === 0 ? (
        <Card>
          <EmptyState
            icon={patients.length === 0 ? 'users' : 'search'}
            title={patients.length === 0 ? 'Nenhum paciente cadastrado' : 'Nenhum resultado encontrado'}
            description={patients.length === 0 
              ? 'Comece cadastrando seu primeiro paciente para gerenciar seus atendimentos' 
              : 'Tente ajustar os filtros ou buscar por outros termos'
            }
            action={patients.length === 0 ? {
              label: 'Cadastrar Paciente',
              onClick: () => setShowAddModal(true)
            } : undefined}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPatients.map((patient) => (
            <Card 
              key={patient.id}
              hover
              padding="none"
              onClick={() => onSelectPatient(patient)}
              className="overflow-hidden"
            >
              <div className="flex items-center p-4">
                {/* Avatar - largura fixa */}
                <div className="flex-shrink-0 w-12">
                  <Avatar 
                    name={patient.name} 
                    src={patient.avatarUrl} 
                    size="lg"
                  />
                </div>
                
                {/* Info - largura fixa para alinhar */}
                <div className="flex-1 min-w-0 ml-4 mr-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-zinc-900 truncate max-w-[140px]">{patient.name}</h3>
                    <StatusBadge status={patient.status} size="sm" />
                  </div>
                  <p className="text-sm text-zinc-500 truncate max-w-[200px]">{patient.email}</p>
                  <div className="mt-1.5">
                    <Badge variant="default" size="sm">{patient.sport}</Badge>
                  </div>
                </div>

                {/* Stats - largura fixa alinhada à direita */}
                <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                  <div className="text-center w-14">
                    <p className="text-2xl font-bold text-zinc-900 leading-none">{patient.daysInProgram}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">dias</p>
                  </div>
                  <div className="text-center w-14">
                    <ProgressBadge value={patient.adherence} />
                    <p className="text-xs text-zinc-500 mt-1">aderência</p>
                  </div>
                </div>

                {/* Actions - largura fixa */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPatient(patient);
                    }}
                    className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(patient);
                    }}
                    className="p-2 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"
                    title="Remover paciente"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Mobile stats */}
              <div className="flex sm:hidden items-center justify-between px-4 py-2.5 bg-zinc-50 border-t border-zinc-100">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-zinc-600">
                    <strong>{patient.daysInProgram}</strong> dias
                  </span>
                  <span className="text-sm text-zinc-600">
                    <strong>{patient.adherence}%</strong> aderência
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" padding="none">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold">Novo Paciente</h2>
                <p className="text-zinc-500 text-sm">Preencha os dados para cadastrar</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddPatient} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Nome Completo *</label>
                  <input 
                    type="text" 
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 
                               focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 
                               outline-none transition-all" 
                    placeholder="Nome do paciente"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Email *</label>
                  <input 
                    type="email" 
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 
                               focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 
                               outline-none transition-all" 
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Senha Inicial</label>
                  <input 
                    type="password" 
                    value={newPatient.password}
                    onChange={(e) => setNewPatient({...newPatient, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 
                               focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 
                               outline-none transition-all" 
                    placeholder="Senha de acesso"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Telefone</label>
                  <input 
                    type="tel" 
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 
                               focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 
                               outline-none transition-all" 
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Esporte</label>
                  <input 
                    type="text" 
                    value={newPatient.sport}
                    onChange={(e) => setNewPatient({...newPatient, sport: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 
                               focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 
                               outline-none transition-all" 
                    placeholder="Ex: Futebol"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Posição</label>
                  <input 
                    type="text" 
                    value={newPatient.position}
                    onChange={(e) => setNewPatient({...newPatient, position: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 
                               focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 
                               outline-none transition-all" 
                    placeholder="Ex: Atacante"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Clube/Equipe</label>
                  <input 
                    type="text" 
                    value={newPatient.club}
                    onChange={(e) => setNewPatient({...newPatient, club: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 
                               focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 
                               outline-none transition-all" 
                    placeholder="Nome do clube"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Data de Nascimento</label>
                  <input 
                    type="date" 
                    value={newPatient.birthDate}
                    onChange={(e) => setNewPatient({...newPatient, birthDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 
                               focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 
                               outline-none transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Objetivos</label>
                <textarea 
                  value={newPatient.goals}
                  onChange={(e) => setNewPatient({...newPatient, goals: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 
                             focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 
                             outline-none transition-all h-20 resize-none" 
                  placeholder="Descreva os objetivos do paciente..."
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 px-6 border-2 border-zinc-200 rounded-xl font-semibold
                             hover:bg-zinc-50 transition-colors order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 px-6 bg-lime-500 text-black rounded-xl font-semibold
                             hover:bg-lime-400 transition-colors flex items-center justify-center gap-2
                             disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Cadastrar Paciente'
                  )}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md" padding="none">
            <div className="p-6 border-b border-zinc-100">
              <h2 className="text-xl font-bold text-red-600">Confirmar Exclusão</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar name={showDeleteConfirm.name} src={showDeleteConfirm.avatarUrl} size="lg" />
                <div>
                  <p className="font-semibold text-zinc-900">{showDeleteConfirm.name}</p>
                  <p className="text-sm text-zinc-500">{showDeleteConfirm.email}</p>
                </div>
              </div>
              <p className="text-sm text-zinc-600">
                Tem certeza que deseja remover este paciente? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="p-6 bg-zinc-50 flex gap-3 rounded-b-2xl">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deletingId !== null}
                className="flex-1 py-3 px-6 border border-zinc-200 rounded-xl font-semibold
                           hover:bg-white transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleDeletePatient(showDeleteConfirm)}
                disabled={deletingId !== null}
                className="flex-1 py-3 px-6 bg-red-600 text-white rounded-xl font-semibold
                           hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                {deletingId === showDeleteConfirm.id ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Removendo...
                  </>
                ) : (
                  'Remover'
                )}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
