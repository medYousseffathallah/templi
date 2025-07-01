import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import styled, { keyframes, css } from 'styled-components';

import { SkeletonImage } from './SkeletonLoader';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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
const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: ${props => props.theme.colors?.gray?.[900] || '#111827'};
  border-radius: ${props => props.borderRadius || '8px'};
`;

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: ${props => props.objectFit || 'cover'};
  object-position: ${props => props.objectPosition || 'center'};
  transition: opacity 0.3s ease;
  
  ${props => props.loaded && css`
    animation: ${fadeIn} 0.3s ease;
  `}
  
  ${props => props.loading && css`
    opacity: 0;
  `}
  
  ${props => props.error && css`
    opacity: 0;
  `}
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors?.gray?.[100] || '#f3f4f6'};
  transition: opacity 0.3s ease;
  opacity: ${props => props.show ? 1 : 0};
  pointer-events: ${props => props.show ? 'auto' : 'none'};
  
  ${props => props.skeleton && css`
    background: transparent;
  `}
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: ${props => props.theme.colors?.gray?.[600] || '#6b7280'};
  text-align: center;
  padding: 20px;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${props => props.theme.colors?.gray?.[300] || '#d1d5db'};
  border-top: 3px solid ${props => props.theme.colors?.primary?.main || '#3b82f6'};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
`;

const LoadingSubtext = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors?.gray?.[500] || '#9ca3af'};
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: ${props => props.theme.colors?.primary?.main || '#3b82f6'};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
  border-radius: 0 0 8px 8px;
  opacity: ${props => props.show ? 1 : 0};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: ${props => props.theme.colors?.red?.[600] || '#dc2626'};
  text-align: center;
  padding: 20px;
`;

const RetryButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.theme.colors?.primary?.main || '#3b82f6'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors?.primary?.dark || '#2563eb'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PlayButton = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.show ? 1 : 0};
  pointer-events: ${props => props.show ? 'auto' : 'none'};
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: translate(-50%, -50%) scale(1.1);
  }
  
  &::before {
    content: '▶';
    margin-left: 2px;
  }
`;

/**
 * OptimizedVideo Component
 * Provides enhanced video loading with skeleton states, progress tracking, and error handling
 */
const OptimizedVideo = forwardRef(({
  src,
  poster,
  alt = 'Video content',
  objectFit = 'cover',
  objectPosition = 'center',
  autoPlay = false,
  muted = true,
  loop = false,
  controls = false,
  playsInline = true,
  preload = 'metadata',
  placeholder = 'skeleton',
  showProgress = true,
  showPlayButton = false,
  retryOnError = true,
  maxRetries = 3,
  borderRadius,
  className,
  style,
  onLoad,
  onError,
  onLoadStart,
  onProgress,
  onPlay,
  onPause,
  ...props
}, ref) => {
  const [videoState, setVideoState] = useState('loading');
  const [loadProgress, setLoadProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  // Expose video methods to parent components
  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    get currentTime() { return videoRef.current?.currentTime || 0; },
    set currentTime(time) { if (videoRef.current) videoRef.current.currentTime = time; },
    get duration() { return videoRef.current?.duration || 0; },
    get paused() { return videoRef.current?.paused ?? true; },
    get ended() { return videoRef.current?.ended ?? false; },
    get videoElement() { return videoRef.current; }
  }), []);

  // Handle video loading
  const handleLoadStart = useCallback(() => {
    setVideoState('loading');
    setLoadProgress(0);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleProgress = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          const progress = (bufferedEnd / duration) * 100;
          setLoadProgress(progress);
          onProgress?.(progress);
        }
      }
    }
  }, [onProgress]);

  const handleCanPlay = useCallback(() => {
    setVideoState('loaded');
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((error) => {
    setVideoState('error');
    onError?.(error);
  }, [onError]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  const handleRetry = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setVideoState('loading');
      setLoadProgress(0);
      if (videoRef.current) {
        videoRef.current.load();
      }
    }
  }, [retryCount, maxRetries]);

  const handlePlayButtonClick = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup code if needed
    };
  }, []);

  // Render loading state
  const renderLoading = () => {
    if (videoState !== 'loading') return null;

    if (placeholder === 'skeleton') {
      return (
        <LoadingOverlay show={true} skeleton>
          <SkeletonImage 
            width="100%" 
            height="100%" 
            animation="pulse" 
            borderRadius={borderRadius || '8px'}
          />
          <LoadingContent style={{ position: 'absolute', zIndex: 1 }}>
            <LoadingSpinner />
            <LoadingText>Loading video...</LoadingText>
            <LoadingSubtext>Preparing content</LoadingSubtext>
          </LoadingContent>
        </LoadingOverlay>
      );
    }

    return (
      <LoadingOverlay show={true}>
        <LoadingContent>
          <LoadingSpinner />
          <LoadingText>Loading video...</LoadingText>
          <LoadingSubtext>Preparing content</LoadingSubtext>
        </LoadingContent>
      </LoadingOverlay>
    );
  };

  // Render error state
  const renderError = () => {
    if (videoState !== 'error') return null;
    
    return (
      <LoadingOverlay show={true}>
        <ErrorContainer>
          <div>Failed to load video</div>
          {retryOnError && retryCount < maxRetries && (
            <RetryButton
              onClick={handleRetry}
              disabled={videoState === 'loading'}
            >
              Retry ({retryCount + 1}/{maxRetries})
            </RetryButton>
          )}
        </ErrorContainer>
      </LoadingOverlay>
    );
  };

  // Render progress bar
  const renderProgress = () => {
    if (!showProgress) return null;
    
    return (
      <ProgressBar
        progress={loadProgress}
        show={videoState === 'loading'}
      />
    );
  };

  return (
    <VideoContainer
      borderRadius={borderRadius}
      className={className}
      style={style}
      {...props}
    >
      <StyledVideo
        ref={videoRef}
        src={src}
        poster={poster}
        objectFit={objectFit}
        objectPosition={objectPosition}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline={playsInline}
        preload={preload}
        loaded={videoState === 'loaded'}
        loading={videoState === 'loading'}
        error={videoState === 'error'}
        onLoadStart={handleLoadStart}
        onProgress={handleProgress}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onPlay={handlePlay}
        onPause={handlePause}
      />
      
      {renderLoading()}
      {renderError()}
      {renderProgress()}
      
      {showPlayButton && (
        <PlayButton 
          show={videoState === 'loaded' && !controls}
          onClick={handlePlayButtonClick}
        />
      )}
    </VideoContainer>
  );
});

export default OptimizedVideo;