import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Stethoscope, Apple, Dumbbell, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

export type AdminRole = 'admin' | 'coach' | 'nutritionist' | 'physio';

export interface AdminUser {
  id?: number;
  email: string;
  name: string;
  role: AdminRole;
  consultancyId?: number;
  consultancyName?: string;
  consultancySlug?: string;
  modules?: {
    training: boolean;
    nutrition: boolean;
    medical: boolean;
    rehab: boolean;
  };
}

interface AvailableAdmin {
  email: string;
  name: string;
  role: string;
}

interface AdminLoginPageProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBack: () => void;
}

export function AdminLoginPage({ onLoginSuccess, onBack }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableAdmins, setAvailableAdmins] = useState<AvailableAdmin[]>([]);

  // Carregar profissionais disponíveis do banco
  useEffect(() => {
    fetch(`${API_URL}/auth/admin/available`)
      .then(res => res.json())
      .then(data => setAvailableAdmins(data))
      .catch(err => console.error('Erro ao carregar profissionais:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role as AdminRole,
          consultancyId: data.user.consultancyId,
          consultancyName: data.user.consultancyName,
          consultancySlug: data.user.consultancySlug,
          modules: data.user.modules
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
      case 'physio':
      case 'medico': return <Stethoscope className="w-4 h-4" />;
      case 'nutritionist':
      case 'nutricionista': return <Apple className="w-4 h-4" />;
      case 'coach':
      case 'treinador': return <Dumbbell className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
      case 'physio': return 'Médico';
      case 'nutritionist': return 'Nutricionista';
      case 'coach': return 'Treinador';
      case 'medico': return 'Médico';
      case 'nutricionista': return 'Nutricionista';
      case 'treinador': return 'Treinador';
      default: return role;
    }
  };

  // Senhas para exibição (apenas desenvolvimento)
  const getPasswordHint = (email: string) => {
    if (email.includes('medico')) return 'medico123';
    if (email.includes('nutri')) return 'nutri123';
    if (email.includes('treinador') || email.includes('coach')) return 'treinador123';
    if (email.includes('fisio')) return 'fisio123';
    return '***';
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 lg:px-8 py-16 lg:py-8">
      <button
        onClick={onBack}
        className="fixed top-4 lg:top-8 left-4 lg:left-8 flex items-center gap-2 text-sm tracking-wider text-white/80 hover:text-lime-500 transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">VOLTAR</span>
      </button>

      <div className="w-full max-w-md">
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center gap-3 mb-4 lg:mb-6">
            <Shield className="w-10 lg:w-12 h-10 lg:h-12 text-lime-500" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter mb-3 lg:mb-4 text-white">
            PAINEL<br/>
            <span className="text-lime-500">PROFISSIONAL</span>
          </h1>
          <p className="text-base lg:text-xl text-zinc-400">
            Área restrita para profissionais da equipe VITAE.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          {error && (
            <div className="p-3 lg:p-4 bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs lg:text-sm tracking-wider font-bold mb-2 lg:mb-3 text-white">
              EMAIL CORPORATIVO
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-zinc-900 border-2 border-zinc-700 focus:border-lime-500 outline-none transition-colors text-base lg:text-lg text-white placeholder-zinc-500"
              placeholder="profissional@vitae.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm tracking-wider font-bold mb-2 lg:mb-3 text-white">
              SENHA
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-zinc-900 border-2 border-zinc-700 focus:border-lime-500 outline-none transition-colors text-base lg:text-lg text-white placeholder-zinc-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-500 text-black py-4 lg:py-5 text-base lg:text-lg tracking-wider font-bold hover:bg-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                ENTRANDO...
              </>
            ) : (
              'ACESSAR PAINEL'
            )}
          </button>
        </form>

        <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-zinc-800 text-center">
          <p className="text-xs lg:text-sm text-zinc-500">
            Acesso exclusivo para profissionais credenciados.
          </p>
        </div>

        {availableAdmins.length > 0 && (
          <div className="mt-6 lg:mt-8 p-4 lg:p-6 bg-zinc-900/50 border border-zinc-800">
            <p className="text-xs lg:text-sm text-zinc-400 mb-3 lg:mb-4">
              <strong className="text-white">Credenciais de acesso (do banco):</strong>
            </p>
            <div className="space-y-2 lg:space-y-3">
              {availableAdmins.map((acc) => (
                <div key={acc.email} className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm">
                  <span className="w-7 lg:w-8 h-7 lg:h-8 bg-lime-500/20 rounded flex items-center justify-center text-lime-500 flex-shrink-0">
                    {getRoleIcon(acc.role)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-zinc-300 font-medium truncate block">{acc.name}</span>
                    <div className="text-zinc-500 text-xs truncate">
                      {acc.email} / {getPasswordHint(acc.email)}
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
