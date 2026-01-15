import { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Eye, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { Patient } from './AdminDashboard';

const API_URL = 'http://localhost:3001/api';

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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  
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
      const response = await fetch(`${API_URL}/athletes?consultancy_id=${consultancyId}`);
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
      alert('Erro: consultoria não identificada');
      setSaving(false);
      return;
    }
    
    try {
      // First, create the user
      const userResponse = await fetch(`${API_URL}/superadmin/consultancies/${consultancyId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        alert(error.error || 'Erro ao criar paciente');
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
      alert('Erro ao criar paciente');
    } finally {
      setSaving(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.sport.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">PACIENTES</span>
          </h1>
          <p className="text-xl text-zinc-600">
            Gerencie todos os pacientes cadastrados
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-lime-500 text-black px-6 py-3 font-bold tracking-wider hover:bg-lime-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          NOVO PACIENTE
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou esporte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-zinc-200 focus:border-lime-500 outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-3 border-2 border-zinc-200">
          <Filter className="w-5 h-5 text-zinc-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="bg-transparent outline-none font-medium"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="pending">Pendentes</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 border-l-4 border-lime-500">
          <div className="text-2xl font-bold">{patients.length}</div>
          <div className="text-sm text-zinc-600">Total</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-500">
          <div className="text-2xl font-bold">{patients.filter(p => p.status === 'active').length}</div>
          <div className="text-sm text-zinc-600">Ativos</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-yellow-500">
          <div className="text-2xl font-bold">{patients.filter(p => p.status === 'pending').length}</div>
          <div className="text-sm text-zinc-600">Pendentes</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-zinc-400">
          <div className="text-2xl font-bold">{patients.filter(p => p.status === 'inactive').length}</div>
          <div className="text-sm text-zinc-600">Inativos</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            {patients.length === 0 ? 'Nenhum paciente cadastrado' : 'Nenhum paciente encontrado'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-zinc-900 text-white">
              <tr>
                <th className="text-left px-6 py-4 font-bold tracking-wider text-sm">PACIENTE</th>
                <th className="text-left px-6 py-4 font-bold tracking-wider text-sm">ESPORTE</th>
                <th className="text-left px-6 py-4 font-bold tracking-wider text-sm">CLUBE</th>
                <th className="text-left px-6 py-4 font-bold tracking-wider text-sm">STATUS</th>
                <th className="text-left px-6 py-4 font-bold tracking-wider text-sm">ADERÊNCIA</th>
                <th className="text-left px-6 py-4 font-bold tracking-wider text-sm">DIAS</th>
                <th className="text-right px-6 py-4 font-bold tracking-wider text-sm">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-lime-500 rounded-full flex items-center justify-center text-black font-bold overflow-hidden">
                        {patient.avatarUrl ? (
                          <img src={patient.avatarUrl} alt={patient.name} className="w-full h-full object-cover" />
                        ) : (
                          patient.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-bold">{patient.name}</div>
                        <div className="text-sm text-zinc-500">{patient.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{patient.sport}</div>
                    <div className="text-sm text-zinc-500">{patient.position}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{patient.club || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded ${
                      patient.status === 'active' 
                        ? 'bg-lime-500/20 text-lime-700'
                        : patient.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-700'
                        : 'bg-zinc-200 text-zinc-600'
                    }`}>
                      {patient.status === 'active' ? 'ATIVO' : patient.status === 'pending' ? 'PENDENTE' : 'INATIVO'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-zinc-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-lime-500 rounded-full" 
                          style={{ width: `${patient.adherence}%` }}
                        />
                      </div>
                      <span className="font-bold text-sm">{patient.adherence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold">{patient.daysInProgram}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === patient.id ? null : patient.id)}
                      className="p-2 hover:bg-zinc-100 rounded transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {openMenuId === patient.id && (
                      <div className="absolute right-6 top-full mt-1 bg-white border border-zinc-200 shadow-lg z-10 min-w-[160px]">
                        <button 
                          onClick={() => { onSelectPatient(patient); setOpenMenuId(null); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 text-left"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver Detalhes</span>
                        </button>
                        <button 
                          onClick={() => { onSelectPatient(patient); setOpenMenuId(null); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 text-left"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Editar</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 text-left text-red-600">
                          <Trash2 className="w-4 h-4" />
                          <span>Remover</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tighter">NOVO PACIENTE</h2>
                <p className="text-zinc-600 text-sm mt-1">Cadastre um novo paciente no sistema</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-black">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddPatient} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">NOME COMPLETO *</label>
                  <input 
                    type="text" 
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" 
                    placeholder="Nome do paciente"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">EMAIL *</label>
                  <input 
                    type="email" 
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" 
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">SENHA INICIAL</label>
                  <input 
                    type="password" 
                    value={newPatient.password}
                    onChange={(e) => setNewPatient({...newPatient, password: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" 
                    placeholder="Senha de acesso"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">TELEFONE</label>
                  <input 
                    type="tel" 
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" 
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">ESPORTE</label>
                  <input 
                    type="text" 
                    value={newPatient.sport}
                    onChange={(e) => setNewPatient({...newPatient, sport: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" 
                    placeholder="Ex: Futebol"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">POSIÇÃO</label>
                  <input 
                    type="text" 
                    value={newPatient.position}
                    onChange={(e) => setNewPatient({...newPatient, position: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" 
                    placeholder="Ex: Atacante"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">CLUBE/EQUIPE</label>
                  <input 
                    type="text" 
                    value={newPatient.club}
                    onChange={(e) => setNewPatient({...newPatient, club: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" 
                    placeholder="Nome do clube"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">DATA DE NASCIMENTO</label>
                  <input 
                    type="date" 
                    value={newPatient.birthDate}
                    onChange={(e) => setNewPatient({...newPatient, birthDate: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">OBJETIVOS</label>
                <textarea 
                  value={newPatient.goals}
                  onChange={(e) => setNewPatient({...newPatient, goals: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none h-20 resize-none" 
                  placeholder="Descreva os objetivos do paciente..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border-2 border-black font-bold hover:bg-black hover:text-white transition-colors"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                  {saving ? 'SALVANDO...' : 'CADASTRAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
