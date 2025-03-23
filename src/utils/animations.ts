
import { useEffect, useState } from 'react';

// A hook for elements that should animate when they enter the viewport
export function useInView(options = {}) {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return { ref: setRef, isInView };
}

// A hook for animations that should only play once
export function useOnceAnimation(delay = 0) {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return hasAnimated;
}

// A hook for staggered animations (like list items)
export function useStaggeredAnimation(itemCount: number, baseDelay = 100) {
  return Array.from({ length: itemCount }, (_, i) => i * baseDelay);
}
