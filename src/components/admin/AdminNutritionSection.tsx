import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Loader2, Apple } from 'lucide-react';
import { Patient } from './AdminDashboard';

const API_URL = 'http://localhost:3001/api';

interface AdminNutritionSectionProps {
  onSelectPatient: (patient: Patient) => void;
  consultancyId?: number;
}

interface NutritionPlan {
  id: number;
  athlete_id: number;
  nutritionist_id: number;
  name: string;
  description: string;
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  start_date: string;
  end_date: string;
  status: string;
  nutritionist_name: string;
}

interface AthleteData {
  id: number;
  user_id: number;
  name: string;
  email: string;
}

export function AdminNutritionSection({ onSelectPatient, consultancyId }: AdminNutritionSectionProps) {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPlan, setShowNewPlan] = useState(false);

  useEffect(() => {
    loadData();
  }, [consultancyId]);

  const loadData = async () => {
    if (!consultancyId) {
      setLoading(false);
      return;
    }
    try {
      const [plansRes, athletesRes] = await Promise.all([
        fetch(`${API_URL}/nutrition-plans?consultancy_id=${consultancyId}`),
        fetch(`${API_URL}/athletes?consultancy_id=${consultancyId}`)
      ]);
      const plansData = await plansRes.json();
      const athletesData = await athletesRes.json();
      setPlans(plansData);
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

  const filteredPlans = plans.filter(plan => 
    getAthleteName(plan.athlete_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgCalories = plans.length > 0 
    ? Math.round(plans.reduce((sum, p) => sum + (p.daily_calories || 0), 0) / plans.length)
    : 0;

  const avgProtein = plans.length > 0
    ? Math.round(plans.reduce((sum, p) => sum + (p.protein_grams || 0), 0) / plans.length)
    : 0;

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
            <span className="text-lime-500">NUTRIÇÃO</span>
          </h1>
          <p className="text-xl text-zinc-600">
            Gerencie os planos nutricionais dos pacientes
          </p>
        </div>
        <button 
          onClick={() => setShowNewPlan(true)}
          className="flex items-center gap-2 bg-lime-500 text-black px-6 py-3 font-bold tracking-wider hover:bg-lime-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          NOVO PLANO
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
          <div className="text-2xl font-bold">{plans.filter(p => p.status === 'active').length}</div>
          <div className="text-sm text-zinc-600">Planos Ativos</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-black">
          <div className="text-2xl font-bold">{avgCalories}</div>
          <div className="text-sm text-zinc-600">Kcal Média</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-black">
          <div className="text-2xl font-bold">{avgProtein}g</div>
          <div className="text-sm text-zinc-600">Proteína Média</div>
        </div>
        <div className="bg-white p-4 border-l-4 border-black">
          <div className="text-2xl font-bold">{plans.length}</div>
          <div className="text-sm text-zinc-600">Total Planos</div>
        </div>
      </div>

      <div className="bg-white">
        <div className="grid grid-cols-7 gap-4 px-6 py-4 bg-zinc-900 text-white font-bold text-sm tracking-wider">
          <div className="col-span-2">PACIENTE / PLANO</div>
          <div>CALORIAS</div>
          <div>PROTEÍNA</div>
          <div>CARBS</div>
          <div>STATUS</div>
          <div className="text-right">AÇÕES</div>
        </div>
        <div className="divide-y divide-zinc-200">
          {filteredPlans.length === 0 ? (
            <div className="px-6 py-12 text-center text-zinc-500">
              Nenhum plano nutricional encontrado
            </div>
          ) : (
            filteredPlans.map((plan) => (
              <div key={plan.id} className="grid grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-zinc-50 transition-colors">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">{getAthleteName(plan.athlete_id)}</div>
                    <div className="text-sm text-zinc-500">{plan.name}</div>
                  </div>
                </div>
                <div className="font-bold">{plan.daily_calories} kcal</div>
                <div>{plan.protein_grams}g</div>
                <div>{plan.carbs_grams}g</div>
                <div>
                  <span className={`px-3 py-1 text-xs font-bold ${
                    plan.status === 'active' 
                      ? 'bg-lime-100 text-lime-700' 
                      : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {plan.status === 'active' ? 'ATIVO' : plan.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => {
                      const athlete = athletes.find(a => a.id === plan.athlete_id);
                      if (athlete) {
                        onSelectPatient({
                          id: athlete.user_id,
                          name: athlete.name,
                          email: athlete.email,
                          phone: '',
                          sport: '',
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
                    title="Ver detalhes"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button 
                    className="p-2 hover:bg-zinc-100 transition-colors"
                    title="Editar plano"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Plan Modal */}
      {showNewPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-8">
            <h3 className="text-2xl font-bold mb-6">Novo Plano Nutricional</h3>
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
                <label className="block text-sm font-bold mb-2">NOME DO PLANO</label>
                <input type="text" className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" placeholder="Ex: Dieta Hipertrofia" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">CALORIAS DIÁRIAS</label>
                  <input type="number" className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" placeholder="2500" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">PROTEÍNAS (g)</label>
                  <input type="number" className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-lime-500 outline-none" placeholder="150" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowNewPlan(false)}
                  className="flex-1 py-3 border-2 border-black font-bold hover:bg-black hover:text-white transition-colors"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors"
                >
                  CRIAR PLANO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
