import { useState, useEffect } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollReveal } from '../hooks/useScrollAnimation';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  highlight?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Dr. Ricardo Mendes',
    role: 'Médico do Esporte',
    company: 'Elite Performance',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    content: 'A VITAE revolucionou a forma como gerencio meus pacientes atletas. Antes, usava planilhas e WhatsApp para tudo. Agora tenho tudo centralizado, com histórico completo e comunicação integrada.',
    rating: 5,
    highlight: 'Reduzi 60% do tempo administrativo',
  },
  {
    id: 2,
    name: 'Juliana Santos',
    role: 'Nutricionista Esportiva',
    company: 'FitPro Nutrição',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face',
    content: 'Meus pacientes adoram acompanhar a dieta pelo app. A biblioteca de alimentos é super completa e as substituições automáticas facilitam muito a adesão ao plano alimentar.',
    rating: 5,
    highlight: '95% de adesão dos pacientes',
  },
  {
    id: 3,
    name: 'Carlos Eduardo',
    role: 'Personal Trainer',
    company: 'CrossFit Box SP',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    content: 'A criação de treinos ficou muito mais rápida. A biblioteca de exercícios com vídeos demonstrativos é excelente. Meus alunos conseguem executar os exercícios corretamente mesmo quando treino não está presencial.',
    rating: 5,
    highlight: '+40 alunos em 3 meses',
  },
  {
    id: 4,
    name: 'Dra. Ana Paula',
    role: 'Fisioterapeuta',
    company: 'SportMed Clínica',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    content: 'O módulo de reabilitação é perfeito para acompanhar a evolução das lesões. Consigo ver todo o histórico do paciente, desde o diagnóstico até a alta, integrado com os treinos e nutrição.',
    rating: 5,
    highlight: '30% mais rápido na recuperação',
  },
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play do carrossel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setActiveIndex(index);
  };

  return (
    <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <ScrollReveal animation="fadeUp" className="mb-12 sm:mb-16 lg:mb-20 text-center">
          <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-lime-500 text-black text-[10px] sm:text-xs tracking-widest font-bold mb-4 sm:mb-8">
            QUEM USA, RECOMENDA
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 sm:mb-6">
            O QUE NOSSOS<br/>
            <span className="text-lime-500">CLIENTES DIZEM</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-zinc-600 max-w-3xl mx-auto">
            Profissionais de saúde e performance que transformaram suas consultorias com a VITAE.
          </p>
        </ScrollReveal>

        {/* Testimonial Carousel */}
        <div className="relative">
          {/* Main testimonial */}
          <div className="max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`
                  transition-all duration-500 ease-out
                  ${index === activeIndex 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 absolute inset-0 translate-x-8 pointer-events-none'
                  }
                `}
                aria-hidden={index !== activeIndex}
              >
                <div className="bg-zinc-50 p-6 sm:p-8 lg:p-12 relative">
                  {/* Quote icon */}
                  <Quote 
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 sm:w-16 sm:h-16 text-lime-500/20" 
                    aria-hidden="true"
                  />

                  {/* Rating */}
                  <div className="flex gap-1 mb-4 sm:mb-6" aria-label={`${testimonial.rating} de 5 estrelas`}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          i < testimonial.rating 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-zinc-300'
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  {/* Highlight badge */}
                  {testimonial.highlight && (
                    <div className="inline-block px-3 py-1 bg-lime-500 text-black text-xs sm:text-sm font-bold mb-4 sm:mb-6">
                      {testimonial.highlight}
                    </div>
                  )}

                  {/* Content */}
                  <blockquote className="text-lg sm:text-xl lg:text-2xl text-zinc-700 leading-relaxed mb-6 sm:mb-8">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div>
                      <div className="font-bold text-base sm:text-lg text-zinc-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm sm:text-base text-zinc-600">
                        {testimonial.role}
                      </div>
                      <div className="text-xs sm:text-sm text-lime-600 font-medium">
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 lg:-translate-x-12 
                       w-10 h-10 sm:w-12 sm:h-12 bg-white border border-zinc-200 rounded-full 
                       flex items-center justify-center hover:bg-lime-500 hover:border-lime-500 
                       hover:text-black transition-colors shadow-lg z-10"
            aria-label="Depoimento anterior"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 lg:translate-x-12 
                       w-10 h-10 sm:w-12 sm:h-12 bg-white border border-zinc-200 rounded-full 
                       flex items-center justify-center hover:bg-lime-500 hover:border-lime-500 
                       hover:text-black transition-colors shadow-lg z-10"
            aria-label="Próximo depoimento"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Dots navigation */}
        <div className="flex justify-center gap-2 mt-8" role="tablist" aria-label="Navegação de depoimentos">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300
                ${index === activeIndex 
                  ? 'bg-lime-500 w-6 sm:w-8' 
                  : 'bg-zinc-300 hover:bg-zinc-400'
                }
              `}
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Ir para depoimento ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats row */}
        <ScrollReveal animation="fadeUp" delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-zinc-200">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-lime-500 mb-2">500+</div>
              <div className="text-sm sm:text-base text-zinc-600">Consultorias ativas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-lime-500 mb-2">15k+</div>
              <div className="text-sm sm:text-base text-zinc-600">Pacientes atendidos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-lime-500 mb-2">98%</div>
              <div className="text-sm sm:text-base text-zinc-600">Taxa de satisfação</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-lime-500 mb-2">4.9</div>
              <div className="text-sm sm:text-base text-zinc-600">Avaliação média</div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
