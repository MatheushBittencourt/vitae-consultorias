import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook para animações baseadas em scroll usando Intersection Observer
 * Detecta quando um elemento entra na viewport e retorna estado para animação
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
) {
  const { 
    threshold = 0.1, 
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true 
  } = options;
  
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

/**
 * Classes CSS para animações de scroll
 * Usar com Tailwind CSS
 */
export const scrollAnimationClasses = {
  // Fade in from bottom
  fadeUp: {
    hidden: 'opacity-0 translate-y-8',
    visible: 'opacity-100 translate-y-0',
  },
  // Fade in from left
  fadeLeft: {
    hidden: 'opacity-0 -translate-x-8',
    visible: 'opacity-100 translate-x-0',
  },
  // Fade in from right
  fadeRight: {
    hidden: 'opacity-0 translate-x-8',
    visible: 'opacity-100 translate-x-0',
  },
  // Scale up
  scaleUp: {
    hidden: 'opacity-0 scale-95',
    visible: 'opacity-100 scale-100',
  },
  // Simple fade
  fade: {
    hidden: 'opacity-0',
    visible: 'opacity-100',
  },
};

/**
 * Componente wrapper para animações de scroll
 * Uso: <ScrollReveal animation="fadeUp" delay={0.2}>...</ScrollReveal>
 */
import React from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: keyof typeof scrollAnimationClasses;
  delay?: number;
  duration?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function ScrollReveal({
  children,
  animation = 'fadeUp',
  delay = 0,
  duration = 0.6,
  className = '',
  as: Component = 'div',
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollAnimation();
  const animClasses = scrollAnimationClasses[animation];

  return (
    <Component
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`
        transition-all ease-out
        ${isVisible ? animClasses.visible : animClasses.hidden}
        ${className}
      `}
      style={{
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </Component>
  );
}
