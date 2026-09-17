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
    let fallbackTimer;

    const reveal = () => {
      window.clearTimeout(fallbackTimer);
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
    // Ensure content cannot remain hidden when a browser does not deliver
    // intersection events (for example, during an automated full-page capture).
    fallbackTimer = window.setTimeout(reveal, 1800 + delay);

    return () => {
      window.clearTimeout(fallbackTimer);
      observer.disconnect();
      element.removeEventListener('focusin', reveal);
    };
  }, [delay]);

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
