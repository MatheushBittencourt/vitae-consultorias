import { useEffect, useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CheckCircle, Play } from 'lucide-react';

interface HeroProps {
  onSignupClick: () => void;
  onWatchDemo: () => void;
}

// Avatares de clientes para social proof
const clientAvatars = [
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face',
];

export function Hero({ onSignupClick, onWatchDemo }: HeroProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Animação de entrada ao carregar
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section 
      id="main-content"
      className="pt-20 md:pt-24 min-h-screen flex items-center relative overflow-hidden"
      aria-label="Seção principal"
    >
      {/* Background decoration */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-lime-50/50 via-white to-white pointer-events-none" 
        aria-hidden="true"
      />
      
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left - Text */}
          <div className="order-2 lg:order-1 relative z-20">
            {/* Badge */}
            <div 
              className={`
                inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-lime-500 text-black 
                text-[10px] sm:text-xs tracking-widest font-bold mb-4 sm:mb-8
                transition-all duration-700 delay-100
                ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}
            >
              PLATAFORMA COMPLETA PARA CONSULTORIAS
            </div>

            {/* Headline */}
            <h1 
              className={`
                text-[clamp(2.5rem,8vw,7rem)] leading-[0.85] tracking-tighter font-bold mb-4 sm:mb-8
                transition-all duration-700 delay-200
                ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}
            >
              SUA<br/>
              <span className="text-lime-500">CONSULTORIA</span><br/>
              DIGITAL.
            </h1>

            {/* Subheadline */}
            <div 
              className={`
                max-w-xl space-y-4 sm:space-y-6
                transition-all duration-700 delay-300
                ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}
            >
              <p className="text-lg sm:text-2xl md:text-3xl leading-tight font-medium">
                Treino. Nutrição. Médico. Fisioterapia.
              </p>
              <p className="text-base sm:text-lg md:text-xl text-zinc-600 leading-relaxed">
                Uma única plataforma para gerenciar seus pacientes, protocolos e resultados.
                Profissionalize sua consultoria com tecnologia de ponta.
              </p>

              {/* Feature list */}
              <ul className="space-y-2 text-sm sm:text-base text-zinc-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-lime-500 flex-shrink-0" aria-hidden="true" />
                  <span>Setup em menos de 5 minutos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-lime-500 flex-shrink-0" aria-hidden="true" />
                  <span>Sem taxa de adesão ou fidelidade</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-lime-500 flex-shrink-0" aria-hidden="true" />
                  <span>Suporte brasileiro em português</span>
                </li>
              </ul>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                <button 
                  onClick={onSignupClick}
                  className="group w-full sm:w-auto bg-black text-white px-8 sm:px-10 py-4 sm:py-5 
                             text-base sm:text-lg tracking-wider font-bold
                             hover:bg-lime-500 hover:text-black transition-all duration-300
                             transform hover:scale-[1.02] hover:shadow-lg
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2"
                >
                  COMEÇAR AGORA
                  <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
                </button>
                
                <button 
                  onClick={onWatchDemo}
                  className="group w-full sm:w-auto flex items-center justify-center gap-2 
                             px-6 py-4 sm:py-5 border-2 border-zinc-300 text-zinc-700
                             hover:border-lime-500 hover:text-lime-600 transition-all duration-300
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2"
                  aria-label="Assistir demonstração em vídeo"
                >
                  <Play className="w-5 h-5 fill-current" aria-hidden="true" />
                  <span className="font-medium">Ver demonstração</span>
                </button>
              </div>

              {/* Social Proof */}
              <div 
                className={`
                  flex flex-col sm:flex-row sm:items-center gap-4 pt-6 sm:pt-8 mt-4 
                  border-t border-zinc-200
                  transition-all duration-700 delay-500
                  ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}
              >
                {/* Client avatars */}
                <div className="flex -space-x-3" aria-hidden="true">
                  {clientAvatars.map((avatar, index) => (
                    <img
                      key={index}
                      src={avatar}
                      alt=""
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white object-cover"
                      loading="lazy"
                    />
                  ))}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white bg-lime-500 
                                  flex items-center justify-center text-black text-xs sm:text-sm font-bold">
                    +500
                  </div>
                </div>
                
                {/* Stats text */}
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className="w-4 h-4 text-yellow-400 fill-current" 
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm font-bold text-zinc-900 ml-1">4.9/5</span>
                  </div>
                  <p className="text-sm text-zinc-600">
                    <strong className="text-zinc-900">+500 consultorias</strong> já confiam na VITAE
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Images Grid */}
          <div 
            className={`
              order-1 lg:order-2 grid grid-cols-2 gap-2 sm:gap-4 
              h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]
              transition-all duration-1000 delay-400
              ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
            `}
            aria-label="Imagens ilustrativas da plataforma"
          >
            <div className="space-y-2 sm:space-y-4">
              <div className="h-[65%] sm:h-[70%] overflow-hidden rounded-lg shadow-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwd29ya2luZyUyMGxhcHRvcHxlbnwxfHx8fDE3NjgwNzgzNTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Equipe de profissionais trabalhando com notebooks em ambiente moderno"
                  className="w-full h-full hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="h-[calc(35%-0.5rem)] sm:h-[calc(30%-1rem)] overflow-hidden rounded-lg shadow-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZGFzaGJvYXJkfGVufDF8fHx8MTc2ODA3ODM2MXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Dashboard médico com dados de pacientes"
                  className="w-full h-full hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="space-y-2 sm:space-y-4 pt-4 sm:pt-6">
              <div className="h-[35%] sm:h-[40%] overflow-hidden rounded-lg shadow-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1080&q=80&fit=crop"
                  alt="Aplicativo de fitness mostrando treino personalizado"
                  className="w-full h-full hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="h-[calc(65%-0.5rem)] sm:h-[calc(60%-1rem)] overflow-hidden rounded-lg shadow-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1573164713988-8665fc963095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjB0YWJsZXR8ZW58MXx8fHwxNzY4MDc4MzYwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Profissional de saúde utilizando tablet para consulta"
                  className="w-full h-full hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
