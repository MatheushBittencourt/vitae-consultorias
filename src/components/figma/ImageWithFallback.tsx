import React, { useState, useRef, useEffect } from 'react';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

// Placeholder blur (cinza claro com gradiente sutil)
const PLACEHOLDER_SRC = 
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmNGY0ZjU7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlNGU0ZTc7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** URL da imagem */
  src?: string;
  /** Texto alternativo (obrigatório para acessibilidade) */
  alt: string;
  /** Ativar lazy loading (padrão: true) */
  lazy?: boolean;
  /** Mostrar placeholder enquanto carrega */
  showPlaceholder?: boolean;
  /** Aspecto da imagem para placeholder */
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
}

/**
 * Componente de imagem otimizado com:
 * - Lazy loading nativo
 * - Placeholder enquanto carrega
 * - Fallback para erros
 * - Animação de fade-in ao carregar
 * - Acessibilidade (alt obrigatório)
 */
export function ImageWithFallback({
  src,
  alt,
  lazy = true,
  showPlaceholder = true,
  aspectRatio = 'auto',
  style,
  className = '',
  ...rest
}: ImageWithFallbackProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para lazy loading manual (fallback)
  useEffect(() => {
    if (!lazy) return;
    
    const container = containerRef.current;
    if (!container) return;

    // Usar lazy loading nativo se disponível
    if ('loading' in HTMLImageElement.prototype) {
      setIsInView(true);
      return;
    }

    // Fallback para browsers antigos
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [lazy]);

  const handleLoad = () => {
    setStatus('loaded');
  };

  const handleError = () => {
    setStatus('error');
  };

  // Classes de aspecto para placeholder
  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  if (status === 'error') {
    return (
      <div
        ref={containerRef}
        className={`inline-flex items-center justify-center bg-zinc-100 ${aspectClasses[aspectRatio]} ${className}`}
        style={style}
        role="img"
        aria-label={`Erro ao carregar imagem: ${alt}`}
      >
        <img 
          src={ERROR_IMG_SRC} 
          alt="" 
          aria-hidden="true"
          className="w-16 h-16 opacity-30"
          {...rest} 
          data-original-url={src} 
        />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${aspectClasses[aspectRatio]} ${className}`}
      style={style}
    >
      {/* Placeholder */}
      {showPlaceholder && status === 'loading' && (
        <div 
          className="absolute inset-0 bg-zinc-100 animate-pulse"
          aria-hidden="true"
        >
          <img 
            src={PLACEHOLDER_SRC} 
            alt="" 
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
        </div>
      )}
      
      {/* Imagem real */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full object-cover
            transition-opacity duration-500 ease-out
            ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}
          `}
          {...rest}
        />
      )}
    </div>
  );
}

/**
 * Componente de imagem de fundo otimizado
 */
interface BackgroundImageProps {
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

export function BackgroundImage({
  src,
  alt,
  children,
  className = '',
  overlayClassName = 'bg-black/50',
}: BackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [src]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      role="img"
      aria-label={alt}
    >
      {/* Background image */}
      <div 
        className={`
          absolute inset-0 bg-cover bg-center
          transition-opacity duration-700
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ backgroundImage: `url(${src})` }}
        aria-hidden="true"
      />
      
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-zinc-200 animate-pulse" aria-hidden="true" />
      )}
      
      {/* Overlay */}
      {overlayClassName && (
        <div className={`absolute inset-0 ${overlayClassName}`} aria-hidden="true" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
