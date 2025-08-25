// Performance utilities for optimizing the application
import React from 'react';

// Lazy loading utility for components
export const createLazyComponent = (importFn: () => Promise<any>) => {
  return React.lazy(importFn);
};

// Image compression utility
export const compressImage = (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      const { width, height } = img;
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Database query optimization utility
export const createOptimizedQuery = (tableName: string, fields: string[], limit: number = 50) => {
  return {
    from: tableName,
    select: fields.join(', '),
    limit,
  };
};

// Memory management utility
export const clearCache = () => {
  // Clear any global caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
};