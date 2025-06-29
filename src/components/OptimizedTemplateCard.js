import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styled from "styled-components";
import { useNavigate } from 'react-router-dom';
import { Close, Star, Favorite, Info, ChevronLeft, ChevronRight, Fullscreen, FullscreenExit, Verified, Download, Upload, GetApp } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useMediaPreloader, useLazyLoading } from "../hooks/useMediaPreloader";
import { interactionApi } from "../services/api";

// Styled components (reusing existing styles)
const Card = styled.div`
  position: relative;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  width: 100%;
  max-width: 400px;
  height: 600px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 32px 64px rgba(0, 0, 0, 0.12), 0 16px 32px rgba(0, 0, 0, 0.08);
  }
`;

const MediaContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`;

const LazyMediaItem = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: ${props => props.$expanded ? 'contain' : 'cover'};
  background-position: center;
  background-repeat: no-repeat;
  background-color: ${props => props.$expanded ? '#000' : '#f5f5f5'};
  transition: all 0.3s ease;
  opacity: ${props => props.$isActive ? 1 : 0};
  cursor: ${props => props.$expanded ? 'default' : 'pointer'};
  
  /* Loading skeleton */
  ${props => !props.$loaded && `
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  `}
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const LazyVideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$expanded ? 'contain' : 'cover'};
  background-color: ${props => props.$expanded ? '#000' : '#f5f5f5'};
  opacity: ${props => props.$isActive ? 1 : 0};
  transition: all 0.3s ease;
  cursor: ${props => props.$expanded ? 'default' : 'pointer'};
`;

const LoadingPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const MediaNavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.2) 0%, 
    rgba(255, 255, 255, 0.1) 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 4;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.3) 0%, 
      rgba(255, 255, 255, 0.2) 100%);
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  
  ${Card}:hover & {
    opacity: 1;
  }
`;

const PrevButton = styled(MediaNavButton)`
  left: 16px;
`;

const NextButton = styled(MediaNavButton)`
  right: 16px;
