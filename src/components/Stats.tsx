export function Stats() {
  return (
    <section id="planos" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-black text-white">
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-lime-500 text-black text-[10px] sm:text-xs tracking-widest font-bold mb-4 sm:mb-8">
            PREÇOS TRANSPARENTES
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tighter mb-4 sm:mb-8">
            PLANOS QUE<br/>
            <span className="text-lime-500">CABEM NO BOLSO</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-white/60 max-w-3xl">
            Sem surpresas, sem taxas escondidas. Pague apenas pelo que usar.
            Cancele quando quiser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 lg:mb-20">
          {/* Basic */}
          <div className="border-2 border-white/20 p-6 sm:p-8 hover:border-lime-500 transition-colors">
            <div className="text-xs sm:text-sm tracking-widest text-white/60 mb-2 sm:mb-4">BASIC</div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">R$ 297</div>
            <div className="text-white/60 mb-6 sm:mb-8 text-sm sm:text-base">/mês</div>
            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-sm sm:text-base">
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Até 3 profissionais</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Até 30 pacientes</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>1 módulo à escolha</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Suporte por email</span>
              </li>
            </ul>
            <button className="w-full py-3 sm:py-4 border-2 border-white text-white font-bold text-sm sm:text-base hover:bg-white hover:text-black transition-colors">
              COMEÇAR TRIAL
            </button>
          </div>

          {/* Professional - Destaque */}
          <div className="bg-lime-500 text-black p-6 sm:p-8 relative">
            <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 bg-black text-lime-500 px-3 sm:px-4 py-1 text-[10px] sm:text-xs font-bold tracking-widest whitespace-nowrap">
              MAIS POPULAR
            </div>
            <div className="text-xs sm:text-sm tracking-widest mb-2 sm:mb-4">PROFESSIONAL</div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">R$ 597</div>
            <div className="text-black/60 mb-6 sm:mb-8 text-sm sm:text-base">/mês</div>
            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-sm sm:text-base">
              <li className="flex items-center gap-2 sm:gap-3">
                <span>✓</span>
                <span>Até 5 profissionais</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span>✓</span>
                <span>Até 50 pacientes</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span>✓</span>
                <span>Até 3 módulos</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span>✓</span>
                <span>Suporte prioritário</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span>✓</span>
                <span>Relatórios avançados</span>
              </li>
            </ul>
            <button className="w-full py-3 sm:py-4 bg-black text-lime-500 font-bold text-sm sm:text-base hover:bg-white hover:text-black transition-colors">
              COMEÇAR TRIAL
            </button>
          </div>

          {/* Enterprise */}
          <div className="border-2 border-lime-500 p-6 sm:p-8">
            <div className="text-xs sm:text-sm tracking-widest text-lime-500 mb-2 sm:mb-4">ENTERPRISE</div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">R$ 997</div>
            <div className="text-white/60 mb-6 sm:mb-8 text-sm sm:text-base">/mês</div>
            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-sm sm:text-base">
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Até 10 profissionais</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Até 100 pacientes</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Todos os módulos</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Suporte dedicado</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>API de integração</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>White-label disponível</span>
              </li>
            </ul>
            <button className="w-full py-3 sm:py-4 bg-lime-500 text-black font-bold text-sm sm:text-base hover:bg-lime-400 transition-colors">
              FALAR COM VENDAS
            </button>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 lg:mb-20">
          <div className="border-l-2 border-lime-500 pl-4 sm:pl-6">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-lime-500 mb-1 sm:mb-2">14 dias</div>
            <div className="text-xs sm:text-sm text-white/60">Trial grátis</div>
          </div>
          <div className="border-l-2 border-lime-500 pl-4 sm:pl-6">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-lime-500 mb-1 sm:mb-2">0%</div>
            <div className="text-xs sm:text-sm text-white/60">Taxas escondidas</div>
          </div>
          <div className="border-l-2 border-lime-500 pl-4 sm:pl-6">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-lime-500 mb-1 sm:mb-2">24h</div>
            <div className="text-xs sm:text-sm text-white/60">Suporte resposta</div>
          </div>
          <div className="border-l-2 border-lime-500 pl-4 sm:pl-6">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-lime-500 mb-1 sm:mb-2">99.9%</div>
            <div className="text-xs sm:text-sm text-white/60">Uptime garantido</div>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="pt-12 sm:pt-16 lg:pt-20 border-t border-white/20">
          <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12">
            PERGUNTAS <span className="text-lime-500">FREQUENTES</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 border border-white/10 hover:border-lime-500 transition-colors">
              <div className="font-bold mb-2 text-sm sm:text-base lg:text-lg">Posso mudar de plano depois?</div>
              <p className="text-white/60 text-xs sm:text-sm lg:text-base">Sim! Upgrade ou downgrade a qualquer momento, sem multas.</p>
            </div>
            <div className="p-4 sm:p-6 border border-white/10 hover:border-lime-500 transition-colors">
              <div className="font-bold mb-2 text-sm sm:text-base lg:text-lg">Como funciona o trial?</div>
              <p className="text-white/60 text-xs sm:text-sm lg:text-base">14 dias com acesso completo. Não pedimos cartão de crédito.</p>
            </div>
            <div className="p-4 sm:p-6 border border-white/10 hover:border-lime-500 transition-colors">
              <div className="font-bold mb-2 text-sm sm:text-base lg:text-lg">Meus dados estão seguros?</div>
              <p className="text-white/60 text-xs sm:text-sm lg:text-base">Criptografia de ponta. Conformidade total com LGPD.</p>
            </div>
            <div className="p-4 sm:p-6 border border-white/10 hover:border-lime-500 transition-colors">
              <div className="font-bold mb-2 text-sm sm:text-base lg:text-lg">Tem contrato de fidelidade?</div>
              <p className="text-white/60 text-xs sm:text-sm lg:text-base">Não. Cancele quando quiser, sem burocracia.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
