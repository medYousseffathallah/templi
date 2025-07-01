import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useLazyLoading } from '../hooks/useMediaPreloader';
import { recordMetric, startTiming } from '../utils/performanceMonitor';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

// Styled components
const ImageContainer = styled.div`
  position: relative;
  display: inline-block;
  overflow: hidden;
  background-color: ${props => props.theme.colors?.gray?.[100] || '#f3f4f6'};
  
  ${props => props.width && css`width: ${props.width};`}
  ${props => props.height && css`height: ${props.height};`}
  ${props => props.aspectRatio && css`aspect-ratio: ${props.aspectRatio};`}
  ${props => props.borderRadius && css`border-radius: ${props.borderRadius};`}
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: ${props => props.objectFit || 'cover'};
  object-position: ${props => props.objectPosition || 'center'};
  transition: opacity 0.3s ease, transform 0.3s ease;
  
  ${props => props.loaded && css`
    animation: ${fadeIn} 0.3s ease;
  `}
  
  ${props => props.loading && css`
    opacity: 0;
  `}
  
  ${props => props.error && css`
    opacity: 0;
  `}
  
  ${props => props.hover && css`
    &:hover {
      transform: scale(1.05);
    }
  `}
`;

const PlaceholderContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors?.gray?.[100] || '#f3f4f6'};
  
  ${props => props.shimmer && css`
    background: linear-gradient(
      90deg,
      ${props.theme.colors?.gray?.[100] || '#f3f4f6'} 0%,
      ${props.theme.colors?.gray?.[200] || '#e5e7eb'} 50%,
      ${props.theme.colors?.gray?.[100] || '#f3f4f6'} 100%
    );
    background-size: 200px 100%;
    animation: ${shimmer} 1.5s infinite;
  `}
  
  ${props => props.pulse && css`
    animation: ${pulse} 2s infinite;
  `}
  
  transition: opacity 0.3s ease;
  opacity: ${props => props.show ? 1 : 0};
  pointer-events: none;
`;

const ErrorContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors?.gray?.[50] || '#f9fafb'};
  color: ${props => props.theme.colors?.gray?.[500] || '#6b7280'};
  font-size: 12px;
  text-align: center;
  padding: 8px;
`;

const RetryButton = styled.button`
  margin-top: 8px;
  padding: 4px 8px;
  background: ${props => props.theme.colors?.blue?.[500] || '#3b82f6'};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors?.blue?.[600] || '#2563eb'};
  }
  
  &:disabled {
    background: ${props => props.theme.colors?.gray?.[400] || '#9ca3af'};
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: ${props => props.theme.colors?.blue?.[500] || '#3b82f6'};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
  opacity: ${props => props.show ? 1 : 0};
`;

/**
 * OptimizedImage Component
 * Provides lazy loading, WebP support, progressive enhancement, and error handling
 */
