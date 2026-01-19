import { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, User, Briefcase, Shield } from 'lucide-react';
import { Logo } from './ui/Logo';
import { useSmoothScroll } from '../hooks/useSmoothScroll';

interface HeaderProps {
  onLoginClick?: () => void;
  onAdminClick?: () => void;
  onSuperAdminClick?: () => void;
  onSignupClick?: () => void;
}

// IDs das seções para navegação
const SECTION_IDS = ['modulos', 'como-funciona', 'plataforma', 'planos'];

export function Header({ onLoginClick, onAdminClick, onSuperAdminClick, onSignupClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { handleAnchorClick, scrollToTop } = useSmoothScroll({ offset: 80 });

  // Detectar scroll para mudar estilo do header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Detectar seção ativa
      const scrollY = window.scrollY + 100;
      
      for (const id of [...SECTION_IDS].reverse()) {
        const element = document.getElementById(id);
        if (element) {
          const { top } = element.getBoundingClientRect();
          const elementTop = top + window.scrollY;
          
          if (scrollY >= elementTop) {
            setActiveSection(id);
            return;
          }
        }
      }
      setActiveSection(null);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Fechar menu mobile ao clicar em link
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    handleAnchorClick(e);
    setMobileMenuOpen(false);
  };

  const handleLoginSelect = (type: 'patient' | 'admin' | 'superadmin') => {
    setLoginDropdownOpen(false);
    setMobileMenuOpen(false);
    if (type === 'patient') onLoginClick?.();
    else if (type === 'admin') onAdminClick?.();
    else onSuperAdminClick?.();
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTop();
  };

  const navLinks = [
    { href: '#modulos', label: 'Módulos' },
    { href: '#como-funciona', label: 'Como Funciona' },
    { href: '#plataforma', label: 'Plataforma' },
    { href: '#planos', label: 'Planos' },
  ];

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 
        transition-all duration-300
        ${isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-zinc-200' 
          : 'bg-white/80 backdrop-blur-md border-b border-zinc-200'
        }
      `}
      role="banner"
    >
      {/* Skip to content - Acessibilidade */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 
                   focus:px-4 focus:py-2 focus:bg-lime-500 focus:text-black focus:font-bold"
      >
        Pular para o conteúdo principal
      </a>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a 
            href="#" 
            onClick={handleLogoClick}
            className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 rounded-lg"
            aria-label="VITAE - Voltar ao início"
          >
            <Logo size="md" showText={false} />
          </a>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Navegação principal">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.slice(1);
              return (
                <a 
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                  className={`
                    px-5 py-2.5 text-base font-semibold rounded-lg transition-all duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2
                    ${isActive 
                      ? 'text-lime-600 bg-lime-50' 
                      : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                  {isActive && (
                    <span className="sr-only"> (seção atual)</span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop Actions - Right */}
          <div className="hidden md:flex items-center gap-3">
            {/* Login Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-700 
                           hover:text-black hover:bg-zinc-100 rounded-lg transition-colors
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2"
                aria-expanded={loginDropdownOpen}
                aria-haspopup="true"
              >
                Entrar
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${loginDropdownOpen ? 'rotate-180' : ''}`} 
                  aria-hidden="true"
                />
              </button>

              {/* Dropdown Menu */}
              <div 
                className={`
                  absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl 
                  border border-zinc-200 overflow-hidden
                  transition-all duration-200 origin-top-right
                  ${loginDropdownOpen 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }
                `}
                role="menu"
                aria-orientation="vertical"
                aria-hidden={!loginDropdownOpen}
              >
                <div className="p-2">
                  <button
                    onClick={() => handleLoginSelect('patient')}
                    className="w-full flex items-start gap-4 p-4 rounded-lg hover:bg-zinc-50 
                               transition-colors text-left group
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lime-500"
                    role="menuitem"
                  >
                    <div className="w-10 h-10 bg-lime-100 rounded-lg flex items-center justify-center flex-shrink-0 
                                    group-hover:bg-lime-200 transition-colors" aria-hidden="true">
                      <User className="w-5 h-5 text-lime-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-900 mb-0.5">Sou Paciente</div>
                      <div className="text-sm text-zinc-500">Acesse seu portal de acompanhamento</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleLoginSelect('admin')}
                    className="w-full flex items-start gap-4 p-4 rounded-lg hover:bg-zinc-50 
                               transition-colors text-left group
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lime-500"
                    role="menuitem"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 
                                    group-hover:bg-blue-200 transition-colors" aria-hidden="true">
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
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 
                                 transition-colors text-left text-sm text-zinc-500 hover:text-zinc-700
                                 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lime-500"
                      role="menuitem"
                    >
                      <Shield className="w-4 h-4" aria-hidden="true" />
                      <span>Administração do Sistema</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary CTA */}
            <button 
              onClick={onSignupClick}
              className="px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-lg 
                         hover:bg-lime-500 hover:text-black transition-all duration-200 
                         shadow-sm hover:shadow-md transform hover:scale-[1.02]
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2"
            >
              Começar Grátis
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-zinc-100 transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        id="mobile-menu"
        className={`
          md:hidden bg-white border-t border-zinc-200 
          transition-all duration-300 ease-out overflow-hidden
          ${mobileMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'}
        `}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          {/* Mobile Nav Links */}
          <nav className="space-y-1 mb-6" role="navigation" aria-label="Navegação mobile">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.slice(1);
              return (
                <a 
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                  className={`
                    block px-4 py-3 text-base font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'text-lime-600 bg-lime-50' 
                      : 'text-zinc-700 hover:bg-zinc-100'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Mobile Login Options */}
          <div className="border-t border-zinc-200 pt-4 space-y-2">
            <p className="px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Acessar como
            </p>
            
            <button
              onClick={() => handleLoginSelect('patient')}
              className="w-full flex items-center gap-4 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
            >
              <div className="w-10 h-10 bg-lime-100 rounded-lg flex items-center justify-center" aria-hidden="true">
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
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center" aria-hidden="true">
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
              <Shield className="w-4 h-4" aria-hidden="true" />
              <span>Administração do Sistema</span>
            </button>
          </div>

          {/* Mobile CTA */}
          <div className="mt-6">
            <button 
              onClick={() => { onSignupClick?.(); setMobileMenuOpen(false); }}
              className="w-full py-4 bg-black text-white text-base font-semibold rounded-xl 
                         hover:bg-lime-500 hover:text-black transition-all duration-200"
            >
              Começar Grátis
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
