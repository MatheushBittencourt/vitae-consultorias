import { useState, useEffect } from 'react';
import { Plus, Search, Edit, FileText, Loader2, Stethoscope } from 'lucide-react';
import { Patient } from './AdminDashboard';

const API_URL = '/api';

interface AdminMedicalSectionProps {
  onSelectPatient: (patient: Patient) => void;
  consultancyId?: number;
}

interface MedicalRecord {
  id: number;
  athlete_id: number;
  doctor_id: number;
  title: string;
  record_type: string;
  description: string;
  findings: string;
  recommendations: string;
  attachments: string;
  record_date: string;
  created_at: string;
  athlete_name: string;
  doctor_name: string;
}

interface AthleteData {
  id: number;
  user_id: number;
  name: string;
  email: string;
  sport: string;
}

export function AdminMedicalSection({ onSelectPatient, consultancyId }: AdminMedicalSectionProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewRecord, setShowNewRecord] = useState(false);

  useEffect(() => {
    loadData();
  }, [consultancyId]);

  const loadData = async () => {
    if (!consultancyId) {
      setLoading(false);
      return;
    }
    try {
      const [recordsRes, athletesRes] = await Promise.all([
        fetch(`${API_URL}/medical-records?consultancy_id=${consultancyId}`),
        fetch(`${API_URL}/athletes?consultancy_id=${consultancyId}`)
      ]);
      const recordsData = await recordsRes.json();
      const athletesData = await athletesRes.json();
      setRecords(recordsData);
      setAthletes(athletesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAthleteName = (athleteId: number) => {
    const athlete = athletes.find(a => a.id === athleteId);
    return athlete?.name || 'Desconhecido';
  };

  const getAthleteSport = (athleteId: number) => {
    const athlete = athletes.find(a => a.id === athleteId);
    return athlete?.sport || '';
  };

  const filteredRecords = records.filter(record => 
    getAthleteName(record.athlete_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recordTypeLabels: Record<string, string> = {
    consultation: 'Consulta',
    exam: 'Exame',
    evaluation: 'Avaliação',
    injury: 'Lesão',
    surgery: 'Cirurgia',
    other: 'Outro'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">MÉDICO</span>
          </h1>
          <p className="text-xl text-zinc-600">
            Prontuários e registros médicos
          </p>
        </div>
        <button 
          onClick={() => setShowNewRecord(true)}
          className="flex items-center gap-2 bg-lime-500 text-black px-6 py-3 font-bold tracking-wider hover:bg-lime-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          NOVO REGISTRO
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar por paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-zinc-200 focus:border-lime-500 outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 border-l-4 border-lime-500">
          <div className="text-2xl font-bold">{records.length}</div>
          <div className="text-sm text-zinc-600">Registros</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-black">
          <div className="text-2xl font-bold">{records.filter(r => r.record_type === 'consultation').length}</div>
          <div className="text-sm text-zinc-600">Consultas</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-500">
          <div className="text-2xl font-bold">{records.filter(r => r.record_type === 'exam').length}</div>
          <div className="text-sm text-zinc-600">Exames</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-yellow-500">
          <div className="text-2xl font-bold">{records.filter(r => r.record_type === 'injury').length}</div>
          <div className="text-sm text-zinc-600">Lesões</div>
        </div>
      </div>

      <div className="bg-white">
        <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-zinc-900 text-white font-bold text-sm tracking-wider">
          <div className="col-span-2">PACIENTE / REGISTRO</div>
          <div>DATA</div>
          <div>TIPO</div>
          <div>PROFISSIONAL</div>
          <div className="text-right">AÇÕES</div>
        </div>
        <div className="divide-y divide-zinc-200">
          {filteredRecords.length === 0 ? (
            <div className="px-6 py-12 text-center text-zinc-500">
              Nenhum registro médico encontrado
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div key={record.id} className="grid grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-zinc-50 transition-colors">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">{getAthleteName(record.athlete_id)}</div>
                    <div className="text-sm text-zinc-500">{record.title || 'Registro médico'}</div>
                  </div>
                </div>
                <div>{record.record_date ? new Date(record.record_date).toLocaleDateString('pt-BR') : '-'}</div>
                <div>
                  <span className={`px-3 py-1 text-xs font-bold ${
                    record.record_type === 'exam' ? 'bg-blue-100 text-blue-700' : 
                    record.record_type === 'injury' ? 'bg-red-100 text-red-700' :
                    'bg-lime-100 text-lime-700'
                  }`}>
                    {recordTypeLabels[record.record_type] || record.record_type?.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-zinc-600">{record.doctor_name || '-'}</div>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => {
                      const athlete = athletes.find(a => a.id === record.athlete_id);
                      if (athlete) {
                        onSelectPatient({
                          id: athlete.user_id,
                          name: athlete.name,
                          email: athlete.email,
                          phone: '',
                          sport: athlete.sport || '',
                          position: '',
                          club: '',
                          birthDate: '',
                          height: 0,
                          weight: 0,
                          goals: '',
                          status: 'active',
                          daysInProgram: 0,
                          adherence: 0
                        });
                      }
                    }}
                    className="p-2 hover:bg-zinc-100 transition-colors"
                    title="Ver prontuário"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <button 
                    className="p-2 hover:bg-zinc-100 transition-colors"
                    title="Editar registro"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showNewRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-8">
            <h3 className="text-2xl font-bold mb-6">Novo Registro Médico</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">PACIENTE</label>
                <select className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none">
                  <option value="">Selecione um paciente</option>
                  {athletes.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">TIPO</label>
                <select className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none">
                  <option value="consultation">Consulta</option>
                  <option value="exam">Exame</option>
                  <option value="evaluation">Avaliação</option>
                  <option value="injury">Lesão</option>
                  <option value="surgery">Cirurgia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">TÍTULO</label>
                <input type="text" className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" placeholder="Ex: Avaliação física mensal" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">OBSERVAÇÕES</label>
                <textarea className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none h-32 resize-none" placeholder="Notas e observações..." />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowNewRecord(false)}
                  className="flex-1 py-3 border-2 border-black font-bold hover:bg-black hover:text-white transition-colors"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors"
                >
                  SALVAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
