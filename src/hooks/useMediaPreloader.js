import { useState, useEffect, useCallback, useRef } from 'react';

// Media preloader hook for images and videos
export const useMediaPreloader = () => {
  const [preloadedMedia, setPreloadedMedia] = useState(new Map());
  const [loadingMedia, setLoadingMedia] = useState(new Set());
  const preloadQueue = useRef([]);
  const isProcessing = useRef(false);

  // Preload a single image
  const preloadImage = useCallback((src, priority = 'normal') => {
    return new Promise((resolve, reject) => {
      if (preloadedMedia.has(src)) {
        resolve(src);
        return;
      }

      if (loadingMedia.has(src)) {
        // Wait for existing load to complete
        const checkLoaded = () => {
          if (preloadedMedia.has(src)) {
            resolve(src);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      setLoadingMedia(prev => new Set(prev).add(src));

      const img = new Image();
      img.onload = () => {
        setPreloadedMedia(prev => new Map(prev).set(src, { type: 'image', loaded: true, element: img }));
        setLoadingMedia(prev => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        resolve(src);
      };
      img.onerror = () => {
        setLoadingMedia(prev => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  }, [preloadedMedia, loadingMedia]);

  // Preload a single video
  const preloadVideo = useCallback((src, priority = 'normal') => {
    return new Promise((resolve, reject) => {
      if (preloadedMedia.has(src)) {
        resolve(src);
        return;
      }

      if (loadingMedia.has(src)) {
        // Wait for existing load to complete
        const checkLoaded = () => {
          if (preloadedMedia.has(src)) {
            resolve(src);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      setLoadingMedia(prev => new Set(prev).add(src));

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setPreloadedMedia(prev => new Map(prev).set(src, { type: 'video', loaded: true, element: video }));
        setLoadingMedia(prev => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        resolve(src);
      };
      video.onerror = () => {
        setLoadingMedia(prev => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        reject(new Error(`Failed to load video: ${src}`));
      };
      video.src = src;
    });
  }, [preloadedMedia, loadingMedia]);

  // Process preload queue
  const processQueue = useCallback(async () => {
    if (isProcessing.current || preloadQueue.current.length === 0) return;

    isProcessing.current = true;
    
    // Sort by priority (high -> normal -> low)
    preloadQueue.current.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Process up to 3 items concurrently
    const batch = preloadQueue.current.splice(0, 3);
    
    try {
      await Promise.allSettled(
        batch.map(item => {
          if (item.type === 'image') {
            return preloadImage(item.src, item.priority);
          } else if (item.type === 'video') {
            return preloadVideo(item.src, item.priority);
          }
          return Promise.resolve();
        })
      );
    } catch (error) {
      console.error('Error processing preload queue:', error);
    }

    isProcessing.current = false;
    
    // Continue processing if there are more items
    if (preloadQueue.current.length > 0) {
      setTimeout(processQueue, 100);
    }
  }, [preloadImage, preloadVideo]);

  // Add media to preload queue
  const queuePreload = useCallback((src, type = 'image', priority = 'normal') => {
    if (preloadedMedia.has(src) || loadingMedia.has(src)) return;
    
    // Check if already in queue
    const existingIndex = preloadQueue.current.findIndex(item => item.src === src);
    if (existingIndex !== -1) {
      // Update priority if higher
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      if (priorityOrder[priority] > priorityOrder[preloadQueue.current[existingIndex].priority]) {
        preloadQueue.current[existingIndex].priority = priority;
      }
      return;
    }

    preloadQueue.current.push({ src, type, priority });
    processQueue();
  }, [preloadedMedia, loadingMedia, processQueue]);

  // Preload multiple media items
  const preloadBatch = useCallback((mediaItems, priority = 'normal') => {
    mediaItems.forEach(item => {
      if (typeof item === 'string') {
        queuePreload(item, 'image', priority);
      } else {
        queuePreload(item.src, item.type || 'image', item.priority || priority);
      }
    });
  }, [queuePreload]);

  // Check if media is preloaded
  const isPreloaded = useCallback((src) => {
    return preloadedMedia.has(src);
  }, [preloadedMedia]);

  // Check if media is loading
  const isLoading = useCallback((src) => {
    return loadingMedia.has(src);
  }, [loadingMedia]);

  // Get preloaded media element
  const getPreloadedMedia = useCallback((src) => {
    return preloadedMedia.get(src)?.element;
  }, [preloadedMedia]);

  // Clear preloaded media (for memory management)
  const clearPreloaded = useCallback((srcs) => {
    if (!srcs) {
      setPreloadedMedia(new Map());
      return;
    }

    const srcsToRemove = Array.isArray(srcs) ? srcs : [srcs];
    setPreloadedMedia(prev => {
      const newMap = new Map(prev);
      srcsToRemove.forEach(src => newMap.delete(src));
      return newMap;
    });
  }, []);

  return {
    preloadImage,
    preloadVideo,
    queuePreload,
    preloadBatch,
    isPreloaded,
    isLoading,
    getPreloadedMedia,
    clearPreloaded,
    preloadedCount: preloadedMedia.size,
    loadingCount: loadingMedia.size
  };
};

// Lazy loading hook with Intersection Observer
export const useLazyLoading = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options;

  const [visibleElements, setVisibleElements] = useState(new Set());
  const observerRef = useRef(null);
  const elementsRef = useRef(new Map());

  // Initialize Intersection Observer
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without Intersection Observer
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target;
          const elementId = elementsRef.current.get(element);
          
          if (entry.isIntersecting) {
            setVisibleElements(prev => new Set(prev).add(elementId));
            
            if (triggerOnce) {
              observerRef.current?.unobserve(element);
              elementsRef.current.delete(element);
            }
          } else if (!triggerOnce) {
            setVisibleElements(prev => {
              const newSet = new Set(prev);
              newSet.delete(elementId);
              return newSet;
            });
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  // Observe an element
  const observe = useCallback((element, id) => {
    if (!element || !observerRef.current) return;
    
    elementsRef.current.set(element, id);
    observerRef.current.observe(element);
  }, []);

  // Unobserve an element
  const unobserve = useCallback((element) => {
    if (!element || !observerRef.current) return;
    
    const elementId = elementsRef.current.get(element);
    if (elementId) {
      setVisibleElements(prev => {
        const newSet = new Set(prev);
        newSet.delete(elementId);
        return newSet;
      });
    }
    
    observerRef.current.unobserve(element);
    elementsRef.current.delete(element);
  }, []);

  // Check if element is visible
  const isVisible = useCallback((id) => {
    return visibleElements.has(id);
  }, [visibleElements]);

  return {
    observe,
    unobserve,
    isVisible,
    visibleCount: visibleElements.size
  };
};

export default { useMediaPreloader, useLazyLoading };