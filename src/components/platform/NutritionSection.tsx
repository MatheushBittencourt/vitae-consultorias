import { Download, Calendar, Utensils, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface NutritionSectionProps {
  athleteId?: number;
}

export function NutritionSection({ athleteId }: NutritionSectionProps) {
  // TODO: Use athleteId to fetch real data from API
  console.log('NutritionSection athleteId:', athleteId);
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">NUTRIÇÃO</span>
          </h1>
          <p className="text-xl text-zinc-600">
            Acompanhamento nutricional com Dra. Marina Costa
          </p>
        </div>
        <button className="bg-black text-white px-6 py-3 text-sm tracking-wider hover:bg-lime-500 hover:text-black transition-colors">
          AGENDAR CONSULTA
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 border-l-4 border-lime-500">
          <div className="text-sm tracking-wider text-zinc-600 mb-2">META CALÓRICA</div>
          <div className="text-2xl font-bold">2.150 kcal</div>
          <div className="text-xs text-zinc-500 mt-1">Ajustado esta semana</div>
        </div>
        <div className="bg-white p-6 border-l-4 border-black">
          <div className="text-sm tracking-wider text-zinc-600 mb-2">PROTEÍNA/DIA</div>
          <div className="text-2xl font-bold">165g</div>
          <div className="text-xs text-zinc-500 mt-1">2.2g por kg</div>
        </div>
        <div className="bg-white p-6 border-l-4 border-black">
          <div className="text-sm tracking-wider text-zinc-600 mb-2">REFEIÇÕES</div>
          <div className="text-2xl font-bold">5/dia</div>
          <div className="text-xs text-zinc-500 mt-1">A cada 3-4h</div>
        </div>
        <div className="bg-white p-6 border-l-4 border-black">
          <div className="text-sm tracking-wider text-zinc-600 mb-2">HIDRATAÇÃO</div>
          <div className="text-2xl font-bold">3.5L</div>
          <div className="text-xs text-zinc-500 mt-1">Meta diária</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Meal Plan */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Plano Alimentar Atual</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-lime-500 hover:text-black transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm font-bold">BAIXAR PDF</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Breakfast */}
              <div className="border-l-4 border-lime-500 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Utensils className="w-5 h-5" />
                  <h3 className="text-xl font-bold">Café da Manhã • 7h00</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-zinc-100">
                    <span className="text-zinc-700">4 ovos inteiros mexidos</span>
                    <span className="font-bold">280 kcal • 24g P</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-100">
                    <span className="text-zinc-700">2 fatias de pão integral</span>
                    <span className="font-bold">160 kcal • 8g P</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-100">
                    <span className="text-zinc-700">1 banana média</span>
                    <span className="font-bold">105 kcal • 1g P</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-100">
                    <span className="text-zinc-700">Café com leite desnatado</span>
                    <span className="font-bold">50 kcal • 5g P</span>
                  </div>
                  <div className="flex justify-between py-3 pt-4 font-bold border-t-2 border-lime-500">
                    <span>TOTAL REFEIÇÃO</span>
                    <span>595 kcal • 38g P</span>
                  </div>
                </div>
              </div>

              {/* Snack 1 */}
              <div className="border-l-4 border-zinc-300 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Utensils className="w-5 h-5" />
                  <h3 className="text-xl font-bold">Lanche • 10h00</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-zinc-100">
                    <span className="text-zinc-700">Whey protein (1 scoop)</span>
                    <span className="font-bold">120 kcal • 24g P</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-100">
                    <span className="text-zinc-700">15 castanhas</span>
                    <span className="font-bold">165 kcal • 5g P</span>
                  </div>
                  <div className="flex justify-between py-3 pt-4 font-bold border-t-2 border-zinc-300">
                    <span>TOTAL REFEIÇÃO</span>
                    <span>285 kcal • 29g P</span>
                  </div>
                </div>
              </div>

              {/* Lunch */}
              <div className="border-l-4 border-lime-500 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Utensils className="w-5 h-5" />
                  <h3 className="text-xl font-bold">Almoço • 13h00</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-zinc-100">
                    <span className="text-zinc-700">200g frango grelhado</span>
                    <span className="font-bold">330 kcal • 62g P</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-100">
                    <span className="text-zinc-700">150g batata doce</span>
                    <span className="font-bold">130 kcal • 2g P</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-100">
                    <span className="text-zinc-700">Salada verde à vontade</span>
                    <span className="font-bold">30 kcal • 2g P</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-100">
                    <span className="text-zinc-700">1 colher azeite</span>
                    <span className="font-bold">120 kcal • 0g P</span>
                  </div>
                  <div className="flex justify-between py-3 pt-4 font-bold border-t-2 border-lime-500">
                    <span>TOTAL REFEIÇÃO</span>
                    <span>610 kcal • 66g P</span>
                  </div>
                </div>
              </div>

              {/* More meals */}
              <div className="bg-zinc-50 p-6 text-center">
                <p className="text-zinc-600 mb-4">+ 2 refeições no plano completo</p>
                <button className="px-6 py-3 bg-black text-white hover:bg-lime-500 hover:text-black transition-colors font-bold tracking-wider">
                  VER PLANO COMPLETO
                </button>
              </div>
            </div>
          </div>

          {/* Supplements */}
          <div className="bg-white p-8">
            <h2 className="text-2xl font-bold mb-6">Suplementação</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border-l-4 border-lime-500 bg-zinc-50">
                <div className="font-bold mb-2">Whey Protein</div>
                <div className="text-sm text-zinc-600 mb-2">1 scoop pós-treino</div>
                <div className="text-xs text-zinc-500">Uso diário</div>
              </div>
              <div className="p-4 border-l-4 border-lime-500 bg-zinc-50">
                <div className="font-bold mb-2">Creatina</div>
                <div className="text-sm text-zinc-600 mb-2">5g por dia</div>
                <div className="text-xs text-zinc-500">Uso diário</div>
              </div>
              <div className="p-4 border-l-4 border-lime-500 bg-zinc-50">
                <div className="font-bold mb-2">Multivitamínico</div>
                <div className="text-sm text-zinc-600 mb-2">1 cápsula manhã</div>
                <div className="text-xs text-zinc-500">Uso diário</div>
              </div>
              <div className="p-4 border-l-4 border-lime-500 bg-zinc-50">
                <div className="font-bold mb-2">Probiótico</div>
                <div className="text-sm text-zinc-600 mb-2">1 cápsula noite</div>
                <div className="text-xs text-zinc-500">Uso diário</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Nutritionist Info */}
        <div className="space-y-6">
          <div className="bg-black text-white p-8">
            <h3 className="text-xl font-bold mb-6">Sua Nutricionista</h3>
            <div className="mb-6">
              <div className="w-full aspect-square bg-zinc-800 mb-4 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1594494563672-e134529750aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMG1pbmltYWx8ZW58MXx8fHwxNzY4MDc4MTk4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Dra. Marina Costa"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-2xl font-bold mb-1">Dra. Marina Costa</div>
              <div className="text-white/60 text-sm mb-4">RD, MSc • Nutrição Funcional</div>
              <div className="text-white/80 text-sm leading-relaxed">
                Especialista em nutrição clínica funcional com 15 anos de experiência.
              </div>
            </div>
            <button className="w-full py-3 bg-lime-500 text-black font-bold tracking-wider hover:bg-lime-400 transition-colors">
              ENVIAR MENSAGEM
            </button>
          </div>

          <div className="bg-white p-6">
            <h3 className="text-lg font-bold mb-4">Próximas Metas</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-lime-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-black text-xs font-bold">✓</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm mb-1">Atingir 75kg</div>
                  <div className="text-xs text-zinc-600">Faltam 3kg</div>
                  <div className="w-full bg-zinc-200 h-2 rounded-full mt-2">
                    <div className="bg-lime-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-zinc-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm mb-1">Reduzir BF para 12%</div>
                  <div className="text-xs text-zinc-600">Atual: 15%</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-zinc-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm mb-1">Manter massa magra</div>
                  <div className="text-xs text-zinc-600">Em progresso</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6">
            <h3 className="text-lg font-bold mb-4">Evolução Semanal</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between pb-2 border-b border-zinc-200">
                <span className="text-zinc-600">Aderência ao plano</span>
                <span className="font-bold text-lime-500">96%</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-zinc-200">
                <span className="text-zinc-600">Meta calórica</span>
                <span className="font-bold">98%</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-zinc-200">
                <span className="text-zinc-600">Meta proteica</span>
                <span className="font-bold">102%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Hidratação</span>
                <span className="font-bold">92%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6">
            <h3 className="text-lg font-bold mb-4">Imagem Ilustrativa</h3>
            <div className="aspect-video overflow-hidden rounded">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMHByZXB8ZW58MXx8fHwxNzY4MDY4NTU5fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Healthy meal prep"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
