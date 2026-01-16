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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 lg:mb-20">
          {/* Starter */}
          <div className="border-2 border-white/20 p-6 sm:p-8 hover:border-lime-500 transition-colors">
            <div className="text-xs sm:text-sm tracking-widest text-white/60 mb-2 sm:mb-4">STARTER</div>
            <div className="text-3xl sm:text-4xl font-bold mb-1">R$ 159,90</div>
            <div className="text-white/60 mb-6 sm:mb-8 text-sm sm:text-base">/mês</div>
            <ul className="space-y-3 mb-6 sm:mb-8 text-sm">
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>1 módulo à escolha</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Até 3 profissionais</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Até 50 pacientes</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Suporte por email</span>
              </li>
            </ul>
            <button className="w-full py-3 sm:py-4 border-2 border-white text-white font-bold text-sm hover:bg-white hover:text-black transition-colors">
              COMEÇAR AGORA
            </button>
          </div>

          {/* Growth - Destaque */}
          <div className="bg-lime-500 text-black p-6 sm:p-8 relative">
            <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 bg-black text-lime-500 px-3 sm:px-4 py-1 text-[10px] sm:text-xs font-bold tracking-widest whitespace-nowrap">
              MAIS POPULAR
            </div>
            <div className="text-xs sm:text-sm tracking-widest mb-2 sm:mb-4">GROWTH</div>
            <div className="text-3xl sm:text-4xl font-bold mb-1">R$ 297,90</div>
            <div className="text-black/60 mb-6 sm:mb-8 text-sm sm:text-base">/mês</div>
            <ul className="space-y-3 mb-6 sm:mb-8 text-sm">
              <li className="flex items-center gap-2 sm:gap-3">
                <span>✓</span>
                <span>2 módulos à escolha</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span>✓</span>
                <span>Até 5 profissionais</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span>✓</span>
                <span>Até 80 pacientes</span>
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
            <button className="w-full py-3 sm:py-4 bg-black text-lime-500 font-bold text-sm hover:bg-white hover:text-black transition-colors">
              COMEÇAR AGORA
            </button>
          </div>

          {/* Scale */}
          <div className="border-2 border-white/20 p-6 sm:p-8 hover:border-lime-500 transition-colors">
            <div className="text-xs sm:text-sm tracking-widest text-white/60 mb-2 sm:mb-4">SCALE</div>
            <div className="text-3xl sm:text-4xl font-bold mb-1">R$ 497,90</div>
            <div className="text-white/60 mb-6 sm:mb-8 text-sm sm:text-base">/mês</div>
            <ul className="space-y-3 mb-6 sm:mb-8 text-sm">
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>3 módulos à escolha</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Até 10 profissionais</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Até 200 pacientes</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Suporte prioritário</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Relatórios avançados</span>
              </li>
            </ul>
            <button className="w-full py-3 sm:py-4 border-2 border-white text-white font-bold text-sm hover:bg-white hover:text-black transition-colors">
              COMEÇAR AGORA
            </button>
          </div>

          {/* Enterprise */}
          <div className="border-2 border-lime-500 p-6 sm:p-8">
            <div className="text-xs sm:text-sm tracking-widest text-lime-500 mb-2 sm:mb-4">ENTERPRISE</div>
            <div className="text-3xl sm:text-4xl font-bold mb-1">R$ 797,90</div>
            <div className="text-white/60 mb-6 sm:mb-8 text-sm sm:text-base">/mês</div>
            <ul className="space-y-3 mb-6 sm:mb-8 text-sm">
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Todos os 4 módulos</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Até 20 profissionais</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-lime-500">✓</span>
                <span>Até 250 pacientes</span>
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
            <button className="w-full py-3 sm:py-4 bg-lime-500 text-black font-bold text-sm hover:bg-lime-400 transition-colors">
              FALAR COM VENDAS
            </button>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 lg:mb-20">
          <div className="border-l-2 border-lime-500 pl-4 sm:pl-6">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-lime-500 mb-1 sm:mb-2">500+</div>
            <div className="text-xs sm:text-sm text-white/60">Consultorias ativas</div>
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
              <div className="font-bold mb-2 text-sm sm:text-base lg:text-lg">Quais formas de pagamento?</div>
              <p className="text-white/60 text-xs sm:text-sm lg:text-base">Cartão de crédito com cobrança mensal automática via Mercado Pago.</p>
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
