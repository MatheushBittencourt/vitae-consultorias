import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { ScrollReveal } from '../hooks/useScrollAnimation';

interface StatsProps {
  onSignupClick: (planId?: string) => void;
}

type BillingPeriod = 'monthly' | 'annual';

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'SOLO',
    monthlyPrice: 89.90,
    annualPrice: 71.90, // ~20% desconto
    description: 'Ideal para profissionais individuais',
    features: [
      '1 módulo à escolha',
      '1 profissional',
      '♾️ Pacientes ilimitados',
      'Suporte por email',
      'Biblioteca de exercícios',
      'App do paciente',
    ],
  },
  {
    id: 'growth',
    name: 'PRO',
    monthlyPrice: 149.90,
    annualPrice: 119.90, // ~20% desconto
    description: 'Para profissionais que querem mais',
    features: [
      '2 módulos à escolha',
      'Até 3 profissionais',
      '♾️ Pacientes ilimitados',
      'Suporte prioritário',
      'Relatórios avançados',
      'Biblioteca completa',
    ],
    highlighted: true,
    badge: 'MAIS POPULAR',
  },
  {
    id: 'scale',
    name: 'EQUIPE',
    monthlyPrice: 249.90,
    annualPrice: 199.90, // ~20% desconto
    description: 'Para consultorias em crescimento',
    features: [
      '3 módulos à escolha',
      'Até 5 profissionais',
      '♾️ Pacientes ilimitados',
      'Suporte prioritário',
      'Relatórios avançados',
      '+R$29,90/profissional extra',
    ],
  },
  {
    id: 'enterprise',
    name: 'CLÍNICA',
    monthlyPrice: 399.90,
    annualPrice: 319.90, // ~20% desconto
    description: 'Solução completa para grandes operações',
    features: [
      'Todos os 4 módulos',
      'Até 10 profissionais',
      '♾️ Pacientes ilimitados',
      'Suporte dedicado',
      'API de integração',
      '+R$24,90/profissional extra',
    ],
    badge: 'COMPLETO',
  },
];

