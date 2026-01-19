import { Dumbbell, Apple, Stethoscope, HeartPulse } from 'lucide-react';
import { ScrollReveal } from '../hooks/useScrollAnimation';

const modules = [
  {
    name: 'Treinamento',
    icon: Dumbbell,
    description: 'Gestão completa de treinos e exercícios',
    features: [
      'Criação de planos personalizados',
      'Biblioteca de exercícios',
      'Acompanhamento de evolução',
      'Vídeos demonstrativos'
    ],
    color: 'orange',
  },
  {
    name: 'Nutrição',
    icon: Apple,
    description: 'Controle nutricional detalhado',
    features: [
      'Planos alimentares completos',
      'Cálculo de macros automático',
      'Lista de substituições',
      'Acompanhamento de dieta'
    ],
    color: 'green',
  },
  {
    name: 'Médico',
    icon: Stethoscope,
    description: 'Prontuário e histórico médico',
    features: [
      'Registro de consultas',
      'Upload de exames (PDF/imagem)',
      'Histórico de diagnósticos',
      'Prescrições e tratamentos'
    ],
    color: 'blue',
  },
  {
    name: 'Reabilitação',
    icon: HeartPulse,
    description: 'Sessões de fisioterapia e recuperação',
    features: [
      'Agendamento de sessões',
      'Protocolos de reabilitação',
      'Acompanhamento de lesões',
      'Notas de evolução'
    ],
    color: 'pink',
  },
];

const colorClasses = {
  orange: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-500',
    border: 'border-orange-500/30',
  },
  green: {
    bg: 'bg-green-500/20',
    text: 'text-green-500',
    border: 'border-green-500/30',
  },
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-500',
    border: 'border-blue-500/30',
  },
  pink: {
    bg: 'bg-pink-500/20',
    text: 'text-pink-500',
    border: 'border-pink-500/30',
  },
};

export function Team() {
  return (
    <section id="modulos" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-black text-white" aria-label="Módulos disponíveis">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <ScrollReveal animation="fadeUp" className="mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-lime-500 text-black text-[10px] sm:text-xs tracking-widest font-bold mb-4 sm:mb-8">
            ESCOLHA O QUE PRECISA
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tighter mb-4 sm:mb-6">
            MÓDULOS<br/>
            <span className="text-lime-500">FLEXÍVEIS</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-white/60 max-w-3xl">
            Monte sua plataforma do seu jeito. Ative apenas os módulos que fazem sentido 
            para o seu negócio. Pague apenas pelo que usar.
          </p>
        </ScrollReveal>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8" role="list">
          {modules.map((module, index) => {
            const Icon = module.icon;
            const colors = colorClasses[module.color as keyof typeof colorClasses];
            
            return (
              <ScrollReveal 
                key={module.name}
                animation="fadeUp" 
                delay={index * 0.1}
                className="border border-white/10 p-5 sm:p-6 lg:p-8 hover:border-lime-500/50 transition-all duration-300 group"
                as="article"
              >
                <div className="flex items-start gap-4 sm:gap-6 mb-4 sm:mb-6" role="listitem">
                  <div 
                    className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 ${colors.bg} ${colors.border} border flex items-center justify-center flex-shrink-0`}
                    aria-hidden="true"
                  >
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${colors.text}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 group-hover:text-lime-500 transition-colors">
                      {module.name}
                    </h3>
                    <p className="text-white/60 text-sm sm:text-base">{module.description}</p>
                  </div>
                </div>
                
                <ul className="space-y-2 sm:space-y-3" aria-label={`Funcionalidades do módulo ${module.name}`}>
                  {module.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 sm:gap-3">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-lime-500 flex-shrink-0" aria-hidden="true"></div>
                      <span className="text-white/80 text-sm sm:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
