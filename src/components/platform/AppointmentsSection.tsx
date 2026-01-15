import { Calendar as CalendarIcon, Clock, Video, MapPin, Plus } from 'lucide-react';

interface AppointmentsSectionProps {
  userId?: number;
}

export function AppointmentsSection({ userId }: AppointmentsSectionProps) {
  // TODO: Use userId to fetch real data from API
  console.log('AppointmentsSection userId:', userId);
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">AGENDAMENTOS</span>
          </h1>
          <p className="text-xl text-zinc-600">
            Gerencie todas as suas consultas e sessões
          </p>
        </div>
        <button className="bg-black text-white px-6 py-3 text-sm tracking-wider hover:bg-lime-500 hover:text-black transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          NOVO AGENDAMENTO
        </button>
      </div>

      {/* Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Janeiro 2026</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors">
                  ‹
                </button>
                <button className="px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors">
                  ›
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((day) => (
                <div key={day} className="text-center text-sm font-bold text-zinc-600 py-2">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for alignment */}
              <div className="aspect-square"></div>
              <div className="aspect-square"></div>
              <div className="aspect-square"></div>
              
              {/* Days with appointments */}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const hasAppointment = [6, 8, 10, 11, 13, 15, 17, 20, 22, 24].includes(day);
                const isToday = day === 10;
                return (
                  <button
                    key={day}
                    className={`aspect-square flex items-center justify-center text-sm font-bold border-2 hover:border-lime-500 transition-colors ${
                      isToday
                        ? 'bg-lime-500 text-black border-lime-500'
                        : hasAppointment
                        ? 'bg-zinc-100 border-zinc-300'
                        : 'border-zinc-200'
                    }`}
                  >
                    <div className="text-center">
                      <div>{day}</div>
                      {hasAppointment && !isToday && (
                        <div className="w-1.5 h-1.5 bg-black rounded-full mx-auto mt-1"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-6 text-sm pt-4 border-t border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-lime-500"></div>
                <span>Hoje</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-zinc-100 border-2 border-zinc-300"></div>
                <span>Com agendamento</span>
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white p-8 mt-6">
            <h2 className="text-2xl font-bold mb-6">Próximos Agendamentos</h2>
            <div className="space-y-4">
              {/* Today */}
              <div className="border-l-4 border-lime-500 pl-6 py-4 bg-lime-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm text-zinc-600 mb-1">HOJE • 10/01/2026</div>
                    <h3 className="text-xl font-bold mb-2">Check-in Nutricional</h3>
                    <div className="flex items-center gap-4 text-sm text-zinc-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>12:30 - 12:50</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        <span>Online</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-lime-500 text-black text-sm font-bold">
                    EM BREVE
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-lime-200">
                  <div className="w-10 h-10 bg-lime-500 rounded-full flex items-center justify-center">
                    <span className="font-bold">MC</span>
                  </div>
                  <div>
                    <div className="font-bold">Dra. Marina Costa</div>
                    <div className="text-sm text-zinc-600">Nutrição</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button className="flex-1 py-3 bg-black text-white hover:bg-lime-500 hover:text-black transition-colors font-bold">
                    ENTRAR NA CHAMADA
                  </button>
                  <button className="px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors font-bold">
                    REMARCAR
                  </button>
                </div>
              </div>

              {/* Tomorrow */}
              <div className="border-l-4 border-black pl-6 py-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm text-zinc-600 mb-1">AMANHÃ • 11/01/2026</div>
                    <h3 className="text-xl font-bold mb-2">Consulta Médica</h3>
                    <div className="flex items-center gap-4 text-sm text-zinc-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>14:30 - 15:30</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Presencial</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-zinc-200 text-black text-sm font-bold">
                    CONFIRMADO
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-zinc-200">
                  <div className="w-10 h-10 bg-zinc-300 rounded-full flex items-center justify-center">
                    <span className="font-bold">RS</span>
                  </div>
                  <div>
                    <div className="font-bold">Dr. Ricardo Santos</div>
                    <div className="text-sm text-zinc-600">Medicina</div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-zinc-600 bg-yellow-50 p-3 border-l-2 border-yellow-500">
                  <strong>Lembrete:</strong> Trazer exames de TSH e T4 Livre
                </p>
              </div>

              {/* Next week */}
              <div className="border-l-4 border-black pl-6 py-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm text-zinc-600 mb-1">13/01/2026</div>
                    <h3 className="text-xl font-bold mb-2">Fisioterapia</h3>
                    <div className="flex items-center gap-4 text-sm text-zinc-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>19:00 - 19:45</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Presencial</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-zinc-200 text-black text-sm font-bold">
                    CONFIRMADO
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-zinc-200">
                  <div className="w-10 h-10 bg-zinc-300 rounded-full flex items-center justify-center">
                    <span className="font-bold">CM</span>
                  </div>
                  <div>
                    <div className="font-bold">Dr. Carlos Mendes</div>
                    <div className="text-sm text-zinc-600">Reabilitação</div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-black pl-6 py-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm text-zinc-600 mb-1">15/01/2026</div>
                    <h3 className="text-xl font-bold mb-2">Treino Personalizado</h3>
                    <div className="flex items-center gap-4 text-sm text-zinc-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>07:00 - 08:00</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Presencial</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-zinc-200 text-black text-sm font-bold">
                    CONFIRMADO
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-zinc-200">
                  <div className="w-10 h-10 bg-zinc-300 rounded-full flex items-center justify-center">
                    <span className="font-bold">LF</span>
                  </div>
                  <div>
                    <div className="font-bold">Lucas Ferreira</div>
                    <div className="text-sm text-zinc-600">Treinamento</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-black text-white p-6">
            <h3 className="text-lg font-bold mb-4">Resumo do Mês</h3>
            <div className="space-y-4">
              <div className="pb-4 border-b border-white/20">
                <div className="text-3xl font-bold mb-1">24</div>
                <div className="text-sm text-white/60">Total de consultas</div>
              </div>
              <div className="pb-4 border-b border-white/20">
                <div className="text-3xl font-bold mb-1">22</div>
                <div className="text-sm text-white/60">Comparecimentos</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1 text-lime-500">92%</div>
                <div className="text-sm text-white/60">Taxa de presença</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6">
            <h3 className="text-lg font-bold mb-4">Distribuição por Área</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-zinc-600">Treinamento</span>
                  <span className="font-bold">10 sessões</span>
                </div>
                <div className="w-full bg-zinc-200 h-2 rounded-full">
                  <div className="bg-lime-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-zinc-600">Reabilitação</span>
                  <span className="font-bold">9 sessões</span>
                </div>
                <div className="w-full bg-zinc-200 h-2 rounded-full">
                  <div className="bg-black h-2 rounded-full" style={{ width: '37%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-zinc-600">Nutrição</span>
                  <span className="font-bold">3 consultas</span>
                </div>
                <div className="w-full bg-zinc-200 h-2 rounded-full">
                  <div className="bg-black h-2 rounded-full" style={{ width: '13%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-zinc-600">Medicina</span>
                  <span className="font-bold">2 consultas</span>
                </div>
                <div className="w-full bg-zinc-200 h-2 rounded-full">
                  <div className="bg-black h-2 rounded-full" style={{ width: '8%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6">
            <h3 className="text-lg font-bold mb-4">Horários Preferidos</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between pb-2 border-b border-zinc-200">
                <span className="text-zinc-600">Manhã (6h-12h)</span>
                <span className="font-bold">65%</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-zinc-200">
                <span className="text-zinc-600">Tarde (12h-18h)</span>
                <span className="font-bold">20%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Noite (18h-21h)</span>
                <span className="font-bold">15%</span>
              </div>
            </div>
          </div>

          <div className="bg-lime-500 text-black p-6">
            <h3 className="text-lg font-bold mb-3">Dica</h3>
            <p className="text-sm">
              Agende suas consultas com antecedência para garantir os melhores horários. 
              Recomendamos agendar com pelo menos 1 semana de antecedência.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
