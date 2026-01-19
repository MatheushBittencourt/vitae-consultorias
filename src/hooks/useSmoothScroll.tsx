import { useCallback, useEffect } from 'react';

interface SmoothScrollOptions {
  offset?: number;
  duration?: number;
}

/**
 * Hook para navegação suave (smooth scroll) em links âncora
 */
export function useSmoothScroll(options: SmoothScrollOptions = {}) {
  const { offset = 80, duration = 800 } = options;

  /**
   * Função de easing para animação suave
   */
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  /**
   * Scroll animado para uma posição
   */
  const smoothScrollTo = useCallback((targetY: number) => {
    const startY = window.scrollY;
    const difference = targetY - startY;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);

      window.scrollTo(0, startY + difference * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [duration]);

  /**
   * Scroll para um elemento específico
   */
  const scrollToElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const targetPosition = elementPosition - offset;

    smoothScrollTo(targetPosition);
  }, [offset, smoothScrollTo]);

  /**
   * Scroll para o topo da página
   */
  const scrollToTop = useCallback(() => {
    smoothScrollTo(0);
  }, [smoothScrollTo]);

  /**
   * Handler para links âncora
   */
  const handleAnchorClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href');
    if (!href?.startsWith('#')) return;

    e.preventDefault();
    const targetId = href.slice(1);
    
    if (targetId === '' || targetId === 'top') {
      scrollToTop();
    } else {
      scrollToElement(targetId);
    }

    // Atualizar URL sem reload
    window.history.pushState(null, '', href);
  }, [scrollToElement, scrollToTop]);

  return {
    scrollToElement,
    scrollToTop,
    handleAnchorClick,
  };
}

/**
 * Hook para detectar a seção ativa durante o scroll
 */
export function useActiveSection(sectionIds: string[], offset: number = 100) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        const { top, bottom } = element.getBoundingClientRect();
        const elementTop = top + scrollY - offset;
        const elementBottom = bottom + scrollY - offset;

        if (scrollY >= elementTop && scrollY < elementBottom) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check inicial

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds, offset]);

  return activeSection;
}

import { useState } from 'react';

/**
 * Componente de link com smooth scroll
 */
interface SmoothLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  offset?: number;
}

export function SmoothLink({ href, children, offset = 80, onClick, ...props }: SmoothLinkProps) {
  const { handleAnchorClick } = useSmoothScroll({ offset });

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#')) {
      handleAnchorClick(e);
    }
    onClick?.(e);
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