const OptimizedImage = ({
  src,
  alt = '',
  width,
  height,
  aspectRatio,
  objectFit = 'cover',
  objectPosition = 'center',
  placeholder = 'shimmer', // 'shimmer', 'pulse', 'blur', 'color', or custom component
  placeholderColor,
  blurDataURL,
  priority = false,
  lazy = true,
  webp = true,
  quality = 80,
  sizes,
  srcSet,
  borderRadius,
  hover = false,
  showProgress = false,
  retryOnError = true,
  maxRetries = 3,
  retryDelay = 1000,
  onLoad,
  onError,
  onLoadStart,
  className,
  style,
  ...props
}) => {
  const [imageState, setImageState] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const imageRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const loadTimerRef = useRef(null);
  
  // Lazy loading
  const { isVisible, ref: lazyRef } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '50px',
    enabled: lazy && !priority
  });
  
  const shouldLoad = !lazy || priority || isVisible;

  // Generate optimized image sources
  const generateSources = useCallback(() => {
    if (!src) return { optimizedSrc: '', sources: [] };
    
    const sources = [];
    let optimizedSrc = src;
    
    // Add WebP support if enabled
    if (webp && typeof src === 'string') {
      // Check if we can generate WebP version
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      if (webpSrc !== src) {
        sources.push({
          srcSet: webpSrc,
          type: 'image/webp'
        });
      }
    }
    
    // Add original format
    sources.push({
      srcSet: srcSet || src,
      type: getImageType(src)
    });
    
    return { optimizedSrc, sources };
  }, [src, webp, srcSet]);
  
  const { optimizedSrc, sources } = generateSources();

  // Handle image loading
  const handleImageLoad = useCallback((event) => {
    if (loadTimerRef.current) {
      const loadTime = loadTimerRef.current.end();
      recordMetric('Image_Load_Success', 1, 'increment');
      recordMetric('Image_Load_Time', loadTime);
    }
    
    setImageState('loaded');
    setLoadProgress(100);
    
    if (onLoad) {
      onLoad(event);
    }
  }, [onLoad]);

  // Handle image error
  const handleImageError = useCallback((event) => {
    if (loadTimerRef.current) {
      loadTimerRef.current.end();
    }
    
    recordMetric('Image_Load_Error', 1, 'increment');
    setImageState('error');
    setLoadProgress(0);
    
    if (onError) {
      onError(event);
    }
    
    // Auto retry if enabled
    if (retryOnError && retryCount < maxRetries) {
      retryTimeoutRef.current = setTimeout(() => {
        handleRetry();
      }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
    }
  }, [onError, retryOnError, retryCount, maxRetries, retryDelay]);

  // Handle load start
  const handleLoadStart = useCallback(() => {
    loadTimerRef.current = startTiming('Image_Load');
    setImageState('loading');
    setLoadProgress(10);
    
    if (onLoadStart) {
      onLoadStart();
    }
  }, [onLoadStart]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setImageState('loading');
    setLoadProgress(0);
    
    // Force reload by changing src
    if (imageRef.current) {
      const currentSrc = imageRef.current.src;
      imageRef.current.src = '';
      setTimeout(() => {
        if (imageRef.current) {
          imageRef.current.src = currentSrc;
        }
      }, 100);
    }
  }, []);

  // Simulate progress for better UX
  useEffect(() => {
    if (imageState === 'loading' && showProgress) {
      const interval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [imageState, showProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (loadTimerRef.current) {
        loadTimerRef.current.end();
      }
    };
  }, []);

  // Get image type from URL
  const getImageType = (url) => {
    if (!url) return '';
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      case 'svg':
        return 'image/svg+xml';
      default:
        return '';
    }
  };

  // Render placeholder
  const renderPlaceholder = () => {
    if (imageState === 'loaded') return null;
    
    const showPlaceholder = imageState === 'loading' || imageState === 'error';
    
    if (React.isValidElement(placeholder)) {
      return React.cloneElement(placeholder, {
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: showPlaceholder ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }
      });
    }
    
    if (placeholder === 'blur' && blurDataURL) {
      return (
        <PlaceholderContainer
          show={showPlaceholder}
          style={{
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)'
          }}
        />
      );
    }
    
    if (placeholder === 'color') {
      return (
        <PlaceholderContainer
          show={showPlaceholder}
          style={{
            backgroundColor: placeholderColor || '#f3f4f6'
          }}
        />
      );
    }
    
    return (
      <PlaceholderContainer
        show={showPlaceholder}
        shimmer={placeholder === 'shimmer'}
        pulse={placeholder === 'pulse'}
      >
        {imageState === 'loading' && (
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Loading...
          </div>
        )}
      </PlaceholderContainer>
    );
  };

  // Render error state
  const renderError = () => {
    if (imageState !== 'error') return null;
    
    return (
      <ErrorContainer>
        <div>Failed to load image</div>
        {retryOnError && retryCount < maxRetries && (
          <RetryButton
            onClick={handleRetry}
            disabled={imageState === 'loading'}
          >
            Retry ({retryCount + 1}/{maxRetries})
          </RetryButton>
        )}
      </ErrorContainer>
    );
  };

  // Render progress bar
  const renderProgress = () => {
    if (!showProgress) return null;
    
    return (
      <ProgressBar
        progress={loadProgress}
        show={imageState === 'loading'}
      />
    );
  };

  return (
    <ImageContainer
      ref={lazyRef}
      width={width}
      height={height}
      aspectRatio={aspectRatio}
      borderRadius={borderRadius}
      className={className}
      style={style}
      {...props}
    >
      {shouldLoad && optimizedSrc && (
        <picture>
          {sources.map((source, index) => (
            <source
              key={index}
              srcSet={source.srcSet}
              type={source.type}
              sizes={sizes}
            />
          ))}
          <StyledImage
            ref={imageRef}
            src={optimizedSrc}
            alt={alt}
            objectFit={objectFit}
            objectPosition={objectPosition}
            loading={priority ? 'eager' : 'lazy'}
            loaded={imageState === 'loaded'}
            isLoading={imageState === 'loading'}
            error={imageState === 'error'}
            hover={hover}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onLoadStart={handleLoadStart}
            sizes={sizes}
          />
        </picture>
      )}
      
      {renderPlaceholder()}
      {renderError()}
      {renderProgress()}
    </ImageContainer>
  );
};

// Higher-order component for easy integration
export const withOptimizedImage = (Component) => {
  return React.forwardRef((props, ref) => {
    return (
      <Component
        ref={ref}
        {...props}
        ImageComponent={OptimizedImage}
      />
    );
  });
};

// Hook for image optimization
export const useImageOptimization = (src, options = {}) => {
  const [state, setState] = useState({
    loading: true,
    loaded: false,
    error: false,
    progress: 0
  });
  
  const imageRef = useRef(null);
  
  useEffect(() => {
    if (!src) return;
    
    const img = new Image();
    imageRef.current = img;
    
    img.onload = () => {
      setState({
        loading: false,
        loaded: true,
        error: false,
        progress: 100
      });
    };
    
    img.onerror = () => {
      setState({
        loading: false,
        loaded: false,
        error: true,
        progress: 0
      });
    };
    
    img.src = src;
    
    return () => {
      if (imageRef.current) {
        imageRef.current.onload = null;
        imageRef.current.onerror = null;
      }
    };
  }, [src]);
  
  return {
    ...state,
    image: imageRef.current
  };
};

export default OptimizedImage;