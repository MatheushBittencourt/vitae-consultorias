import { useState } from 'react';
import { Download, FileText, AlertCircle, Eye, X, Image } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'image';
  size: string;
  url: string;
  date: string;
}

interface Exam {
  id: string;
  title: string;
  date: string;
  lab: string;
  status: 'normal' | 'attention' | 'pending';
  reviewed: boolean;
  doctorNote?: string;
  attachments: Attachment[];
}

interface MedicalSectionProps {
  athleteId?: number;
}

export function MedicalSection({ athleteId }: MedicalSectionProps) {
  // TODO: Use athleteId to fetch real data from API
  console.log('MedicalSection athleteId:', athleteId);
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);

  const exams: Exam[] = [
    {
      id: '1',
      title: 'Hemograma Completo',
      date: '28/12/2025',
      lab: 'Lab Fleury',
      status: 'normal',
      reviewed: true,
      attachments: [
        { id: 'a1', name: 'hemograma_completo.pdf', type: 'pdf', size: '245 KB', url: '/exames/hemograma.pdf', date: '28/12/2025' }
      ]
    },
    {
      id: '2',
      title: 'Perfil Lipídico',
      date: '28/12/2025',
      lab: 'Lab Fleury',
      status: 'normal',
      reviewed: true,
      attachments: [
        { id: 'a2', name: 'perfil_lipidico.pdf', type: 'pdf', size: '198 KB', url: '/exames/lipidico.pdf', date: '28/12/2025' }
      ]
    },
    {
      id: '3',
      title: 'Glicemia e HbA1c',
      date: '20/12/2025',
      lab: 'Lab Fleury',
      status: 'attention',
      reviewed: true,
      doctorNote: 'Dr. Ricardo: "Glicemia levemente elevada. Ajustamos o protocolo nutricional."',
      attachments: [
        { id: 'a3', name: 'glicemia_hba1c.pdf', type: 'pdf', size: '156 KB', url: '/exames/glicemia.pdf', date: '20/12/2025' },
        { id: 'a4', name: 'grafico_glicemia.png', type: 'image', size: '89 KB', url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800', date: '20/12/2025' }
      ]
    },
    {
      id: '4',
      title: 'Vitamina D',
      date: '15/12/2025',
      lab: 'Lab Fleury',
      status: 'normal',
      reviewed: true,
      attachments: [
        { id: 'a5', name: 'vitamina_d.pdf', type: 'pdf', size: '134 KB', url: '/exames/vitamina_d.pdf', date: '15/12/2025' }
      ]
    }
  ];

  const getStatusColor = (status: Exam['status']) => {
    switch (status) {
      case 'normal': return { bg: 'bg-lime-500', text: 'text-black', label: 'NORMAL' };
      case 'attention': return { bg: 'bg-yellow-500', text: 'text-black', label: 'ATENÇÃO' };
      case 'pending': return { bg: 'bg-zinc-300', text: 'text-zinc-700', label: 'PENDENTE' };
    }
  };

  const handleDownload = (attachment: Attachment) => {
    // Em produção, isso faria download do arquivo real
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            <span className="text-lime-500">MEDICINA</span>
          </h1>
          <p className="text-xl text-zinc-600">
            Acompanhamento médico com Dr. Ricardo Santos
          </p>
        </div>
        <button className="bg-black text-white px-6 py-3 text-sm tracking-wider hover:bg-lime-500 hover:text-black transition-colors">
          AGENDAR CONSULTA
        </button>
      </div>

      {/* Alert */}
      <div className="bg-red-50 border-l-4 border-red-500 p-6 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
        <div>
          <div className="font-bold text-lg mb-1 text-red-900">Exame Pendente</div>
          <p className="text-red-800">
            Você precisa fazer o exame de TSH, T4 Livre e T3 solicitado pelo Dr. Ricardo. 
            Prazo até 20/01/2026.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 border-l-4 border-lime-500">
          <div className="text-sm tracking-wider text-zinc-600 mb-2">ÚLTIMA CONSULTA</div>
          <div className="text-2xl font-bold">03/01/2026</div>
        </div>
        <div className="bg-white p-6 border-l-4 border-black">
          <div className="text-sm tracking-wider text-zinc-600 mb-2">PRÓXIMA CONSULTA</div>
          <div className="text-2xl font-bold">11/01/2026</div>
        </div>
        <div className="bg-white p-6 border-l-4 border-black">
          <div className="text-sm tracking-wider text-zinc-600 mb-2">EXAMES FEITOS</div>
          <div className="text-2xl font-bold">12</div>
        </div>
        <div className="bg-white p-6 border-l-4 border-black">
          <div className="text-sm tracking-wider text-zinc-600 mb-2">CONSULTAS TOTAL</div>
          <div className="text-2xl font-bold">7</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Exams */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8">
            <h2 className="text-2xl font-bold mb-6">Exames Recentes</h2>
            <div className="space-y-4">
              {exams.map((exam) => {
                const statusStyle = getStatusColor(exam.status);
                return (
                  <div key={exam.id} className="pb-4 border-b border-zinc-200 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 ${exam.status === 'attention' ? 'bg-yellow-500/20' : 'bg-lime-500/20'} rounded flex items-center justify-center flex-shrink-0`}>
                        <FileText className={`w-8 h-8 ${exam.status === 'attention' ? 'text-yellow-700' : 'text-lime-700'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg mb-1">{exam.title}</div>
                        <div className="text-sm text-zinc-600 mb-2">{exam.date} • {exam.lab}</div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`px-3 py-1 ${statusStyle.bg} ${statusStyle.text} text-xs font-bold`}>
                            {statusStyle.label}
                          </span>
                          {exam.reviewed && (
                            <span className="px-3 py-1 bg-zinc-100 text-zinc-700 text-xs font-bold">
                              REVISADO
                            </span>
                          )}
                        </div>
                        {exam.doctorNote && (
                          <p className="text-sm text-zinc-600 italic mb-2">{exam.doctorNote}</p>
                        )}
                        
                        {/* Attachments */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {exam.attachments.map((attachment) => (
                            <div 
                              key={attachment.id}
                              className="flex items-center gap-2 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded hover:border-lime-500 transition-colors group"
                            >
                              {attachment.type === 'pdf' ? (
                                <FileText className="w-4 h-4 text-red-500" />
                              ) : (
                                <Image className="w-4 h-4 text-blue-500" />
                              )}
                              <span className="text-sm max-w-[100px] truncate">{attachment.name}</span>
                              <span className="text-xs text-zinc-400">{attachment.size}</span>
                              
                              {attachment.type === 'image' && (
                                <button
                                  onClick={() => setShowImagePreview(attachment.url)}
                                  className="p-1 hover:bg-lime-100 rounded transition-colors"
                                  title="Visualizar"
                                >
                                  <Eye className="w-4 h-4 text-zinc-400 group-hover:text-lime-600" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDownload(attachment)}
                                className="p-1 hover:bg-lime-100 rounded transition-colors"
                                title="Baixar arquivo"
                              >
                                <Download className="w-4 h-4 text-zinc-400 group-hover:text-lime-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prescriptions */}
          <div className="bg-white p-8">
            <h2 className="text-2xl font-bold mb-6">Prescrições Ativas</h2>
            <div className="space-y-4">
              <div className="p-6 border-l-4 border-lime-500 bg-zinc-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-2">Vitamina D3 10.000 UI</div>
                    <div className="text-sm text-zinc-600 mb-3">
                      1 cápsula por semana • Tomar aos domingos
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-zinc-500">Prescrito em: 03/01/2026</span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-zinc-500">Válido até: 03/04/2026</span>
                    </div>
                  </div>
                  <button 
                    className="flex items-center gap-2 px-3 py-2 border border-black hover:bg-black hover:text-white transition-colors"
                    title="Baixar prescrição"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-xs font-bold">PDF</span>
                  </button>
                </div>
              </div>

              <div className="p-6 border-l-4 border-lime-500 bg-zinc-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-2">Ômega 3 1000mg</div>
                    <div className="text-sm text-zinc-600 mb-3">
                      2 cápsulas por dia • Tomar com as refeições
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-zinc-500">Prescrito em: 15/11/2025</span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-zinc-500">Uso contínuo</span>
                    </div>
                  </div>
                  <button 
                    className="flex items-center gap-2 px-3 py-2 border border-black hover:bg-black hover:text-white transition-colors"
                    title="Baixar prescrição"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-xs font-bold">PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <div className="bg-black text-white p-8">
            <h3 className="text-xl font-bold mb-6">Seu Médico</h3>
            <div className="mb-6">
              <div className="w-full aspect-square bg-zinc-800 mb-4 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1755189118414-14c8dacdb082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkb2N0b3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjgwNzgxOTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Dr. Ricardo Santos"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-2xl font-bold mb-1">Dr. Ricardo Santos</div>
              <div className="text-white/60 text-sm mb-4">MD, PhD • Medicina Integrativa</div>
              <div className="text-white/80 text-sm leading-relaxed">
                Especialista em longevidade e medicina preventiva com 18 anos de experiência.
              </div>
            </div>
            <button className="w-full py-3 bg-lime-500 text-black font-bold tracking-wider hover:bg-lime-400 transition-colors">
              ENVIAR MENSAGEM
            </button>
          </div>

          <div className="bg-white p-6">
            <h3 className="text-lg font-bold mb-4">Observações Médicas</h3>
            <div className="space-y-3 text-sm">
              <div className="pb-3 border-b border-zinc-200">
                <div className="text-zinc-500 text-xs mb-1">03/01/2026</div>
                <p className="text-zinc-700">
                  Paciente apresenta ótima evolução. Manter protocolo atual de suplementação.
                </p>
              </div>
              <div className="pb-3 border-b border-zinc-200">
                <div className="text-zinc-500 text-xs mb-1">15/12/2025</div>
                <p className="text-zinc-700">
                  Ajustar dosagem de Vitamina D após novo exame. Agendar retorno em 3 semanas.
                </p>
              </div>
              <div>
                <div className="text-zinc-500 text-xs mb-1">20/11/2025</div>
                <p className="text-zinc-700">
                  Primeira consulta. Iniciado protocolo de otimização metabólica.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6">
            <h3 className="text-lg font-bold mb-4">Imagem Recente</h3>
            <div 
              className="aspect-video overflow-hidden rounded cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowImagePreview('https://images.unsplash.com/photo-1599814516385-5eb0a11888d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9vZCUyMHRlc3QlMjBtZWRpY2FsfGVufDF8fHx8MTc2ODA3ODc1NHww&ixlib=rb-4.1.0&q=80&w=1080')}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1599814516385-5eb0a11888d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9vZCUyMHRlc3QlMjBtZWRpY2FsfGVufDF8fHx8MTc2ODA3ODc1NHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Medical tests"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-zinc-500 mt-2">Clique para ampliar</p>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImagePreview(null)}
        >
          <button
            onClick={() => setShowImagePreview(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="relative">
            <img 
              src={showImagePreview} 
              alt="Preview" 
              className="max-w-full max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <a
              href={showImagePreview}
              download
              className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-4 h-4" />
              Baixar
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
