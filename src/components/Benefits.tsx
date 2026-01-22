import { 
  Clock, Shield, Smartphone, Users, BarChart3, 
  Zap, HeartPulse, Brain, RefreshCw, Lock
} from 'lucide-react';
import { ScrollReveal } from '../hooks/useScrollAnimation';

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
}

const benefits: Benefit[] = [
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Economize Tempo',
    description: 'Automatize tarefas repetitivas como prescrição de treinos, planos alimentares e agendamentos.',
    highlight: 'Menos planilhas, mais atendimentos',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Tudo Centralizado',
    description: 'Histórico completo do paciente em um só lugar: treinos, dieta, exames e evolução.',
    highlight: 'Visão 360° do paciente',
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Acesso em Qualquer Lugar',
    description: 'Plataforma 100% web, funciona em computador, tablet ou celular sem instalar nada.',
    highlight: 'Trabalhe de onde estiver',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Acompanhe a Evolução',
    description: 'Gráficos de progresso, métricas de adesão e relatórios automáticos para seus pacientes.',
    highlight: 'Dados que motivam',
  },
];

const features = [
  {
    icon: <HeartPulse className="w-5 h-5" />,
    title: '4 Módulos Integrados',
    description: 'Treino, Nutrição, Médico e Reabilitação trabalhando juntos.',
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: 'Atualizações Constantes',
    description: 'Novas funcionalidades adicionadas regularmente sem custo extra.',
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'Dados Seguros (LGPD)',
    description: 'Criptografia de ponta e conformidade total com a legislação.',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Suporte Humanizado',
    description: 'Equipe real pronta para ajudar, sem robôs ou filas.',
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: 'Fácil de Usar',
    description: 'Interface intuitiva, sem curva de aprendizado complicada.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Sem Fidelidade',
    description: 'Cancele quando quiser, sem multas ou burocracia.',
  },
];

export function Benefits() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <ScrollReveal animation="fadeUp" className="mb-12 sm:mb-16 lg:mb-20 text-center">
          <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-lime-500 text-black text-[10px] sm:text-xs tracking-widest font-bold mb-4 sm:mb-8">
            POR QUE ESCOLHER A VITAE
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 sm:mb-6">
            FOCO NO QUE<br/>
            <span className="text-lime-500">REALMENTE IMPORTA</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-zinc-600 max-w-3xl mx-auto">
            Menos tempo com burocracia, mais tempo com seus pacientes.
          </p>
        </ScrollReveal>

        {/* Main Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16 lg:mb-24">
          {benefits.map((benefit, index) => (
            <ScrollReveal 
              key={index} 
              animation="fadeUp" 
              delay={0.1 * index}
            >
              <div className="bg-zinc-50 p-6 sm:p-8 lg:p-10 h-full hover:bg-zinc-100 transition-colors group">
                {/* Icon */}
                <div className="w-14 h-14 bg-lime-500 text-black rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>

                {/* Highlight badge */}
                {benefit.highlight && (
                  <div className="inline-block px-3 py-1 bg-black text-white text-xs font-bold mb-4">
                    {benefit.highlight}
                  </div>
                )}

                {/* Content */}
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Secondary Features */}
        <ScrollReveal animation="fadeUp" delay={0.2}>
          <div className="border-t border-zinc-200 pt-12 lg:pt-16">
            <h3 className="text-2xl sm:text-3xl font-bold text-center mb-10 lg:mb-12">
              E muito mais...
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="text-center p-4 lg:p-6 hover:bg-zinc-50 rounded-xl transition-colors"
                >
                  <div className="w-12 h-12 bg-lime-500/10 text-lime-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    {feature.icon}
                  </div>
                  <h4 className="font-bold text-sm lg:text-base text-zinc-900 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-xs lg:text-sm text-zinc-500">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Platform Stats - Real capabilities, not fake user counts */}
        <ScrollReveal animation="fadeUp" delay={0.3}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-zinc-200">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-lime-500 mb-2">4</div>
              <div className="text-sm sm:text-base text-zinc-600">Módulos integrados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-lime-500 mb-2">∞</div>
              <div className="text-sm sm:text-base text-zinc-600">Pacientes ilimitados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-lime-500 mb-2">24h</div>
              <div className="text-sm sm:text-base text-zinc-600">Suporte disponível</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-lime-500 mb-2">0</div>
              <div className="text-sm sm:text-base text-zinc-600">Taxas escondidas</div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