`;

// Optimized Template Card Component
const OptimizedTemplateCard = ({
  template,
  isActive,
  handleSwipe,
  handleFavorite,
  style,
  showRemoveButton = false,
  onRemoveFromFavorites,
  priority = 'normal' // 'high', 'normal', 'low'
}) => {
  const { currentUser } = useAuth();
  const { cache } = useData();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const videoRefs = useRef([]);
  
  // Media preloader and lazy loading hooks
  const { 
    preloadImage, 
    preloadVideo, 
    queuePreload, 
    isPreloaded, 
    isLoading: isMediaLoading 
  } = useMediaPreloader();
  
  const { observe, isVisible } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '100px'
  });
  
  // Component state
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [loadedMedia, setLoadedMedia] = useState(new Set());
  
  // Create media files array with priority-based loading
  const mediaFiles = useMemo(() => {
    const files = [];
    
    // Add images from imageUrls array
    if (template.imageUrls && template.imageUrls.length > 0) {
      template.imageUrls.forEach((url, index) => {
        files.push({ 
          url, 
          type: 'image',
          priority: index === 0 ? 'high' : priority // First image gets high priority
        });
      });
    }
    
    // Add video if videoUrl exists
    if (template.videoUrl) {
      files.push({ 
        url: template.videoUrl, 
        type: 'video',
        priority: 'normal' // Videos get normal priority
      });
    }
    
    // Fallback to single imageUrl
    if (files.length === 0 && template.imageUrl) {
      files.push({ 
        url: template.imageUrl, 
        type: 'image',
        priority: 'high'
      });
    }
    
    return files;
  }, [template.imageUrls, template.videoUrl, template.imageUrl, priority]);
  
  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (cardRef.current) {
      observe(cardRef.current, template._id);
    }
  }, [observe, template._id]);
  
  // Preload media when card becomes visible or active
  useEffect(() => {
    const shouldLoad = isVisible(template._id) || isActive;
    
    if (shouldLoad && mediaFiles.length > 0) {
      // Preload current media immediately
      const currentMedia = mediaFiles[currentMediaIndex];
      if (currentMedia && !isPreloaded(currentMedia.url)) {
        if (currentMedia.type === 'image') {
          preloadImage(currentMedia.url, 'high');
        } else if (currentMedia.type === 'video') {
          preloadVideo(currentMedia.url, 'normal');
        }
      }
      
      // Queue other media for background loading
      mediaFiles.forEach((media, index) => {
        if (index !== currentMediaIndex) {
          queuePreload(media.url, media.type, media.priority);
        }
      });
    }
  }, [isVisible, template._id, isActive, mediaFiles, currentMediaIndex, preloadImage, preloadVideo, queuePreload, isPreloaded]);
  
  // Preload adjacent templates when this card is active
  useEffect(() => {
    if (isActive && 'serviceWorker' in navigator) {
      // Send message to service worker to cache template assets
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({
          type: 'CACHE_TEMPLATES',
          templates: [template]
        });
      });
    }
  }, [isActive, template]);
  
  // Handle media navigation
  const navigateMedia = useCallback((direction) => {
    if (mediaFiles.length <= 1) return;
    
    const newIndex = direction === 'next' 
      ? (currentMediaIndex + 1) % mediaFiles.length
      : (currentMediaIndex - 1 + mediaFiles.length) % mediaFiles.length;
    
    setCurrentMediaIndex(newIndex);
    
    // Preload the new media if not already loaded
    const newMedia = mediaFiles[newIndex];
    if (newMedia && !isPreloaded(newMedia.url)) {
      if (newMedia.type === 'image') {
        preloadImage(newMedia.url, 'high');
      } else if (newMedia.type === 'video') {
        preloadVideo(newMedia.url, 'high');
      }
    }
  }, [mediaFiles, currentMediaIndex, preloadImage, preloadVideo, isPreloaded]);
  
  // Handle media loading state
  const handleMediaLoad = useCallback((url) => {
    setLoadedMedia(prev => new Set(prev).add(url));
  }, []);
  
  // Render media item with lazy loading
  const renderMediaItem = useCallback((media, index) => {
    const isCurrentMedia = index === currentMediaIndex;
    const shouldLoad = isVisible(template._id) || isActive || isCurrentMedia;
    const mediaLoaded = loadedMedia.has(media.url) || isPreloaded(media.url);
    
    if (media.type === 'video') {
      return (
        <LazyVideoElement
          key={`${media.url}-${index}`}
          ref={el => videoRefs.current[index] = el}
          $isActive={isCurrentMedia}
          $expanded={isVideoExpanded}
          src={shouldLoad ? media.url : undefined}
          muted
          loop
          playsInline
          onLoadedData={() => handleMediaLoad(media.url)}
          onError={() => console.error('Video failed to load:', media.url)}
        />
      );
    }
    
    return (
      <LazyMediaItem
        key={`${media.url}-${index}`}
        $isActive={isCurrentMedia}
        $expanded={isImageExpanded}
        $loaded={mediaLoaded}
        style={{
          backgroundImage: shouldLoad && mediaLoaded ? `url(${media.url})` : 'none'
        }}
        onLoad={() => handleMediaLoad(media.url)}
      >
        {shouldLoad && !mediaLoaded && (
          <LoadingPlaceholder>
            Loading...
          </LoadingPlaceholder>
        )}
      </LazyMediaItem>
    );
  }, [currentMediaIndex, isVisible, template._id, isActive, loadedMedia, isPreloaded, isVideoExpanded, isImageExpanded, handleMediaLoad]);
  
  // Auto-play videos when they become active
  useEffect(() => {
    if (isActive && mediaFiles.length > 0) {
      const currentMedia = mediaFiles[currentMediaIndex];
      if (currentMedia && currentMedia.type === 'video') {
        const videoElement = videoRefs.current[currentMediaIndex];
        if (videoElement && loadedMedia.has(currentMedia.url)) {
          videoElement.play().catch(console.error);
        }
      }
      
      // Pause other videos
      videoRefs.current.forEach((video, index) => {
        if (video && index !== currentMediaIndex) {
          video.pause();
        }
      });
    } else {
      // Pause all videos when card is not active
      videoRefs.current.forEach(video => {
        if (video) {
          video.pause();
        }
      });
    }
  }, [isActive, currentMediaIndex, mediaFiles, loadedMedia]);
  
  // Handle user interactions (reusing existing logic)
  const handleUserClick = (e) => {
    e.stopPropagation();
    const userId = template.creator?._id || template.creator?.id || template.createdBy?._id || template.createdBy?.id || template.userId;
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };
  
  const handleDownload = async (e) => {
    e.stopPropagation();
    if (template.githubLink) {
      if (currentUser) {
        try {
          await interactionApi.downloadTemplate(currentUser, template._id);
        } catch (error) {
          console.error('Failed to record download interaction:', error);
        }
      }
      window.open(template.githubLink, '_blank', 'noopener,noreferrer');
    }
  };
  
  const getLimitedDescription = (text) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= 15) return text;
    return words.slice(0, 15).join(' ') + '...';
  };
  
  return (
    <Card ref={cardRef} style={style}>
      <MediaContainer>
        {mediaFiles.map((media, index) => renderMediaItem(media, index))}
        
        {/* Media navigation buttons */}
        {mediaFiles.length > 1 && (
          <>
            <PrevButton onClick={() => navigateMedia('prev')}>
              <ChevronLeft />
            </PrevButton>
            <NextButton onClick={() => navigateMedia('next')}>
              <ChevronRight />
            </NextButton>
          </>
        )}
      </MediaContainer>
      
      {/* Rest of the template card content would go here */}
      {/* This is a simplified version focusing on the media optimization */}
    </Card>
  );
};

export default OptimizedTemplateCard;