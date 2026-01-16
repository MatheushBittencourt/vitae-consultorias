import { useState, useEffect } from 'react';
import { ArrowLeft, User, Loader2 } from 'lucide-react';

const API_URL = '/api';

export type ActiveModule = 'training' | 'nutrition' | 'medical' | 'rehab';

export interface PatientUser {
  id: number;
  athleteId?: number;
  name: string;
  email: string;
  sport: string;
  club: string;
  avatarUrl?: string;
  activeModules: ActiveModule[];
}

interface AvailablePatient {
  email: string;
  name: string;
  avatar_url: string;
  sport: string;
  club: string;
}

interface LoginPageProps {
  onLoginSuccess: (patient: PatientUser) => void;
  onBack: () => void;
}

export function LoginPage({ onLoginSuccess, onBack }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [availablePatients, setAvailablePatients] = useState<AvailablePatient[]>([]);

  // Carregar pacientes disponíveis do banco
  useEffect(() => {
    fetch(`${API_URL}/auth/patients/available`)
      .then(res => res.json())
      .then(data => setAvailablePatients(data))
      .catch(err => console.error('Erro ao carregar pacientes:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/patient/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess({
          id: data.user.id,
          athleteId: data.user.athleteId,
          name: data.user.name,
          email: data.user.email,
          sport: data.user.sport,
          club: data.user.club,
          avatarUrl: data.user.avatarUrl,
          activeModules: data.user.activeModules || []
        });
      } else {
        setError(data.error || 'Email ou senha incorretos.');
      }
    } catch {
      setError('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  // Senhas para exibição (apenas desenvolvimento)
  const getPasswordHint = (email: string) => {
    const name = email.split('@')[0];
    return `${name}123`;
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 lg:px-8 py-16 lg:py-8">
      <button
        onClick={onBack}
        className="fixed top-4 lg:top-8 left-4 lg:left-8 flex items-center gap-2 text-sm tracking-wider hover:text-lime-500 transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">VOLTAR</span>
      </button>

      <div className="w-full max-w-md">
        <div className="mb-8 lg:mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter mb-3 lg:mb-4">
            ÁREA DO<br/>
            <span className="text-lime-500">PACIENTE</span>
          </h1>
          <p className="text-base lg:text-xl text-zinc-600">
            Acesse sua plataforma exclusiva de acompanhamento.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          {error && (
            <div className="p-3 lg:p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs lg:text-sm tracking-wider font-bold mb-2 lg:mb-3">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full px-4 lg:px-6 py-3 lg:py-4 border-2 border-black focus:border-lime-500 outline-none transition-colors text-base lg:text-lg"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm tracking-wider font-bold mb-2 lg:mb-3">
              SENHA
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full px-4 lg:px-6 py-3 lg:py-4 border-2 border-black focus:border-lime-500 outline-none transition-colors text-base lg:text-lg"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs lg:text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span>Lembrar de mim</span>
            </label>
            <a href="#" className="hover:text-lime-500 transition-colors">
              Esqueceu a senha?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 lg:py-5 text-base lg:text-lg tracking-wider hover:bg-lime-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                ENTRANDO...
              </>
            ) : (
              'ENTRAR'
            )}
          </button>
        </form>

        <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-zinc-200 text-center">
          <p className="text-xs lg:text-sm text-zinc-600">
            Ainda não é cliente?{' '}
            <button onClick={onBack} className="font-bold hover:text-lime-500 transition-colors">
              Conheça a VITAE
            </button>
          </p>
        </div>

        {availablePatients.length > 0 && (
          <div className="mt-6 lg:mt-8 p-4 lg:p-6 bg-zinc-50 border border-zinc-200">
            <p className="text-xs lg:text-sm text-zinc-600 mb-3 lg:mb-4">
              <strong>Pacientes cadastrados (do banco):</strong>
            </p>
            <div className="space-y-2 lg:space-y-3">
              {availablePatients.map((patient) => (
                <div key={patient.email} className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm">
                  <div className="w-7 lg:w-8 h-7 lg:h-8 bg-lime-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {patient.avatar_url ? (
                      <img src={patient.avatar_url} alt={patient.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-zinc-800 font-medium truncate block">{patient.name}</span>
                    <div className="text-zinc-500 text-xs truncate">
                      {patient.email} / {getPasswordHint(patient.email)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
