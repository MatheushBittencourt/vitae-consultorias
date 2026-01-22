import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, Monitor, Smartphone } from 'lucide-react';
import { ScrollReveal } from '../hooks/useScrollAnimation';

interface Screenshot {
  id: string;
  title: string;
  description: string;
  category: 'dashboard' | 'training' | 'nutrition';
  device: 'desktop' | 'mobile';
  imagePath?: string; // Caminho da imagem real (quando disponível)
}

// Screenshots da plataforma
const screenshots: Screenshot[] = [
  // Dashboard
  { id: '1', title: 'Dashboard Principal', description: 'Visão geral com métricas e resumos', category: 'dashboard', device: 'desktop', imagePath: '/screenshots/1.png' },
  { id: '2', title: 'Lista de Pacientes', description: 'Gerencie todos os seus pacientes', category: 'dashboard', device: 'desktop', imagePath: '/screenshots/2.png' },
  { id: '3', title: 'Perfil do Paciente', description: 'Histórico completo de cada paciente', category: 'dashboard', device: 'desktop', imagePath: '/screenshots/3.png' },
  { id: '10', title: 'Progresso do Paciente', description: 'Gráficos de evolução e acompanhamento', category: 'dashboard', device: 'desktop', imagePath: '/screenshots/10.png' },
  
  // Treinamento
  { id: '4', title: 'Criação de Treinos', description: 'Monte treinos personalizados', category: 'training', device: 'desktop', imagePath: '/screenshots/4.png' },
  { id: '5', title: 'Biblioteca de Exercícios', description: 'Cadastre exercícios com vídeos demonstrativos', category: 'training', device: 'desktop', imagePath: '/screenshots/5.png' },
  
  // Nutrição
  { id: '6', title: 'Plano Alimentar', description: 'Dietas com cálculo automático de macros', category: 'nutrition', device: 'desktop', imagePath: '/screenshots/6.png' },
  { id: '7', title: 'Lista de Alimentos', description: 'Biblioteca nutricional completa', category: 'nutrition', device: 'desktop', imagePath: '/screenshots/7.png' },
];

const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'training', label: 'Treinamento' },
  { id: 'nutrition', label: 'Nutrição' },
];

export function PlatformPreview() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredScreenshots = activeCategory === 'all' 
    ? screenshots 
    : screenshots.filter(s => s.category === activeCategory);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredScreenshots.length) % filteredScreenshots.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredScreenshots.length);
  };

  // Placeholder image generator baseado na categoria
  const getPlaceholderBg = (category: string) => {
    const colors: Record<string, string> = {
      dashboard: 'from-blue-600 to-blue-800',
      training: 'from-orange-500 to-orange-700',
      nutrition: 'from-green-500 to-green-700',
    };
    return colors[category] || 'from-zinc-600 to-zinc-800';
  };

  return (
    <>
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-50" id="plataforma">
        <div className="max-w-screen-2xl mx-auto">
          {/* Header */}
          <ScrollReveal animation="fadeUp" className="text-center mb-12 sm:mb-16">
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-lime-500 text-black text-[10px] sm:text-xs tracking-widest font-bold mb-4 sm:mb-8">
              CONHEÇA A PLATAFORMA
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-4 sm:mb-6">
              VEJA COMO É<br/>
              <span className="text-lime-500">POR DENTRO</span>
            </h2>
            <p className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto">
              Interface moderna, intuitiva e pensada para facilitar seu dia a dia.
              Explore as principais telas da plataforma.
            </p>
          </ScrollReveal>

          {/* Category Tabs */}
          <ScrollReveal animation="fadeUp" delay={0.1} className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-14">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300
                  ${activeCategory === cat.id 
                    ? 'bg-black text-white shadow-lg' 
                    : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </ScrollReveal>

          {/* Screenshots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredScreenshots.map((screenshot, index) => (
              <ScrollReveal
                key={screenshot.id}
                animation="fadeUp"
                delay={0.1 + index * 0.05}
              >
                <button
                  onClick={() => openLightbox(index)}
                  className="group w-full text-left bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-zinc-200 hover:border-lime-500"
                >
                  {/* Screenshot */}
                  <div className="relative aspect-video overflow-hidden">
                    {screenshot.imagePath ? (
                      /* Imagem Real */
                      <img 
                        src={screenshot.imagePath} 
                        alt={screenshot.title}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      /* Placeholder */
                      <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderBg(screenshot.category)} flex items-center justify-center`}>
                        <div className="text-center text-white/80">
                          {screenshot.device === 'mobile' ? (
                            <Smartphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          ) : (
                            <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          )}
                          <p className="text-xs opacity-60">Em breve</p>
                        </div>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <Maximize2 className="w-5 h-5 text-zinc-800" />
                        </div>
                      </div>
                    </div>

                    {/* Device Badge */}
                    <div className={`
                      absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium
                      ${screenshot.device === 'mobile' 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-white/90 text-zinc-700'
                      }
                    `}>
                      {screenshot.device === 'mobile' ? 'Mobile' : 'Desktop'}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-zinc-900 mb-1 group-hover:text-lime-600 transition-colors">
                      {screenshot.title}
                    </h3>
                    <p className="text-sm text-zinc-500">{screenshot.description}</p>
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>

          {/* CTA */}
          <ScrollReveal animation="fadeUp" delay={0.3} className="text-center mt-12 sm:mt-16">
            <p className="text-zinc-600 mb-4">
              Quer ver mais? Crie sua conta e explore a plataforma completa.
            </p>
            <a
              href="#planos"
              className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-semibold rounded-xl hover:bg-lime-500 hover:text-black transition-colors"
            >
              Ver Planos
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 
                       rounded-full flex items-center justify-center text-white transition-colors z-10"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Navigation */}
          <button
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 
                       bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center 
                       text-white transition-colors z-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 
                       bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center 
                       text-white transition-colors z-10"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Image Container */}
          <div 
            className="max-w-5xl w-full mx-4 sm:mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Screenshot */}
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl relative">
              {filteredScreenshots[currentIndex].imagePath ? (
                /* Imagem Real */
                <img 
                  src={filteredScreenshots[currentIndex].imagePath} 
                  alt={filteredScreenshots[currentIndex].title}
                  className="w-full h-full object-contain bg-zinc-900"
                />
              ) : (
                /* Placeholder */
                <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderBg(filteredScreenshots[currentIndex].category)} flex items-center justify-center`}>
                  <div className="text-center text-white">
                    {filteredScreenshots[currentIndex].device === 'mobile' ? (
                      <Smartphone className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    ) : (
                      <Monitor className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    )}
                    <p className="text-lg opacity-60">Em breve</p>
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-white mb-1">
                {filteredScreenshots[currentIndex].title}
              </h3>
              <p className="text-zinc-400">
                {filteredScreenshots[currentIndex].description}
              </p>
              <p className="text-zinc-600 text-sm mt-2">
                {currentIndex + 1} / {filteredScreenshots.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
