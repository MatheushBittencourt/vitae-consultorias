import { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, User, Briefcase, Shield } from 'lucide-react';
import { Logo } from './ui/Logo';

interface HeaderProps {
  onLoginClick?: () => void;
  onAdminClick?: () => void;
  onSuperAdminClick?: () => void;
  onSignupClick?: () => void;
}

export function Header({ onLoginClick, onAdminClick, onSuperAdminClick, onSignupClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLoginDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoginSelect = (type: 'patient' | 'admin' | 'superadmin') => {
    setLoginDropdownOpen(false);
    setMobileMenuOpen(false);
    if (type === 'patient') onLoginClick?.();
    else if (type === 'admin') onAdminClick?.();
    else onSuperAdminClick?.();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <Logo size="md" showText={false} />
          </a>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-2">
            <a 
              href="#modulos" 
              className="px-5 py-2.5 text-base font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors tracking-wide"
            >
              Módulos
            </a>
            <a 
              href="#como-funciona" 
              className="px-5 py-2.5 text-base font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors tracking-wide"
            >
              Como Funciona
            </a>
            <a 
              href="#planos" 
              className="px-5 py-2.5 text-base font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors tracking-wide"
            >
              Planos
            </a>
          </nav>

          {/* Desktop Actions - Right */}
          <div className="hidden md:flex items-center gap-3">
            {/* Login Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Entrar
                <ChevronDown className={`w-4 h-4 transition-transform ${loginDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {loginDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    <button
                      onClick={() => handleLoginSelect('patient')}
                      className="w-full flex items-start gap-4 p-4 rounded-lg hover:bg-zinc-50 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 bg-lime-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-lime-200 transition-colors">
                        <User className="w-5 h-5 text-lime-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-900 mb-0.5">Sou Paciente</div>
                        <div className="text-sm text-zinc-500">Acesse seu portal de acompanhamento</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleLoginSelect('admin')}
                      className="w-full flex items-start gap-4 p-4 rounded-lg hover:bg-zinc-50 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-900 mb-0.5">Sou Profissional</div>
                        <div className="text-sm text-zinc-500">Painel de gestão de pacientes</div>
                      </div>
                    </button>

                    <div className="border-t border-zinc-100 mt-2 pt-2">
                      <button
                        onClick={() => handleLoginSelect('superadmin')}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors text-left text-sm text-zinc-500 hover:text-zinc-700"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Administração do Sistema</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Primary CTA */}
            <button 
              onClick={onSignupClick}
              className="px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-lime-500 hover:text-black transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Começar Grátis
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-200 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-screen-2xl mx-auto px-4 py-4">
            {/* Mobile Nav Links */}
            <nav className="space-y-1 mb-6">
              <a 
                href="#modulos" 
                className="block px-4 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Módulos
              </a>
              <a 
                href="#como-funciona" 
                className="block px-4 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Como Funciona
              </a>
              <a 
                href="#planos" 
                className="block px-4 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Planos
              </a>
            </nav>

            {/* Mobile Login Options */}
            <div className="border-t border-zinc-200 pt-4 space-y-2">
              <p className="px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Acessar como</p>
              
              <button
                onClick={() => handleLoginSelect('patient')}
                className="w-full flex items-center gap-4 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                <div className="w-10 h-10 bg-lime-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-lime-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-zinc-900">Paciente</div>
                  <div className="text-sm text-zinc-500">Portal de acompanhamento</div>
                </div>
              </button>

              <button
                onClick={() => handleLoginSelect('admin')}
                className="w-full flex items-center gap-4 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-zinc-900">Profissional</div>
                  <div className="text-sm text-zinc-500">Painel de gestão</div>
                </div>
              </button>

              <button
                onClick={() => handleLoginSelect('superadmin')}
                className="w-full flex items-center gap-3 p-3 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Administração do Sistema</span>
              </button>
            </div>

            {/* Mobile CTA */}
            <div className="mt-6">
              <button 
                onClick={() => { onSignupClick?.(); setMobileMenuOpen(false); }}
                className="w-full py-4 bg-black text-white text-base font-semibold rounded-xl hover:bg-lime-500 hover:text-black transition-all duration-200"
              >
                Começar Grátis
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
