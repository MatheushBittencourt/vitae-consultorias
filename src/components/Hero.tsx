import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  return (
    <section className="pt-20 md:pt-24 min-h-screen flex items-center">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left - Text */}
          <div className="order-2 lg:order-1">
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-lime-500 text-black text-[10px] sm:text-xs tracking-widest font-bold mb-4 sm:mb-8">
              PLATAFORMA COMPLETA PARA CONSULTORIAS
            </div>
            <h1 className="text-[clamp(2.5rem,8vw,7rem)] leading-[0.85] tracking-tighter font-bold mb-4 sm:mb-8">
              SUA<br/>
              <span className="text-lime-500">CONSULTORIA</span><br/>
              DIGITAL.
            </h1>
            <div className="max-w-xl space-y-4 sm:space-y-6">
              <p className="text-lg sm:text-2xl md:text-3xl leading-tight">
                Treino. Nutrição. Médico. Reabilitação.
              </p>
              <p className="text-base sm:text-lg md:text-xl text-zinc-600 leading-relaxed">
                Uma única plataforma para gerenciar seus pacientes, protocolos e resultados.
                Profissionalize sua consultoria com tecnologia de ponta.
              </p>
              <button className="w-full sm:w-auto bg-black text-white px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg tracking-wider hover:bg-lime-500 hover:text-black transition-all duration-300 mt-4 sm:mt-8">
                COMEÇAR AGORA
              </button>
            </div>
          </div>

          {/* Right - Images Grid */}
          <div className="order-1 lg:order-2 grid grid-cols-2 gap-2 sm:gap-4 h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
            <div className="space-y-2 sm:space-y-4">
              <div className="h-[65%] sm:h-[70%] overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwd29ya2luZyUyMGxhcHRvcHxlbnwxfHx8fDE3NjgwNzgzNTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Team working"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="h-[calc(35%-0.5rem)] sm:h-[calc(30%-1rem)] overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZGFzaGJvYXJkfGVufDF8fHx8MTc2ODA3ODM2MXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Dashboard"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="space-y-2 sm:space-y-4 pt-6 sm:pt-12">
              <div className="h-[35%] sm:h-[40%] overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1581093458791-9f3c3250a8b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwYXBwfGVufDF8fHx8MTc2ODA3ODM1OHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Fitness app"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="h-[calc(65%-0.5rem)] sm:h-[calc(60%-1rem)] overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1573164713988-8665fc963095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjB0YWJsZXR8ZW58MXx8fHwxNzY4MDc4MzYwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Doctor tablet"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
