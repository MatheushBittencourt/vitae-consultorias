import { Mail, MessageCircle, Instagram, Linkedin, ExternalLink, Shield, Clock, Headphones } from 'lucide-react';
import { Logo } from './ui/Logo';
import { ScrollReveal } from '../hooks/useScrollAnimation';

const contactOptions = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    description: 'Resposta em até 2h',
    action: 'Conversar agora',
    href: 'https://wa.me/5511999999999',
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    hoverColor: 'hover:bg-green-500 hover:text-white',
  },
  {
    icon: Mail,
    title: 'Email',
    description: 'suporte@vitaeconsultorias.com.br',
    action: 'Enviar email',
    href: 'mailto:suporte@vitaeconsultorias.com.br',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    hoverColor: 'hover:bg-blue-500 hover:text-white',
  },
];

const socialLinks = [
  { icon: Instagram, href: 'https://instagram.com/vitaeconsultorias', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com/company/vitae', label: 'LinkedIn' },
];

const footerLinks = [
  {
    title: 'Produto',
    links: [
      { label: 'Módulos', href: '#modulos' },
      { label: 'Preços', href: '#planos' },
      { label: 'Como Funciona', href: '#como-funciona' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Carreiras', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidade', href: '#' },
      { label: 'Termos de Uso', href: '#' },
      { label: 'LGPD', href: '#' },
    ],
  },
];

const trustBadges = [
  { icon: Shield, label: 'Dados protegidos LGPD' },
  { icon: Clock, label: 'Uptime 99.9%' },
  { icon: Headphones, label: 'Suporte brasileiro' },
];

export function Contact() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white" role="contentinfo">
      <div className="max-w-screen-2xl mx-auto">
        {/* Contact Section */}
        <ScrollReveal animation="fadeUp" className="mb-16 sm:mb-20 lg:mb-24">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-lime-500 text-black text-[10px] sm:text-xs tracking-widest font-bold mb-4 sm:mb-8">
              FALE CONOSCO
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-4 sm:mb-6">
              PRECISA DE <span className="text-lime-500">AJUDA?</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-zinc-600 max-w-2xl mx-auto">
              Nossa equipe está pronta para ajudar você a dar o próximo passo na transformação digital da sua consultoria.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
            {contactOptions.map((option) => {
              const Icon = option.icon;
              return (
                <a
                  key={option.title}
                  href={option.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    block p-5 sm:p-6 border ${option.color} rounded-xl
                    transition-all duration-300 group
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2
                    ${option.hoverColor}
                  `}
                  aria-label={`${option.title}: ${option.description}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/80 group-hover:bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{option.title}</h3>
                      <p className="text-sm opacity-80 mb-3">{option.description}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium">
                        {option.action}
                        <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Trust Badges */}
        <ScrollReveal animation="fadeUp" delay={0.1}>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-16 sm:mb-20 lg:mb-24 py-8 sm:py-10 border-y border-zinc-200">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.label} className="flex items-center gap-2 sm:gap-3 text-zinc-600">
                  <Icon className="w-5 h-5 text-lime-500" aria-hidden="true" />
                  <span className="text-sm sm:text-base font-medium">{badge.label}</span>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Footer Links */}
        <ScrollReveal animation="fadeUp" delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-12 sm:mb-16">
            {/* Logo column */}
            <div className="col-span-2 md:col-span-1">
              <Logo size="lg" showText={true} textColor="dark" className="mb-4" />
              <p className="text-sm text-zinc-500 mb-4">
                Plataforma completa para gestão de consultorias esportivas e de saúde.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-zinc-100 hover:bg-lime-500 rounded-lg flex items-center justify-center 
                                 text-zinc-600 hover:text-black transition-colors
                                 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2"
                      aria-label={`Siga-nos no ${social.label}`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Link columns */}
            {footerLinks.map((column) => (
              <nav key={column.title} aria-label={`Links de ${column.title}`}>
                <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-900 mb-4">
                  {column.title}
                </h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-zinc-600 hover:text-lime-600 transition-colors
                                   focus:outline-none focus-visible:text-lime-600 focus-visible:underline"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </ScrollReveal>

        {/* Bottom Bar */}
        <div className="pt-8 sm:pt-10 border-t border-zinc-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <Logo size="sm" showText={false} />
            
            <p className="text-xs sm:text-sm text-zinc-500 text-center">
              © {currentYear} VITAE Consultorias. Todos os direitos reservados.
            </p>
            
            <div className="flex items-center gap-4 text-xs sm:text-sm text-zinc-500">
              <a 
                href="#" 
                className="hover:text-zinc-700 transition-colors focus:outline-none focus-visible:text-lime-600 focus-visible:underline"
              >
                Privacidade
              </a>
              <span aria-hidden="true">•</span>
              <a 
                href="#" 
                className="hover:text-zinc-700 transition-colors focus:outline-none focus-visible:text-lime-600 focus-visible:underline"
              >
                Termos
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
