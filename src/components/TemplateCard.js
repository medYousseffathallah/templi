import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Close, Star, Favorite, Info } from "@mui/icons-material";

const Card = styled.div`
  position: relative;
  background-color: var(--background-paper);
  width: 100%;
  max-width: 400px;
  height: 600px;
  border-radius: var(--borderRadius-large);
  background-size: cover;
  background-position: center;
  box-shadow: var(--shadows-card);
  overflow: hidden;
  transition: transform 0.3s ease, filter 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CardOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, 
    rgba(0, 0, 0, 0.1) 0%, 
    rgba(0, 0, 0, 0.3) 70%, 
    rgba(0, 0, 0, 0.7) 100%);
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
  padding: 24px;
  color: white;
  z-index: 2;
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const Description = styled.p`
  color: white;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  max-height: ${(props) => (props.showDetails ? 'none' : '48px')};
  overflow: ${(props) => (props.showDetails ? 'visible' : 'hidden')};
  text-overflow: ellipsis;
`;

const ReadMoreButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-main);
  font-size: 14px;
  font-weight: 600;
  padding: 0;
  margin: -8px 0 16px 0;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--primary-dark);
  }
  
  &:focus {
    outline: none;
    color: var(--primary-dark);
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
`;

const Tag = styled.span`
  background-color: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
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
  background-color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
  
  &:nth-child(3) { /* Like button */
    background-color: var(--primary-main);
    box-shadow: 0 4px 12px rgba(255, 88, 100, 0.3);
    
    &:hover {
      background-color: var(--primary-dark);
      box-shadow: 0 6px 16px rgba(255, 88, 100, 0.4);
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
}) => {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [swipePercentage, setSwipePercentage] = useState(0);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [cardTransform, setCardTransform] = useState({ x: 0, rotate: 0, blur: 0 });
  
  const cardRef = useRef(null);
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 500;
  
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
    }
  }, [isActive]);

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

  // Button handlers
  const handleDislike = () => {
    applySwipeAction("left");
  };

  const handleLike = () => {
    applySwipeAction("right");
  };

  const handleFavoriteClick = () => {
    handleFavorite(template._id);
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

  return (
    <Card
      ref={cardRef}
      style={{
        backgroundImage: `url(${template.imageUrl})`,
        transform: `translateX(${cardTransform.x}px) rotate(${cardTransform.rotate}deg)`,
        filter: `blur(${cardTransform.blur}px)`,
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
      aria-label={`Template: ${template.title}. Use arrow keys to like or dislike.`}
      role="button"
    >
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
        <Description className="description-text" showDetails={showDetails}>
          {showDetails ? template.description : getLimitedDescription(template.description)}
        </Description>
        
        {!showDetails && template.description && template.description.split(' ').length > 15 && (
          <ReadMoreButton onClick={handleReadMore} aria-label="Read full description">
            Read More
          </ReadMoreButton>
        )}

        <TagsContainer>
          {template.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </TagsContainer>
        
        <ButtonsContainer>
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

          <ActionButton 
            onClick={handleLike}
            aria-label="Like template"
          >
            <Favorite style={{ fontSize: 28 }} />
          </ActionButton>
        </ButtonsContainer>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
