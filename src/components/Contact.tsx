import { ImageWithFallback } from './figma/ImageWithFallback';
import { Logo } from './ui/Logo';

export function Contact() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 sm:mb-24 lg:mb-32">
          {/* Left - Contact Info */}
          <div>
            <div className="mb-8 sm:mb-12">
              <div className="inline-block px-4 sm:px-6 py-1.5 sm:py-2 bg-lime-500 text-black text-xs sm:text-sm tracking-widest font-bold mb-4 sm:mb-8">
                COMECE HOJE MESMO
              </div>
              <h2 className="text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tighter mb-4 sm:mb-8">
                VAMOS<br/>
                <span className="text-lime-500">CONVERSAR</span>
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-zinc-600 leading-relaxed mb-4 sm:mb-8">
                Agende uma demonstração gratuita e veja a plataforma funcionando.
              </p>
              <p className="text-base sm:text-lg lg:text-xl text-zinc-500 leading-relaxed">
                Nosso time vai te mostrar como a VITAE pode transformar a gestão da sua consultoria.
                Sem compromisso, apenas valor.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 sm:p-6 border-l-4 border-lime-500 bg-zinc-50 hover:bg-zinc-100 transition-colors">
                <div className="text-xs sm:text-sm text-zinc-500 sm:min-w-[100px]">Email</div>
                <a href="mailto:contato@vitae.app" className="text-lg sm:text-xl lg:text-2xl font-bold hover:text-lime-500 transition-colors break-all">
                  contato@vitae.app
                </a>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 sm:p-6 border-l-4 border-lime-500 bg-zinc-50 hover:bg-zinc-100 transition-colors">
                <div className="text-xs sm:text-sm text-zinc-500 sm:min-w-[100px]">WhatsApp</div>
                <a href="https://wa.me/5511999999999" className="text-lg sm:text-xl lg:text-2xl font-bold hover:text-lime-500 transition-colors">
                  Falar com vendas →
                </a>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 sm:p-6 border-l-4 border-lime-500 bg-zinc-50 hover:bg-zinc-100 transition-colors">
                <div className="text-xs sm:text-sm text-zinc-500 sm:min-w-[100px]">Demo</div>
                <a href="#" className="text-lg sm:text-xl lg:text-2xl font-bold hover:text-lime-500 transition-colors">
                  Agendar demonstração →
                </a>
              </div>
            </div>

            <button className="w-full sm:w-auto bg-black text-white px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg tracking-wider hover:bg-lime-500 hover:text-black transition-all duration-300">
              COMEÇAR AGORA
            </button>
          </div>

          {/* Right - Image */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 h-[300px] sm:h-[400px] lg:h-[600px]">
            <div className="space-y-2 sm:space-y-4">
              <div className="h-2/3 overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZ3xlbnwxfHx8fDE3NjgwNzgzNTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Team meeting"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-1/3 overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1573164713988-8665fc963095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjB0YWJsZXR8ZW58MXx8fHwxNzY3OTkzMjE0fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Doctor tablet"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-2 sm:space-y-4 pt-8 sm:pt-16">
              <div className="h-1/3 overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjB3b3JrfGVufDF8fHx8MTc2ODA3ODM2MXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Laptop work"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-2/3 overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGglMjB0ZWNofGVufDF8fHx8MTc2ODA3ODM2MHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Health tech"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 pt-12 sm:pt-16 lg:pt-20 border-t-2 border-black mb-12 sm:mb-16 lg:mb-20">
          <div>
            <div className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">SOBRE</div>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              VITAE é a plataforma completa para<br/>
              consultorias de saúde e performance.<br/>
              Feita por profissionais, para profissionais.
            </p>
          </div>
          <div>
            <div className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">SUPORTE</div>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              Segunda a Sexta: 8h - 18h<br/>
              Sábado: 9h - 13h<br/>
              Resposta em até 24h úteis
            </p>
          </div>
          <div>
            <div className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">SEGURANÇA</div>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              Criptografia de ponta a ponta<br/>
              Conformidade LGPD<br/>
              Backups diários automáticos
            </p>
          </div>
        </div>

        {/* Final Footer */}
        <div className="pt-8 sm:pt-12 border-t border-zinc-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <Logo size="sm" showText={false} />
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-zinc-500">
              <a href="#" className="hover:text-black transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-black transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-black transition-colors">LGPD</a>
            </div>
            <div className="text-xs sm:text-sm text-zinc-500 text-center">
              © 2026 VITAE. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
