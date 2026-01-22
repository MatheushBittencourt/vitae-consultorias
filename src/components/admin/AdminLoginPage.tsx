import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { setAuthToken } from '../../services/api';

const API_URL = '/api';

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

interface AdminLoginPageProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBack: () => void;
}

export function AdminLoginPage({ onLoginSuccess, onBack }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        // Salvar token JWT para requisições autenticadas
        if (data.token) {
          setAuthToken(data.token);
        }
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
          <div className="mb-4 lg:mb-6">
            <Logo size="xl" showText={false} />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter mb-3 lg:mb-4">
            PAINEL<br/>
            <span className="text-lime-500">PROFISSIONAL</span>
          </h1>
          <p className="text-base lg:text-xl text-zinc-600">
            Área restrita para profissionais da equipe VITAE.
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
              EMAIL CORPORATIVO
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full px-4 lg:px-6 py-3 lg:py-4 border-2 border-black focus:border-lime-500 outline-none transition-colors text-base lg:text-lg"
              placeholder="profissional@vitae.com"
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
              'ACESSAR PAINEL'
            )}
          </button>
        </form>

        <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-zinc-200 text-center">
          <p className="text-xs lg:text-sm text-zinc-500">
            Acesso exclusivo para profissionais credenciados.
          </p>
        </div>
      </div>
    </div>
  );
}
