import { TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react';

interface ProgressSectionProps {
  athleteId?: number;
}

export function ProgressSection({ athleteId }: ProgressSectionProps) {
  // TODO: Use athleteId to fetch real data from API
  console.log('ProgressSection athleteId:', athleteId);
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">PROGRESSO</span>
          </h1>
          <p className="text-xl text-zinc-600">
            Acompanhe sua evolução em todas as áreas
          </p>
        </div>
        <button className="bg-black text-white px-6 py-3 text-sm tracking-wider hover:bg-lime-500 hover:text-black transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          RELATÓRIO COMPLETO
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-lime-500 text-black p-6">
          <div className="text-sm tracking-wider mb-2">PESO ATUAL</div>
          <div className="text-4xl font-bold mb-2">78kg</div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingDown className="w-4 h-4" />
            <span className="font-bold">-8kg desde início</span>
          </div>
        </div>
        <div className="bg-white p-6 border-l-4 border-black">
          <div className="text-sm tracking-wider text-zinc-600 mb-2">BF ATUAL</div>
          <div className="text-4xl font-bold mb-2">15%</div>
          <div className="flex items-center gap-2 text-sm text-lime-600">
            <TrendingDown className="w-4 h-4" />
            <span className="font-bold">-7% desde início</span>
          </div>
        </div>
        <div className="bg-white p-6 border-l-4 border-black">
          <div className="text-sm tracking-wider text-zinc-600 mb-2">MASSA MAGRA</div>
          <div className="text-4xl font-bold mb-2">66kg</div>
          <div className="flex items-center gap-2 text-sm text-lime-600">
            <TrendingUp className="w-4 h-4" />
            <span className="font-bold">+2kg desde início</span>
          </div>
        </div>
        <div className="bg-white p-6 border-l-4 border-black">
          <div className="text-sm tracking-wider text-zinc-600 mb-2">META</div>
          <div className="text-4xl font-bold mb-2">75kg</div>
          <div className="text-sm text-zinc-600">12% BF</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Evolution */}
        <div className="bg-white p-8">
          <h2 className="text-2xl font-bold mb-6">Evolução de Peso</h2>
          <div className="space-y-4">
            {/* Simple bar chart representation */}
            <div className="space-y-3">
              <div className="flex items-end gap-2 h-48">
                {[
                  { month: 'Set', value: 86, color: 'bg-zinc-300' },
                  { month: 'Out', value: 84, color: 'bg-zinc-300' },
                  { month: 'Nov', value: 82, color: 'bg-zinc-300' },
                  { month: 'Dez', value: 80, color: 'bg-lime-500' },
                  { month: 'Jan', value: 78, color: 'bg-lime-500' },
                ].map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative group">
                      <div
                        className={`${data.color} w-full transition-all hover:opacity-80`}
                        style={{ height: `${(data.value / 86) * 100}%` }}
                      ></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-1 text-xs font-bold rounded whitespace-nowrap">
                        {data.value}kg
                      </div>
                    </div>
                    <div className="text-sm font-bold text-zinc-600">{data.month}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-200 text-sm text-zinc-600">
              <div className="flex items-center justify-between">
                <span>Início: 86kg</span>
                <span className="font-bold text-lime-500">-8kg em 4 meses</span>
                <span>Atual: 78kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Fat Evolution */}
        <div className="bg-white p-8">
          <h2 className="text-2xl font-bold mb-6">Evolução de BF%</h2>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-end gap-2 h-48">
                {[
                  { month: 'Set', value: 22, color: 'bg-zinc-300' },
                  { month: 'Out', value: 20, color: 'bg-zinc-300' },
                  { month: 'Nov', value: 18, color: 'bg-zinc-300' },
                  { month: 'Dez', value: 16, color: 'bg-lime-500' },
                  { month: 'Jan', value: 15, color: 'bg-lime-500' },
                ].map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative group">
                      <div
                        className={`${data.color} w-full transition-all hover:opacity-80`}
                        style={{ height: `${(data.value / 22) * 100}%` }}
                      ></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-1 text-xs font-bold rounded whitespace-nowrap">
                        {data.value}%
                      </div>
                    </div>
                    <div className="text-sm font-bold text-zinc-600">{data.month}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-200 text-sm text-zinc-600">
              <div className="flex items-center justify-between">
                <span>Início: 22%</span>
                <span className="font-bold text-lime-500">-7% em 4 meses</span>
                <span>Atual: 15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Body Measurements */}
        <div className="bg-white p-8">
          <h3 className="text-xl font-bold mb-6">Medidas Corporais</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-zinc-600">Cintura</span>
                <span className="font-bold">88cm → 78cm</span>
              </div>
              <div className="w-full bg-zinc-200 h-2 rounded-full">
                <div className="bg-lime-500 h-2 rounded-full" style={{ width: '89%' }}></div>
              </div>
              <div className="text-xs text-lime-600 mt-1">-10cm</div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-zinc-600">Peito</span>
                <span className="font-bold">98cm → 104cm</span>
              </div>
              <div className="w-full bg-zinc-200 h-2 rounded-full">
                <div className="bg-lime-500 h-2 rounded-full" style={{ width: '106%' }}></div>
              </div>
              <div className="text-xs text-lime-600 mt-1">+6cm</div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-zinc-600">Braço</span>
                <span className="font-bold">32cm → 36cm</span>
              </div>
              <div className="w-full bg-zinc-200 h-2 rounded-full">
                <div className="bg-lime-500 h-2 rounded-full" style={{ width: '113%' }}></div>
              </div>
              <div className="text-xs text-lime-600 mt-1">+4cm</div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-zinc-600">Coxa</span>
                <span className="font-bold">58cm → 62cm</span>
              </div>
              <div className="w-full bg-zinc-200 h-2 rounded-full">
                <div className="bg-lime-500 h-2 rounded-full" style={{ width: '107%' }}></div>
              </div>
              <div className="text-xs text-lime-600 mt-1">+4cm</div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white p-8">
          <h3 className="text-xl font-bold mb-6">Performance</h3>
          <div className="space-y-4">
            <div className="p-4 bg-lime-50 border-l-4 border-lime-500">
              <div className="text-sm text-zinc-600 mb-1">Supino Reto</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">85kg</span>
                <span className="text-sm text-lime-600 font-bold">+21%</span>
              </div>
            </div>
            <div className="p-4 bg-lime-50 border-l-4 border-lime-500">
              <div className="text-sm text-zinc-600 mb-1">Agachamento</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">135kg</span>
                <span className="text-sm text-lime-600 font-bold">+35%</span>
              </div>
            </div>
            <div className="p-4 bg-lime-50 border-l-4 border-lime-500">
              <div className="text-sm text-zinc-600 mb-1">Terra</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">160kg</span>
                <span className="text-sm text-lime-600 font-bold">+33%</span>
              </div>
            </div>
            <div className="p-4 bg-lime-50 border-l-4 border-lime-500">
              <div className="text-sm text-zinc-600 mb-1">Resistência CV</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">+28%</span>
                <span className="text-xs text-lime-600">VO2 Max</span>
              </div>
            </div>
          </div>
        </div>

        {/* Health Markers */}
        <div className="bg-white p-8">
          <h3 className="text-xl font-bold mb-6">Marcadores de Saúde</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-zinc-600">Glicemia</span>
                <span className="font-bold text-lime-600">NORMAL</span>
              </div>
              <div className="text-xs text-zinc-500">102 → 88 mg/dL</div>
            </div>
            <div className="pt-4 border-t border-zinc-200">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-zinc-600">Colesterol Total</span>
                <span className="font-bold text-lime-600">NORMAL</span>
              </div>
              <div className="text-xs text-zinc-500">218 → 182 mg/dL</div>
            </div>
            <div className="pt-4 border-t border-zinc-200">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-zinc-600">Pressão Arterial</span>
                <span className="font-bold text-lime-600">ÓTIMO</span>
              </div>
              <div className="text-xs text-zinc-500">135/88 → 118/76 mmHg</div>
            </div>
            <div className="pt-4 border-t border-zinc-200">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-zinc-600">Vitamina D</span>
                <span className="font-bold text-lime-600">NORMAL</span>
              </div>
              <div className="text-xs text-zinc-500">22 → 42 ng/mL</div>
            </div>
            <div className="pt-4 border-t border-zinc-200">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-zinc-600">Triglicerídeos</span>
                <span className="font-bold text-lime-600">NORMAL</span>
              </div>
              <div className="text-xs text-zinc-500">165 → 98 mg/dL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-black text-white p-8">
        <h2 className="text-2xl font-bold mb-8">Marcos Importantes</h2>
        <div className="space-y-6">
          <div className="flex gap-6">
            <div className="text-lime-500 font-bold whitespace-nowrap">10/01/2026</div>
            <div className="flex-1 pb-6 border-b border-white/20">
              <div className="font-bold mb-2">-8kg Alcançados! 🎉</div>
              <p className="text-white/70 text-sm">
                Você completou sua primeira meta de perda de peso. Parabéns pela dedicação!
              </p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-white/60 font-bold whitespace-nowrap">28/12/2025</div>
            <div className="flex-1 pb-6 border-b border-white/20">
              <div className="font-bold mb-2">Supino 80kg</div>
              <p className="text-white/70 text-sm">
                Primeira vez levantando 80kg no supino. Aumento de 14kg desde o início.
              </p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-white/60 font-bold whitespace-nowrap">15/12/2025</div>
            <div className="flex-1 pb-6 border-b border-white/20">
              <div className="font-bold mb-2">BF abaixo de 18%</div>
              <p className="text-white/70 text-sm">
                Conquistou sua primeira meta intermediária de composição corporal.
              </p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-white/60 font-bold whitespace-nowrap">20/09/2025</div>
            <div className="flex-1">
              <div className="font-bold mb-2">Início do Programa</div>
              <p className="text-white/70 text-sm">
                Primeira avaliação completa. Início da jornada de transformação.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