export function Stats({ onSignupClick }: StatsProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getPrice = (plan: Plan) => {
    return billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const getSavings = (plan: Plan) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const annualCost = plan.annualPrice * 12;
    return monthlyCost - annualCost;
  };

  return (
    <section id="planos" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-black text-white">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <ScrollReveal animation="fadeUp" className="mb-12 sm:mb-16 lg:mb-20">
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
        </ScrollReveal>

        {/* Billing Toggle */}
        <ScrollReveal animation="fadeUp" delay={0.1} className="flex justify-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-3 sm:gap-4 bg-white/5 p-1.5 sm:p-2 rounded-full border border-white/10">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`
                px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300
                ${billingPeriod === 'monthly' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-white/60 hover:text-white'
                }
              `}
              aria-pressed={billingPeriod === 'monthly'}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`
                px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300
                flex items-center gap-2
                ${billingPeriod === 'annual' 
                  ? 'bg-lime-500 text-black shadow-lg' 
                  : 'text-white/60 hover:text-white'
                }
              `}
              aria-pressed={billingPeriod === 'annual'}
            >
              Anual
              <span className={`
                px-2 py-0.5 text-xs font-bold rounded-full transition-colors
                ${billingPeriod === 'annual' 
                  ? 'bg-black text-lime-500' 
                  : 'bg-lime-500 text-black'
                }
              `}>
                -20%
              </span>
            </button>
          </div>
        </ScrollReveal>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 lg:mb-20">
          {plans.map((plan, index) => (
            <ScrollReveal 
              key={plan.id} 
              animation="fadeUp" 
              delay={0.1 + index * 0.1}
              className={`
                relative
                ${plan.highlighted 
                  ? 'bg-lime-500 text-black' 
                  : plan.badge === 'COMPLETO'
                    ? 'border-2 border-lime-500'
                    : 'border-2 border-white/20 hover:border-lime-500/50'
                } 
                p-6 sm:p-8 transition-all duration-300 group
              `}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`
                  absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 
                  px-3 sm:px-4 py-1 text-[10px] sm:text-xs font-bold tracking-widest whitespace-nowrap
                  ${plan.highlighted 
                    ? 'bg-black text-lime-500' 
                    : 'bg-lime-500 text-black'
                  }
                `}>
                  {plan.badge}
                </div>
              )}

              {/* Plan name */}
              <div className={`text-xs sm:text-sm tracking-widest mb-2 sm:mb-4 ${
                plan.highlighted ? 'text-black/60' : 'text-white/60'
              }`}>
                {plan.name}
              </div>

              {/* Price */}
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-sm">R$</span>
                <span className="text-3xl sm:text-4xl font-bold">
                  {formatPrice(getPrice(plan))}
                </span>
              </div>
              <div className={`mb-4 sm:mb-6 text-sm sm:text-base ${
                plan.highlighted ? 'text-black/60' : 'text-white/60'
              }`}>
                /mês
                {billingPeriod === 'annual' && (
                  <span className="block text-xs mt-1">
                    cobrado anualmente
                  </span>
                )}
              </div>

              {/* Annual savings */}
              {billingPeriod === 'annual' && (
                <div className={`
                  flex items-center gap-1.5 mb-4 text-xs font-medium
                  ${plan.highlighted ? 'text-black/80' : 'text-lime-400'}
                `}>
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  Economia de R$ {formatPrice(getSavings(plan))}/ano
                </div>
              )}

              {/* Description */}
              <p className={`text-sm mb-4 sm:mb-6 ${
                plan.highlighted ? 'text-black/70' : 'text-white/50'
              }`}>
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-6 sm:mb-8 text-sm" role="list">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 sm:gap-3">
                    <Check 
                      className={`w-4 h-4 flex-shrink-0 ${
                        plan.highlighted ? 'text-black' : 'text-lime-500'
                      }`} 
                      aria-hidden="true"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button 
                onClick={() => onSignupClick(plan.id)}
                className={`
                  w-full py-3 sm:py-4 font-bold text-sm transition-all duration-300
                  transform hover:scale-[1.02]
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                  ${plan.highlighted 
                    ? 'bg-black text-lime-500 hover:bg-white hover:text-black focus-visible:ring-black' 
                    : plan.badge === 'COMPLETO'
                      ? 'bg-lime-500 text-black hover:bg-lime-400 focus-visible:ring-lime-500'
                      : 'border-2 border-white text-white hover:bg-white hover:text-black focus-visible:ring-white'
                  }
                `}
              >
                COMEÇAR AGORA
              </button>
            </ScrollReveal>
          ))}
        </div>

        {/* Additional Stats */}
        <ScrollReveal animation="fadeUp" delay={0.3}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 lg:mb-20">
            {[
              { value: '500+', label: 'Consultorias ativas' },
              { value: '0%', label: 'Taxas escondidas' },
              { value: '24h', label: 'Suporte resposta' },
              { value: '99.9%', label: 'Uptime garantido' },
            ].map((stat, index) => (
              <div key={index} className="border-l-2 border-lime-500 pl-4 sm:pl-6">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-lime-500 mb-1 sm:mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* FAQ Preview */}
        <ScrollReveal animation="fadeUp" delay={0.4}>
          <div className="pt-12 sm:pt-16 lg:pt-20 border-t border-white/20">
            <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12">
              PERGUNTAS <span className="text-lime-500">FREQUENTES</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[
                {
                  q: 'Posso mudar de plano depois?',
                  a: 'Sim! Upgrade ou downgrade a qualquer momento, sem multas.',
                },
                {
                  q: 'Quais formas de pagamento?',
                  a: 'Cartão de crédito (mensal recorrente) ou PIX (anual com desconto).',
                },
                {
                  q: 'Meus dados estão seguros?',
                  a: 'Criptografia de ponta. Conformidade total com LGPD.',
                },
                {
                  q: 'Tem contrato de fidelidade?',
                  a: 'Não. Cancele quando quiser, sem burocracia.',
                },
              ].map((faq, index) => (
                <div 
                  key={index}
                  className="p-4 sm:p-6 border border-white/10 hover:border-lime-500 transition-colors"
                >
                  <div className="font-bold mb-2 text-sm sm:text-base lg:text-lg">{faq.q}</div>
                  <p className="text-white/60 text-xs sm:text-sm lg:text-base">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
