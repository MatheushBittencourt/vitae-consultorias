import { Activity, Calendar, FileText, AlertCircle, CheckCircle, Target, TrendingDown } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Card, StatCard } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface RehabSectionProps {
  athleteId?: number;
}

export function RehabSection({ athleteId }: RehabSectionProps) {
  // TODO: Use athleteId to fetch real data from API
  console.log('RehabSection athleteId:', athleteId);
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">REABILITAÇÃO</span>
          </h1>
          <p className="text-xl text-zinc-600">
            Acompanhamento com Dr. Carlos Mendes
          </p>
        </div>
        <button className="bg-black text-white px-6 py-3 text-sm tracking-wider hover:bg-lime-500 hover:text-black transition-colors">
          AGENDAR SESSÃO
        </button>
      </div>

      {/* Status Alert */}
      <Card className="bg-lime-500 text-black p-4 sm:p-6 flex items-start gap-4 border-none">
        <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-lg mb-1">Status Atual: Em Progresso</div>
          <p className="text-sm sm:text-base">
            Protocolo de fortalecimento de joelho direito - Fase 3 de 4. 
            Evolução dentro do esperado.
          </p>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Sessões Semana"
          value="3x"
          icon={<Calendar className="w-5 h-5" />}
          color="lime"
          subtitle="Seg, Qua, Sex"
        />
        <StatCard
          label="Concluídas"
          value="34/36"
          icon={<CheckCircle className="w-5 h-5" />}
          color="blue"
          subtitle="94% aderência"
        />
        <StatCard
          label="Fase Atual"
          value="3/4"
          icon={<Target className="w-5 h-5" />}
          color="zinc"
          subtitle="Fortalecimento"
        />
        <StatCard
          label="Evolução Dor"
          value="8→2"
          icon={<TrendingDown className="w-5 h-5" />}
          color="purple"
          subtitle="Escala 0-10"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Protocol */}
          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-6">Protocolo Atual</h2>
            
            <div className="mb-8 p-4 sm:p-6 bg-zinc-50 border-l-4 border-lime-500 rounded-r-xl">
              <h3 className="text-lg sm:text-xl font-bold mb-2">Reabilitação de Joelho Direito</h3>
              <Badge variant="info" className="mb-4">Diagnóstico: Condromalácia Patelar Grau II</Badge>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-500">Início:</span>
                  <span className="font-bold ml-2">15/09/2025</span>
                </div>
                <div>
                  <span className="text-zinc-500">Duração:</span>
                  <span className="font-bold ml-2">16 semanas</span>
                </div>
                <div>
                  <span className="text-zinc-500">Semana Atual:</span>
                  <span className="font-bold ml-2">12/16</span>
                </div>
                <div>
                  <span className="text-zinc-500">Conclusão Prevista:</span>
                  <span className="font-bold ml-2">31/01/2026</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold mb-4">FASE 3: Fortalecimento Progressivo</h4>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-lime-500 pl-4 sm:pl-6 rounded-r-xl bg-zinc-50 py-3 pr-4">
                    <div className="font-bold mb-2">1. Agachamento Unilateral</div>
                    <Badge variant="secondary" className="mb-3">3 séries de 12-15 repetições</Badge>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 bg-white px-4 rounded-lg">
                        <span>Execução</span>
                        <span className="font-bold">Lenta e controlada</span>
                      </div>
                      <div className="flex justify-between py-2 bg-white px-4 rounded-lg">
                        <span>Amplitude</span>
                        <span className="font-bold">90° de flexão</span>
                      </div>
                      <div className="flex justify-between py-2 bg-white px-4 rounded-lg">
                        <span>Descanso</span>
                        <span className="font-bold">60 segundos</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-lime-500 pl-4 sm:pl-6 rounded-r-xl bg-zinc-50 py-3 pr-4">
                    <div className="font-bold mb-2">2. Leg Press 45°</div>
                    <Badge variant="secondary" className="mb-2">3 séries de 15 repetições • 40kg</Badge>
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                      ⚠️ Manter joelhos alinhados com pés
                    </div>
                  </div>

                  <div className="border-l-4 border-lime-500 pl-4 sm:pl-6 rounded-r-xl bg-zinc-50 py-3 pr-4">
                    <div className="font-bold mb-2">3. Cadeira Extensora</div>
                    <Badge variant="secondary" className="mb-2">3 séries de 20 repetições • 15kg</Badge>
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                      ⚠️ Isométrica de 3s no topo
                    </div>
                  </div>

                  <div className="border-l-4 border-lime-500 pl-4 sm:pl-6 rounded-r-xl bg-zinc-50 py-3 pr-4">
                    <div className="font-bold mb-2">4. Propriocepção na Plataforma</div>
                    <Badge variant="secondary">3 séries de 60 segundos</Badge>
                  </div>

                  <div className="border-l-4 border-lime-500 pl-4 sm:pl-6 rounded-r-xl bg-zinc-50 py-3 pr-4">
                    <div className="font-bold mb-2">5. Liberação Miofascial</div>
                    <Badge variant="secondary">Rolo de espuma • 5 min quadríceps e IT band</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 p-4 sm:p-6 rounded-xl">
                <h4 className="font-bold mb-3">🏠 Exercícios em Casa (Diários)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-lime-500">•</span>
                    <span>Alongamento de quadríceps: 3x30s cada lado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-500">•</span>
                    <span>Fortalecimento VMO: 3x20 reps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-500">•</span>
                    <span>Gelo após atividades: 15 minutos</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Progress Timeline */}
          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-6">Linha do Tempo</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-lime-500 rounded-full"></div>
                  <div className="w-0.5 h-full bg-lime-500"></div>
                </div>
                <div className="flex-1 pb-6">
                  <Badge variant="success" className="mb-2">Esta Semana</Badge>
                  <div className="font-bold mb-2">Fase 3 - Semana 12</div>
                  <p className="text-sm text-zinc-600">
                    Evolução excelente. Dor praticamente eliminada. Amplitude completa recuperada.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-lime-500 rounded-full"></div>
                  <div className="w-0.5 h-full bg-zinc-300"></div>
                </div>
                <div className="flex-1 pb-6">
                  <Badge variant="secondary" className="mb-2">2 semanas atrás</Badge>
                  <div className="font-bold mb-2">Transição Fase 2→3</div>
                  <p className="text-sm text-zinc-600">
                    Testes funcionais aprovados. Liberado para fase de fortalecimento.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-zinc-300 rounded-full"></div>
                  <div className="w-0.5 h-full bg-zinc-300"></div>
                </div>
                <div className="flex-1 pb-6">
                  <Badge variant="secondary" className="mb-2">Semana 6-10</Badge>
                  <div className="font-bold mb-2">Fase 2 - Mobilidade e Controle</div>
                  <p className="text-sm text-zinc-600">
                    Recuperação de amplitude. Trabalho de controle motor.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-zinc-300 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-2">Semana 1-5</Badge>
                  <div className="font-bold mb-2">Fase 1 - Controle de Dor</div>
                  <p className="text-sm text-zinc-600">
                    Redução da inflamação. Início de exercícios isométricos.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="bg-black text-white p-6 sm:p-8 border-none">
            <h3 className="text-xl font-bold mb-6">Seu Fisioterapeuta</h3>
            <div className="mb-6">
              <div className="w-full aspect-square bg-zinc-800 mb-4 overflow-hidden rounded-xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1706353399656-210cca727a33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaHlzaWNhbCUyMHRoZXJhcGlzdHxlbnwxfHx8fDE3NjgwMDY1Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Dr. Carlos Mendes"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-2xl font-bold mb-1">Dr. Carlos Mendes</div>
              <div className="text-white/60 text-sm mb-4">PT, PhD • Fisioterapia Esportiva</div>
              <div className="text-white/80 text-sm leading-relaxed">
                20 anos de experiência em reabilitação e prevenção de lesões.
              </div>
            </div>
            <button className="w-full py-3 bg-lime-500 text-black font-bold tracking-wider hover:bg-lime-400 transition-colors rounded-lg">
              ENVIAR MENSAGEM
            </button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Evolução da Dor</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-zinc-600">Início do Tratamento</span>
                  <Badge className="bg-red-100 text-red-700">8/10</Badge>
                </div>
                <div className="w-full bg-zinc-200 h-3 rounded-full">
                  <div className="bg-red-500 h-3 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-zinc-600">Após 4 semanas</span>
                  <Badge className="bg-yellow-100 text-yellow-700">5/10</Badge>
                </div>
                <div className="w-full bg-zinc-200 h-3 rounded-full">
                  <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-zinc-600">Após 8 semanas</span>
                  <Badge className="bg-lime-100 text-lime-700">3/10</Badge>
                </div>
                <div className="w-full bg-zinc-200 h-3 rounded-full">
                  <div className="bg-lime-500 h-3 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-zinc-600">Atual (12 semanas)</span>
                  <Badge variant="success">2/10</Badge>
                </div>
                <div className="w-full bg-zinc-200 h-3 rounded-full">
                  <div className="bg-lime-500 h-3 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4">
              Escala EVA (Escala Visual Analógica) • 0 = sem dor, 10 = dor máxima
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Próximos Passos</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-lime-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-black text-xs font-bold">1</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm mb-1">Completar Fase 3</div>
                  <div className="text-xs text-zinc-600">4 semanas restantes</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-zinc-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm mb-1">Fase 4: Retorno ao Esporte</div>
                  <div className="text-xs text-zinc-600">Início previsto: Fev/2026</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-zinc-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm mb-1">Alta Médica</div>
                  <div className="text-xs text-zinc-600">Março/2026</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Recomendações</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-lime-50 border-l-4 border-lime-500 rounded-r-lg">
                <div className="font-bold mb-1">✓ Pode Fazer</div>
                <p className="text-zinc-600">Natação, ciclismo leve, caminhadas</p>
              </div>
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <div className="font-bold mb-1">✗ Evitar</div>
                <p className="text-zinc-600">Corrida, saltos, agachamentos profundos livres</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
