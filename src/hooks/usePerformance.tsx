import { useCallback, useMemo } from 'react';

// Performance hook for debouncing functions
export const useDebounce = (func: (...args: any[]) => void, delay: number) => {
  return useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    })(),
    [func, delay]
  );
};

// Performance hook for throttling functions  
export const useThrottle = (func: (...args: any[]) => void, delay: number) => {
  return useCallback(
    (() => {
      let lastCall = 0;
      return (...args: any[]) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          return func(...args);
        }
      };
    })(),
    [func, delay]
  );
};

// Memoized data processor
export const useDataProcessor = (data: any[], processor: (item: any) => any) => {
  return useMemo(() => {
    if (!data?.length) return [];
    return data.map(processor);
  }, [data, processor]);
};

// Performance-optimized image preloader
export const useImagePreloader = (urls: string[]) => {
  return useMemo(() => {
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, [urls]);
};