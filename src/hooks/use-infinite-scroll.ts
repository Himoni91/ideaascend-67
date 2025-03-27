
import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useInfiniteScroll({
  threshold = 0.5,
  rootMargin = '0px',
  enabled = true
}: UseInfiniteScrollOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  const setRef = useCallback((node: HTMLDivElement | null) => {
    if (targetRef.current) {
      // Clean up previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    }

    // Save the node
    targetRef.current = node;

    if (!node || !enabled) {
      return;
    }

    // Create new observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(node);
    observerRef.current = observer;
  }, [threshold, rootMargin, enabled]);

  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { setRef, isIntersecting };
}
