import { useLayoutEffect, useRef } from 'react';

function ScrollReveal({
  as: Component = 'div',
  children,
  className = '',
  delay = 0,
  style,
  ...props
}) {
  const elementRef = useRef(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      element.classList.add('scroll-reveal--visible');
      return undefined;
    }

    element.classList.add('scroll-reveal--pending');
    let observer;

    const reveal = () => {
      element.classList.remove('scroll-reveal--pending');
      element.classList.add('scroll-reveal--visible');
      observer?.disconnect();
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal();
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.12,
      }
    );

    observer.observe(element);
    element.addEventListener('focusin', reveal);

    return () => {
      observer.disconnect();
      element.removeEventListener('focusin', reveal);
    };
  }, []);

  return (
    <Component
      ref={elementRef}
      className={`scroll-reveal ${className}`.trim()}
      style={{ ...style, '--scroll-reveal-delay': `${delay}ms` }}
      {...props}
    >
      {children}
    </Component>
  );
}

export default ScrollReveal;
