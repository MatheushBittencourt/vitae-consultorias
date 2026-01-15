import { ImageWithFallback } from './figma/ImageWithFallback';

export function Method() {
  return (
    <section id="como-funciona" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-50">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tighter mb-4 sm:mb-6">
            COMO<br/>
            <span className="text-lime-500">FUNCIONA</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-zinc-600 max-w-3xl">
            Em poucos passos sua consultoria estará operando de forma totalmente digital.
            Setup rápido, suporte dedicado e resultados imediatos.
          </p>
        </div>

        {/* Steps with Images */}
        <div className="space-y-16 sm:space-y-24 lg:space-y-32">
          {/* Step 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-2">
              <div className="text-5xl sm:text-6xl lg:text-8xl font-bold text-lime-500/20 mb-2 sm:mb-4">01</div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">ESCOLHA SEU PLANO</h3>
              <p className="text-base sm:text-lg lg:text-xl text-zinc-600 leading-relaxed mb-4 sm:mb-6">
                Basic, Professional ou Enterprise. Cada um com módulos e limites diferentes.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-zinc-500 leading-relaxed">
                Comece com trial de 14 dias grátis. Sem compromisso, sem cartão de crédito.
                Teste tudo antes de decidir.
              </p>
            </div>
            <div className="lg:col-span-3 grid grid-cols-2 gap-2 sm:gap-4">
              <div className="h-48 sm:h-64 lg:h-96 overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmljaW5nJTIwcGxhbnN8ZW58MXx8fHwxNzY3OTg5MDk2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Pricing plans"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-48 sm:h-64 lg:h-96 overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmd8ZW58MXx8fHwxNzY4MDc4MzY0fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Business meeting"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-3 grid grid-cols-2 gap-2 sm:gap-4 order-2 lg:order-1">
              <div className="h-48 sm:h-64 lg:h-96 overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwb25ib2FyZGluZ3xlbnwxfHx8fDE3NjgwNzgzNjB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Team onboarding"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-48 sm:h-64 lg:h-96 overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFpbmluZyUyMHNlc3Npb258ZW58MXx8fHwxNzY4MDc4MzU4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Training session"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="text-5xl sm:text-6xl lg:text-8xl font-bold text-lime-500/20 mb-2 sm:mb-4">02</div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">CONFIGURE SUA EQUIPE</h3>
              <p className="text-base sm:text-lg lg:text-xl text-zinc-600 leading-relaxed mb-4 sm:mb-6">
                Cadastre seus profissionais e defina permissões de acesso para cada um.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-zinc-500 leading-relaxed">
                Personal, nutricionista, médico, fisioterapeuta. Cada um vê apenas o que precisa.
                Segurança e privacidade garantidas.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-2">
              <div className="text-5xl sm:text-6xl lg:text-8xl font-bold text-lime-500/20 mb-2 sm:mb-4">03</div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">CADASTRE PACIENTES</h3>
              <p className="text-base sm:text-lg lg:text-xl text-zinc-600 leading-relaxed mb-4 sm:mb-6">
                Adicione seus pacientes e comece a criar protocolos personalizados.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-zinc-500 leading-relaxed">
                Cada paciente tem seu próprio portal de acesso. 
                Eles acompanham treinos, dietas e consultas pelo celular.
              </p>
            </div>
            <div className="lg:col-span-3 grid grid-cols-2 gap-2 sm:gap-4">
              <div className="h-48 sm:h-64 lg:h-96 overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXRpZW50JTIwYXBwfGVufDF8fHx8MTc2ODA3ODM2NHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Patient app"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-48 sm:h-64 lg:h-96 overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1573164713988-8665fc963095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBoZWFsdGh8ZW58MXx8fHwxNzY4MDc4MzYwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Mobile health"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-3 grid grid-cols-2 gap-2 sm:gap-4 order-2 lg:order-1">
              <div className="h-48 sm:h-64 lg:h-96 overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmFseXRpY3MlMjBkYXNoYm9hcmR8ZW58MXx8fHwxNzY4MDMwODUwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Analytics dashboard"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-48 sm:h-64 lg:h-96 overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm93dGglMjBjaGFydHxlbnwxfHx8fDE3NjgwNDcwNjN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Growth chart"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="text-5xl sm:text-6xl lg:text-8xl font-bold text-lime-500/20 mb-2 sm:mb-4">04</div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">ACOMPANHE RESULTADOS</h3>
              <p className="text-base sm:text-lg lg:text-xl text-zinc-600 leading-relaxed mb-4 sm:mb-6">
                Dashboard completo com métricas de evolução e engajamento.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-zinc-500 leading-relaxed">
                Visualize o progresso de cada paciente. Identifique oportunidades de melhoria.
                Tome decisões baseadas em dados reais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
