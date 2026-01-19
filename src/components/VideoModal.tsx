import { useEffect, useRef } from 'react';
import { X, Play, ExternalLink } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string; // URL do YouTube (ex: https://www.youtube.com/watch?v=XXXXX)
}

/**
 * Modal de Vídeo de Demonstração
 * 
 * Para usar com YouTube:
 * 1. Faça upload do vídeo no YouTube (pode ser "Não-listado")
 * 2. Copie a URL do vídeo
 * 3. Passe a URL na prop videoUrl
 * 
 * Exemplo: videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 */
export function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Extrair ID do vídeo do YouTube
  const getYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const youtubeId = videoUrl ? getYouTubeId(videoUrl) : null;

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Fechar ao clicar fora
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Vídeo de demonstração"
    >
      {/* Botão Fechar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 
                   rounded-full flex items-center justify-center text-white transition-colors z-10"
        aria-label="Fechar vídeo"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Container do Vídeo */}
      <div className="w-full max-w-5xl animate-in zoom-in-95 duration-300">
        {youtubeId ? (
          // Player do YouTube
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title="Demonstração VITAE"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ) : (
          // Placeholder quando não tem vídeo
          <div className="relative w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
            
            {/* Conteúdo do Placeholder */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              {/* Ícone de Play */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-lime-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-lime-500/30">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 text-black ml-1" fill="currentColor" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Vídeo em Produção
              </h3>
              <p className="text-zinc-400 text-sm sm:text-base max-w-md mb-6">
                Estamos preparando um vídeo incrível para mostrar todas as funcionalidades da plataforma.
              </p>
              
              {/* Badge "Em breve" */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime-500/10 border border-lime-500/30 rounded-full text-lime-400 text-sm font-medium">
                <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
                Em breve
              </div>
            </div>

            {/* Decoração de cantos */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-lime-500/30 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-lime-500/30 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-lime-500/30 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-lime-500/30 rounded-br-lg" />
          </div>
        )}

        {/* Texto abaixo do vídeo */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-zinc-400 text-sm sm:text-base">
            {youtubeId 
              ? 'Veja como é fácil gerenciar sua consultoria com a VITAE'
              : 'Enquanto isso, explore as imagens da plataforma abaixo'}
          </p>
          {youtubeId && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-lime-400 hover:text-lime-300 text-sm mt-2 transition-colors"
            >
              Abrir no YouTube <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
