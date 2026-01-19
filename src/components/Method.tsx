import { ImageWithFallback } from './figma/ImageWithFallback';
import { ScrollReveal } from '../hooks/useScrollAnimation';

const steps = [
  {
    number: '01',
    title: 'ESCOLHA SEU PLANO',
    description: 'Starter, Growth, Scale ou Enterprise. Cada um com módulos e limites diferentes.',
    detail: 'Escolha os módulos que sua consultoria precisa. Comece pequeno e escale quando quiser. Sem fidelidade, cancele quando precisar.',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmljaW5nJTIwcGxhbnN8ZW58MXx8fHwxNzY3OTg5MDk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Tabela de preços e planos de assinatura',
      },
      {
        src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmd8ZW58MXx8fHwxNzY4MDc4MzY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Reunião de negócios para definição de estratégia',
      },
    ],
    reverse: false,
  },
  {
    number: '02',
    title: 'CONFIGURE SUA EQUIPE',
    description: 'Cadastre seus profissionais e defina permissões de acesso para cada um.',
    detail: 'Personal, nutricionista, médico, fisioterapeuta. Cada um vê apenas o que precisa. Segurança e privacidade garantidas.',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwb25ib2FyZGluZ3xlbnwxfHx8fDE3NjgwNzgzNjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Processo de onboarding de nova equipe',
      },
      {
        src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFpbmluZyUyMHNlc3Npb258ZW58MXx8fHwxNzY4MDc4MzU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Sessão de treinamento para equipe',
      },
    ],
    reverse: true,
  },
  {
    number: '03',
    title: 'CADASTRE PACIENTES',
    description: 'Adicione seus pacientes e comece a criar protocolos personalizados.',
    detail: 'Cada paciente tem seu próprio portal de acesso. Eles acompanham treinos, dietas e consultas pelo celular.',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXRpZW50JTIwYXBwfGVufDF8fHx8MTc2ODA3ODM2NHww&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Aplicativo de saúde para pacientes',
      },
      {
        src: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBoZWFsdGh8ZW58MXx8fHwxNzY4MDc4MzYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Profissional usando aplicativo mobile de saúde',
      },
    ],
    reverse: false,
  },
  {
    number: '04',
    title: 'ACOMPANHE RESULTADOS',
    description: 'Dashboard completo com métricas de evolução e engajamento.',
    detail: 'Visualize o progresso de cada paciente. Identifique oportunidades de melhoria. Tome decisões baseadas em dados reais.',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmFseXRpY3MlMjBkYXNoYm9hcmR8ZW58MXx8fHwxNzY4MDMwODUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Dashboard de analytics com gráficos de evolução',
      },
      {
        src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm93dGglMjBjaGFydHxlbnwxfHx8fDE3NjgwNDcwNjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Gráfico de crescimento e métricas de sucesso',
      },
    ],
    reverse: true,
  },
];

export function Method() {
  return (
    <section id="como-funciona" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-50" aria-label="Como funciona">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <ScrollReveal animation="fadeUp" className="mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tighter mb-4 sm:mb-6">
            COMO<br/>
            <span className="text-lime-500">FUNCIONA</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-zinc-600 max-w-3xl">
            Em poucos passos sua consultoria estará operando de forma totalmente digital.
            Setup rápido, suporte dedicado e resultados imediatos.
          </p>
        </ScrollReveal>

        {/* Steps with Images */}
        <div className="space-y-16 sm:space-y-24 lg:space-y-32">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 items-center"
            >
              {/* Text */}
              <ScrollReveal 
                animation={step.reverse ? 'fadeRight' : 'fadeLeft'} 
                delay={0.1}
                className={`lg:col-span-2 ${step.reverse ? 'order-1 lg:order-2' : ''}`}
              >
                <div className="text-5xl sm:text-6xl lg:text-8xl font-bold text-lime-500/20 mb-2 sm:mb-4" aria-hidden="true">
                  {step.number}
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                  <span className="sr-only">Passo {step.number}: </span>
                  {step.title}
                </h3>
                <p className="text-base sm:text-lg lg:text-xl text-zinc-600 leading-relaxed mb-4 sm:mb-6">
                  {step.description}
                </p>
                <p className="text-sm sm:text-base lg:text-lg text-zinc-500 leading-relaxed">
                  {step.detail}
                </p>
              </ScrollReveal>

              {/* Images */}
              <ScrollReveal 
                animation={step.reverse ? 'fadeLeft' : 'fadeRight'} 
                delay={0.2}
                className={`lg:col-span-3 grid grid-cols-2 gap-2 sm:gap-4 ${step.reverse ? 'order-2 lg:order-1' : ''}`}
              >
                {step.images.map((image, imgIndex) => (
                  <div 
                    key={imgIndex} 
                    className="h-48 sm:h-64 lg:h-96 overflow-hidden rounded-lg shadow-lg"
                  >
                    <ImageWithFallback
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </ScrollReveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
