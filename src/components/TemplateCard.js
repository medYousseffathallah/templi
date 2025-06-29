import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from "styled-components";
import { useNavigate } from 'react-router-dom';
import { Close, Star, Favorite, Info, ChevronLeft, ChevronRight, Fullscreen, FullscreenExit, Verified, Download, Upload, GetApp } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { interactionApi } from "../services/api";
import OptimizedImage from './OptimizedImage';
import { useDebounceCallback } from '../hooks/useDebounce';
import { measureTemplateLoad, recordMetric, startTiming } from '../utils/performanceMonitor';

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

const MediaItem = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: all 0.3s ease;
  opacity: ${props => props.$isActive ? 1 : 0};
  cursor: ${props => props.$expanded ? 'default' : 'pointer'};
  background-color: ${props => props.$expanded ? '#000' : 'transparent'};
`;

const OptimizedMediaImage = styled(OptimizedImage)`
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$expanded ? 'contain' : 'cover'};
  background-color: ${props => props.$expanded ? '#000' : 'transparent'};
  opacity: ${props => props.$isActive ? 1 : 0};
  transition: all 0.3s ease;
  cursor: ${props => props.$expanded ? 'default' : 'pointer'};
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
  
  &:active {
    transform: translateY(-50%) scale(0.95);
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

const ExpandButton = styled.button`
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 5;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const MediaIndicators = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 3;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
`;

const MediaIndicator = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(props) => 
    props.$active 
      ? 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)' 
      : 'rgba(255, 255, 255, 0.4)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: ${(props) => 
    props.$active 
      ? '0 2px 8px rgba(255, 255, 255, 0.3)' 
      : '0 1px 3px rgba(0, 0, 0, 0.2)'};
  
  &:hover {
    background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
    transform: scale(1.3);
    box-shadow: 0 3px 12px rgba(255, 255, 255, 0.4);
  }
`;

const CardBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  transition: filter 0.3s ease;
`;

const CardOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, 
    rgba(0, 0, 0, 0.05) 0%,
    rgba(0, 0, 0, 0.1) 30%,
    rgba(0, 0, 0, 0.4) 70%, 
    rgba(0, 0, 0, 0.8) 100%);
`;

const DirectionalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 5;
  border-radius: var(--borderRadius-large);
`;

const LikeOverlay = styled(DirectionalOverlay)`
  background-color: rgba(76, 175, 80, 0.2);
  border: 4px solid rgba(76, 175, 80, 0.8);
  &::after {
    content: 'LIKE';
    color: #4CAF50;
    font-size: 42px;
    font-weight: 700;
    letter-spacing: 2px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
`;

const DislikeOverlay = styled(DirectionalOverlay)`
  background-color: rgba(244, 67, 54, 0.2);
  border: 4px solid rgba(244, 67, 54, 0.8);
  &::after {
    content: 'NOPE';
    color: #F44336;
    font-size: 42px;
    font-weight: 700;
    letter-spacing: 2px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
`;

const CardContent = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 32px 28px;
  color: white;
  z-index: 2;
  background: linear-gradient(to top, 
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    transparent 100%);
  border-radius: 0 0 24px 24px;
`;

const Title = styled.h2`
  margin: 0 0 12px 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.8px;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.95);
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 20px;
  font-weight: 400;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  max-height: ${(props) => (props.$showDetails ? 'none' : '52px')};
  overflow: ${(props) => (props.$showDetails ? 'visible' : 'hidden')};
  text-overflow: ellipsis;
  letter-spacing: 0.2px;
`;

const ReadMoreButton = styled.button`
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.15) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;
  
  &:hover {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.25) 0%, 
      rgba(255, 255, 255, 0.15) 100%);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const UserTrustInfo = styled.div`
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  backdrop-filter: blur(10px);
  display: ${props => props.$show ? 'block' : 'none'};
`;

const UserInfoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const UserName = styled.span`
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
  padding: 2px 4px;
  
  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const VerifiedBadge = styled.div`
  display: flex;
  align-items: center;
  color: #4CAF50;
`;

const TrustMetrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const TrustMetric = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
`;

const MetricIcon = styled.div`
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.6);
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
`;

const Tag = styled.span`
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.25) 0%, 
    rgba(255, 255, 255, 0.15) 100%);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.3px;
  
  &:hover {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.35) 0%, 
      rgba(255, 255, 255, 0.25) 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 280px;
  margin: 0 auto;
  position: relative;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  border: none;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
    background: rgba(255, 255, 255, 1);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
  }
  
  &:nth-child(3) { /* Like button */
    background: linear-gradient(135deg, var(--primary-main) 0%, var(--primary-dark) 100%);
    color: white;
    box-shadow: 0 8px 25px rgba(255, 88, 100, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-main) 100%);
      box-shadow: 0 12px 35px rgba(255, 88, 100, 0.4);
    }
    
    svg {
      color: white !important;
    }
  }
`;

const InfoButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: rgba(0, 0, 0, 0.5);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: white;
  z-index: 3;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
    transform: scale(1.1);
  }
`;



const TemplateCard = ({
  template,
  isActive,
  handleSwipe,
  handleFavorite,
  style,
  showRemoveButton = false,
  onRemoveFromFavorites,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Performance monitoring
  const loadTimerRef = useRef(null);
  
  useEffect(() => {
    if (template && !loadTimerRef.current) {
      loadTimerRef.current = measureTemplateLoad(template._id, 'Render');
      recordMetric('Template_Card_Mount', 1, 'increment');
    }
    
    return () => {
      if (loadTimerRef.current) {
        loadTimerRef.current.end();
      }
    };
  }, [template]);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [swipePercentage, setSwipePercentage] = useState(0);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [cardTransform, setCardTransform] = useState({ x: 0, rotate: 0, blur: 0 });
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  
  // Create media files array from template's imageUrls and videoUrl
  const mediaFiles = useMemo(() => {
    const files = [];
    
    // Add images from imageUrls array
    if (template.imageUrls && template.imageUrls.length > 0) {
      template.imageUrls.forEach(url => {
        files.push({ url, type: 'image' });
      });
    }
    
    // Add video if videoUrl exists
    if (template.videoUrl) {
      files.push({ url: template.videoUrl, type: 'video' });
    }
    
    // Fallback to single imageUrl if no imageUrls or videoUrl
    if (files.length === 0 && template.imageUrl) {
      files.push({ url: template.imageUrl, type: 'image' });
    }
    
    return files;
  }, [template.imageUrls, template.videoUrl, template.imageUrl]);
  const videoRefs = useRef([]);
  
  const cardRef = useRef(null);
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 500;
  
  // Handle user name click to navigate to profile
  const handleUserClick = (e) => {
    e.stopPropagation();
    const userId = template.creator?._id || template.creator?.id || template.createdBy?._id || template.createdBy?.id || template.userId;
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  // Function to limit description to 15 words
  const getLimitedDescription = (text) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= 15) return text;
    return words.slice(0, 15).join(' ') + '...';
  };
  
  // Swipe thresholds
  const minSwipeDistance = 50;
  const swipeThreshold = screenWidth * 0.35; // 35% of screen width
  const velocityThreshold = 0.5; // pixels per millisecond

  // Reset card position when not active
  useEffect(() => {
    if (!isActive) {
      resetCardPosition();
      setCurrentMediaIndex(0);
    }
  }, [isActive]);
  
  // Auto-play videos when they become active
  useEffect(() => {
    if (isActive && mediaFiles.length > 0) {
      const currentMedia = mediaFiles[currentMediaIndex];
      if (currentMedia && currentMedia.type === 'video') {
        const videoElement = videoRefs.current[currentMediaIndex];
        if (videoElement) {
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
  }, [isActive, currentMediaIndex, mediaFiles]);
  
  // Media navigation functions
  const goToPreviousMedia = (e) => {
    e.stopPropagation();
    if (mediaFiles.length > 1) {
      setCurrentMediaIndex(prev => prev > 0 ? prev - 1 : mediaFiles.length - 1);
      setIsVideoExpanded(false);
      setIsImageExpanded(false);
    }
  };
  
  const goToNextMedia = (e) => {
    e.stopPropagation();
    if (mediaFiles.length > 1) {
      setCurrentMediaIndex(prev => prev < mediaFiles.length - 1 ? prev + 1 : 0);
      setIsVideoExpanded(false);
      setIsImageExpanded(false);
    }
  };
  
  const goToMediaIndex = (index, e) => {
    e.stopPropagation();
    setCurrentMediaIndex(index);
    setIsVideoExpanded(false);
    setIsImageExpanded(false);
  };
  
  // Determine if current media is video
  const isCurrentMediaVideo = (url) => {
    return url && (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.includes('video'));
  };

  // Reset card position
  const resetCardPosition = () => {
    setCardTransform({ x: 0, rotate: 0, blur: 0 });
    setSwipePercentage(0);
    setSwiping(false);
    setSwipeDirection(null);
  };

  // Calculate swipe percentage (0 to 1)
  const calculateSwipePercentage = (deltaX) => {
    return Math.min(Math.abs(deltaX) / swipeThreshold, 1);
  };

  // Calculate card transform based on swipe
  const calculateCardTransform = (deltaX) => {
    const percentage = calculateSwipePercentage(deltaX);
    const rotationFactor = 0.1; // Adjust for rotation intensity
    const blurFactor = 3; // Max blur in pixels
    
    return {
      x: deltaX,
      rotate: deltaX * rotationFactor,
      blur: percentage * blurFactor
    };
  };

  // Apply swipe action with animation
  const applySwipeAction = (direction) => {
    const directionMultiplier = direction === 'right' ? 1 : -1;
    const exitX = directionMultiplier * screenWidth * 1.5;
    
    // Set swiping and direction for visual feedback
    setSwiping(true);
    setSwipeDirection(direction === 'right' ? 'like' : 'dislike');
    
    // Animate card off screen
    setCardTransform({
      x: exitX,
      rotate: directionMultiplier * 30,
      blur: 5
    });
    
    // Call the swipe handler after a short delay to allow animation
    setTimeout(() => {
      handleSwipe(direction === 'right' ? 'right' : 'left', template._id);
      resetCardPosition();
    }, 250); // Slightly faster animation for better responsiveness
  };

  // Touch event handlers for mobile
  const onTouchStart = (e) => {
    if (!isActive) return;
    
    // Prevent swipe when trying to select text
    if (window.getSelection().toString()) return;
    
    // Check if we're clicking on text content
    const target = e.target;
    if (target.tagName === 'P' || target.closest('.description-text')) return;
    
    setTouchStartTime(Date.now());
    setTouchEnd({ x: 0, y: 0 });
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
    setSwiping(false);
    setSwipeDirection(null);
  };

  const onTouchMove = (e) => {
    if (!isActive) return;
    
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });

    // Calculate horizontal distance
    const deltaX = touchEnd.x - touchStart.x;
    const transform = calculateCardTransform(deltaX);
    
    // Update card transform
    setCardTransform(transform);
    
    // Calculate swipe percentage for overlays
    const percentage = calculateSwipePercentage(deltaX);
    setSwipePercentage(percentage);

    // Update swipe direction for overlay text
    if (Math.abs(deltaX) > minSwipeDistance) {
      setSwiping(true);
      setSwipeDirection(deltaX > 0 ? "like" : "dislike");
    } else {
      setSwiping(false);
      setSwipeDirection(null);
    }
  };

  const onTouchEnd = () => {
    if (!isActive || !touchStart.x || !touchEnd.x) return;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const touchDuration = Date.now() - touchStartTime;
    const velocity = Math.abs(deltaX) / touchDuration; // pixels per ms

    // Check if swipe exceeds threshold or has sufficient velocity
    if (
      (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) ||
      (Math.abs(deltaX) > minSwipeDistance && velocity > velocityThreshold)
    ) {
      // Apply swipe action with direction
      const direction = deltaX > 0 ? "right" : "left";
      applySwipeAction(direction);
    } else {
      // Snap back to original position with animation
      resetCardPosition();
    }
  };

  // Mouse event handlers for desktop
  const onMouseDown = (e) => {
    if (!isActive) return;
    
    // Prevent swipe when trying to select text
    if (window.getSelection().toString()) return;
    
    // Check if we're clicking on text content
    const target = e.target;
    if (target.tagName === 'P' || target.closest('.description-text')) return;
    
    setTouchStartTime(Date.now());
    setIsDragging(true);
    setTouchEnd({ x: 0, y: 0 });
    setTouchStart({
      x: e.clientX,
      y: e.clientY,
    });
    setSwiping(false);
    setSwipeDirection(null);
  };

  const onMouseMove = (e) => {
    if (!isActive || !isDragging) return;
    
    setTouchEnd({
      x: e.clientX,
      y: e.clientY,
    });

    // Calculate horizontal distance
    const deltaX = touchEnd.x - touchStart.x;
    const transform = calculateCardTransform(deltaX);
    
    // Update card transform
    setCardTransform(transform);
    
    // Calculate swipe percentage for overlays
    const percentage = calculateSwipePercentage(deltaX);
    setSwipePercentage(percentage);

    // Update swipe direction for overlay text
    if (Math.abs(deltaX) > minSwipeDistance) {
      setSwiping(true);
      setSwipeDirection(deltaX > 0 ? "like" : "dislike");
    } else {
      setSwiping(false);
      setSwipeDirection(null);
    }
  };

  const onMouseUp = () => {
    if (!isActive || !isDragging || !touchStart.x || !touchEnd.x) {
      setIsDragging(false);
      return;
    }

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const touchDuration = Date.now() - touchStartTime;
    const velocity = Math.abs(deltaX) / touchDuration; // pixels per ms

    // Check if swipe exceeds threshold or has sufficient velocity
    if (
      (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) ||
      (Math.abs(deltaX) > minSwipeDistance && velocity > velocityThreshold)
    ) {
      // Apply swipe action with direction
      const direction = deltaX > 0 ? "right" : "left";
      applySwipeAction(direction);
    } else {
      // Snap back to original position with animation
      resetCardPosition();
    }

    // Reset dragging state
    setIsDragging(false);
  };

  // Handle mouse leaving the element while dragging
  const onMouseLeave = () => {
    if (isDragging) {
      resetCardPosition();
      setIsDragging(false);
    }
  };

  // Debounced interaction handlers for better performance
  const debouncedDislike = useDebounceCallback(() => {
    recordMetric('Template_Dislike_Action', 1, 'increment');
    applySwipeAction("left");
  }, 300, []);

  const debouncedLike = useDebounceCallback(() => {
    recordMetric('Template_Like_Action', 1, 'increment');
    applySwipeAction("right");
  }, 300, []);

  const debouncedFavorite = useDebounceCallback(() => {
    recordMetric('Template_Favorite_Action', 1, 'increment');
    handleFavorite(template._id);
  }, 500, [template._id, handleFavorite]);

  // Button handlers
  const handleDislike = () => {
    debouncedDislike();
  };

  const handleLike = () => {
    debouncedLike();
  };

  const handleFavoriteClick = () => {
    debouncedFavorite();
  };
  
  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  const handleReadMore = (e) => {
    e.stopPropagation();
    setShowDetails(true);
  };

  // Keyboard navigation for accessibility
  const handleKeyDown = (e) => {
    if (!isActive) return;
    
    if (e.key === 'ArrowLeft') {
      applySwipeAction('left');
    } else if (e.key === 'ArrowRight') {
      applySwipeAction('right');
    } else if (e.key === 'Enter') {
      applySwipeAction('right');
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (template.githubLink) {
      // Record download interaction if user is logged in
      if (currentUser) {
        try {
          await interactionApi.downloadTemplate(currentUser, template._id);
        } catch (error) {
          console.error('Failed to record download interaction:', error);
          // Don't prevent the download if tracking fails
        }
      }
      window.open(template.githubLink, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback - could show a message or redirect to a default repository
      console.log('No GitHub repository available for this template');
    }
  };

  return (
    <Card
      ref={cardRef}
      style={{
        transform: `translateX(${cardTransform.x}px) rotate(${cardTransform.rotate}deg)`,
        ...style,
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={isActive ? 0 : -1}
      data-active={isActive ? "true" : "false"}
      aria-label={`Template: ${template.title}. Use arrow keys to like or dislike.`}
      role="button"
    >
      <MediaContainer>
        {mediaFiles.map((media, index) => {
          const isVideo = media.type === 'video' || isCurrentMediaVideo(media.url);
          const isActive = index === currentMediaIndex;
          
          return isVideo ? (
            <VideoElement
              key={index}
              ref={el => videoRefs.current[index] = el}
              src={media.url}
              $isActive={isActive}
              $expanded={isVideoExpanded}
              muted
              loop
              playsInline
              style={{
                filter: `blur(${cardTransform.blur}px)`,
              }}
              onClick={() => !isVideoExpanded && setIsVideoExpanded(true)}
            />
          ) : (
            <MediaItem
              key={index}
              $isActive={isActive}
              $expanded={isImageExpanded}
              style={{
                filter: `blur(${cardTransform.blur}px)`,
              }}
              onClick={() => !isImageExpanded && setIsImageExpanded(true)}
            >
              <OptimizedMediaImage
                src={media.url}
                alt={`${template.title || 'Template'} - Image ${index + 1}`}
                objectFit={isImageExpanded ? 'contain' : 'cover'}
                priority={index === 0 && isActive}
                lazy={!isActive || index !== currentMediaIndex}
                placeholder="shimmer"
                hover={!isImageExpanded}
                onLoad={() => recordMetric('Template_Image_Load', 1, 'increment')}
                onError={() => recordMetric('Template_Image_Error', 1, 'increment')}
              />
            </MediaItem>
          );
        })}
        
        {/* Media Navigation Buttons */}
        {mediaFiles.length > 1 && (
          <>
            <PrevButton onClick={goToPreviousMedia} aria-label="Previous media">
              <ChevronLeft />
            </PrevButton>
            <NextButton onClick={goToNextMedia} aria-label="Next media">
              <ChevronRight />
            </NextButton>
          </>
        )}
        
        {/* Media Indicators */}
        {mediaFiles.length > 1 && (
          <MediaIndicators>
            {mediaFiles.map((_, index) => (
              <MediaIndicator
                key={index}
                className={index === currentMediaIndex ? 'active' : ''}
                onClick={(e) => goToMediaIndex(index, e)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </MediaIndicators>
        )}
        
        {/* Expand Button for Videos */}
        {mediaFiles[currentMediaIndex] && (mediaFiles[currentMediaIndex].type === 'video' || isCurrentMediaVideo(mediaFiles[currentMediaIndex].url)) && (
          <ExpandButton 
            onClick={() => setIsVideoExpanded(!isVideoExpanded)}
            aria-label={isVideoExpanded ? "Collapse video" : "Expand video"}
          >
            {isVideoExpanded ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
          </ExpandButton>
        )}
        
        {/* Expand Button for Images */}
        {mediaFiles[currentMediaIndex] && mediaFiles[currentMediaIndex].type === 'image' && (
          <ExpandButton 
            onClick={() => setIsImageExpanded(!isImageExpanded)}
            aria-label={isImageExpanded ? "Collapse image" : "Expand image"}
          >
            {isImageExpanded ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
          </ExpandButton>
        )}
      </MediaContainer>
      <CardOverlay />
      
      {/* Directional overlays */}
      <LikeOverlay style={{ opacity: touchEnd.x > touchStart.x ? swipePercentage : 0 }} />
      <DislikeOverlay style={{ opacity: touchEnd.x < touchStart.x ? swipePercentage : 0 }} />
      
      <InfoButton 
        onClick={toggleDetails}
        aria-label="Show more details"
      >
        <Info fontSize="small" />
      </InfoButton>



      <CardContent>
        <Title>{template.title}</Title>
        
        {showDetails && (
          <>
            <Description className="description-text" $showDetails={showDetails}>
              {template.description}
            </Description>
            
            <UserTrustInfo $show={showDetails}>
              <UserInfoHeader>
                <UserName onClick={handleUserClick}>
                  {template.creator?.name || template.creator?.username || template.createdBy?.name || template.author || 'Anonymous Creator'}
                </UserName>
                <VerifiedBadge>
                  <Verified sx={{ fontSize: '16px' }} />
                </VerifiedBadge>
              </UserInfoHeader>
              <TrustMetrics>
                <TrustMetric>
                  <MetricIcon>
                    <Upload sx={{ fontSize: '14px' }} />
                  </MetricIcon>
                  <span>{template.creator?.templatesCount || template.createdBy?.templatesCount || '12'} Templates</span>
                </TrustMetric>
                <TrustMetric>
                  <MetricIcon>
                    <Download sx={{ fontSize: '14px' }} />
                  </MetricIcon>
                  <span>{template.downloadCount || '2.3k'} Downloads</span>
                </TrustMetric>
                <TrustMetric>
                  <MetricIcon>
                    <Star sx={{ fontSize: '14px' }} />
                  </MetricIcon>
                  <span>{template.creator?.rating || template.createdBy?.rating || '4.9'} Rating</span>
                </TrustMetric>
                <TrustMetric>
                  <MetricIcon>
                    <Favorite sx={{ fontSize: '14px' }} />
                  </MetricIcon>
                  <span>{template.favoriteCount || '156'} Favorites</span>
                </TrustMetric>
              </TrustMetrics>
            </UserTrustInfo>

            <TagsContainer>
              {template.tags.map((tag, index) => (
                <Tag key={index}>{tag}</Tag>
              ))}
            </TagsContainer>
          </>
        )}
        
        <ButtonsContainer>
          {showRemoveButton ? (
            <ActionButton 
              onClick={() => onRemoveFromFavorites && onRemoveFromFavorites()}
              aria-label="Remove from favorites"
              style={{ backgroundColor: 'var(--status-error)', color: 'white' }}
            >
              <Close style={{ fontSize: 28 }} />
            </ActionButton>
          ) : (
            <>
              <ActionButton 
                onClick={handleDislike}
                aria-label="Dislike template"
              >
                <Close style={{ color: "var(--status-error)", fontSize: 28 }} />
              </ActionButton>

              <ActionButton 
                onClick={handleFavoriteClick}
                aria-label="Add to favorites"
              >
                <Star style={{ color: "var(--action-favorite)", fontSize: 28 }} />
              </ActionButton>

              {/* Download/GitHub Button - Show in detailed view */}
              {showDetails && template.githubLink && (
                <ActionButton 
                  onClick={handleDownload}
                  aria-label="View on GitHub"
                  style={{ 
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    color: 'white',
                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
                  }}
                >
                  <GetApp style={{ fontSize: 28 }} />
                </ActionButton>
              )}

              <ActionButton 
                onClick={handleLike}
                aria-label="Like template"
              >
                <Favorite style={{ fontSize: 28 }} />
              </ActionButton>
            </>
          )}
        </ButtonsContainer>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
