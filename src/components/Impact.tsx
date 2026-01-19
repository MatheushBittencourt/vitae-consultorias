import { ImageWithFallback } from './figma/ImageWithFallback';
import { ScrollReveal } from '../hooks/useScrollAnimation';

export function Impact() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8" aria-label="Estatísticas e impacto">
      <div className="max-w-screen-2xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mb-16 sm:mb-24 lg:mb-32">
          <ScrollReveal animation="fadeUp" delay={0}>
            <div className="border-l-4 border-lime-500 pl-4 sm:pl-6 lg:pl-8">
              <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-2 sm:mb-4">4</div>
              <div className="text-sm sm:text-base lg:text-lg tracking-wider font-bold mb-1 sm:mb-2">MÓDULOS INTEGRADOS</div>
              <p className="text-sm sm:text-base text-zinc-600">
                Treino, Nutrição, Médico e Reabilitação em uma única plataforma.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fadeUp" delay={0.1}>
            <div className="border-l-4 border-lime-500 pl-4 sm:pl-6 lg:pl-8">
              <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-2 sm:mb-4">∞</div>
              <div className="text-sm sm:text-base lg:text-lg tracking-wider font-bold mb-1 sm:mb-2">PACIENTES</div>
              <p className="text-sm sm:text-base text-zinc-600">
                Gerencie quantos pacientes precisar. Sem limites artificiais.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fadeUp" delay={0.2}>
            <div className="border-l-4 border-lime-500 pl-4 sm:pl-6 lg:pl-8">
              <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-2 sm:mb-4">100%</div>
              <div className="text-sm sm:text-base lg:text-lg tracking-wider font-bold mb-1 sm:mb-2">PERSONALIZADO</div>
              <p className="text-sm sm:text-base text-zinc-600">
                Escolha apenas os módulos que sua consultoria precisa.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Image Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-16 sm:mb-24 lg:mb-32">
          <ScrollReveal animation="scaleUp" delay={0}>
            <div className="h-48 sm:h-64 lg:h-80 overflow-hidden rounded-lg shadow-lg">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwd29ya2luZyUyMGxhcHRvcHxlbnwxfHx8fDE3NjgwNzgzNjB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Equipe de profissionais colaborando em ambiente moderno com notebooks"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </div>
          </ScrollReveal>
          <ScrollReveal animation="scaleUp" delay={0.1}>
            <div className="h-48 sm:h-64 lg:h-80 overflow-hidden rounded-lg shadow-lg">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3Njc5OTMyMTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Tecnologia médica avançada em ambiente clínico"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </div>
          </ScrollReveal>
          <ScrollReveal animation="scaleUp" delay={0.2}>
            <div className="h-48 sm:h-64 lg:h-80 overflow-hidden rounded-lg shadow-lg">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBhbmFseXRpY3N8ZW58MXx8fHwxNzY3OTg5MDk2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Dashboard de analytics mostrando métricas e gráficos de performance"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </div>
          </ScrollReveal>
        </div>

        {/* Quote */}
        <ScrollReveal animation="fade" delay={0.3}>
          <div className="max-w-4xl mx-auto text-center px-4">
            <blockquote>
              <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight mb-4 sm:mb-6 lg:mb-8">
                "A tecnologia que sua consultoria precisa para <span className="text-lime-500 font-bold">escalar com qualidade.</span>"
              </p>
              <footer className="text-base sm:text-lg lg:text-xl text-zinc-600">— Plataforma VITAE</footer>
            </blockquote>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
