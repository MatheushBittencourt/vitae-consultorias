import { useState } from 'react';
import { ArrowLeft, Crown, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface SuperAdminUser {
  id: number;
  email: string;
  name: string;
  role: 'superadmin';
}

interface SuperAdminLoginPageProps {
  onLoginSuccess: (user: SuperAdminUser) => void;
  onBack: () => void;
}

export function SuperAdminLoginPage({ onLoginSuccess, onBack }: SuperAdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/superadmin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Credenciais inválidas');
      }
    } catch {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 md:px-8 py-8">
      <button
        onClick={onBack}
        className="fixed top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-sm tracking-wider text-white/80 hover:text-lime-500 transition-colors p-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">VOLTAR</span>
      </button>

      <div className="w-full max-w-md">
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <Crown className="w-10 md:w-12 h-10 md:h-12 text-lime-500" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-2 md:mb-4 text-white">
            VITAE<br/>
            <span className="text-lime-500">MASTER</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400">
            Painel de gestão do SaaS.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {error && (
            <div className="p-3 md:p-4 bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs md:text-sm tracking-wider font-bold mb-2 md:mb-3 text-white">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full px-4 md:px-6 py-3 md:py-4 bg-zinc-900 border-2 border-zinc-700 focus:border-lime-500 outline-none transition-colors text-base md:text-lg text-white placeholder-zinc-500"
              placeholder="admin@vitae.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm tracking-wider font-bold mb-2 md:mb-3 text-white">
              SENHA
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full px-4 md:px-6 py-3 md:py-4 bg-zinc-900 border-2 border-zinc-700 focus:border-lime-500 outline-none transition-colors text-base md:text-lg text-white placeholder-zinc-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-500 text-black py-4 md:py-5 text-base md:text-lg tracking-wider font-bold hover:bg-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-zinc-800 text-center">
          <p className="text-xs md:text-sm text-zinc-500">
            Acesso restrito ao administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
