import React, { useState } from "react";
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
  transition: transform 0.3s ease;
  
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
  margin: 0 0 16px 0;
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
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

const SwipeOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 42px;
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 10;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);

  &.like {
    background-color: rgba(255, 88, 100, 0.2);
    color: var(--primary-main);
    border: 4px solid var(--primary-main);
    border-radius: var(--borderRadius-large);
  }

  &.dislike {
    background-color: rgba(231, 76, 60, 0.2);
    color: var(--status-error);
    border: 4px solid var(--status-error);
    border-radius: var(--borderRadius-large);
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

  // Minimum distance for a swipe to be registered
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd({ x: 0, y: 0 });
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });

    // Calculate horizontal distance
    const horizontalDistance = touchEnd.x - touchStart.x;

    if (Math.abs(horizontalDistance) > minSwipeDistance) {
      setSwiping(true);
      setSwipeDirection(horizontalDistance > 0 ? "like" : "dislike");
    } else {
      setSwiping(false);
      setSwipeDirection(null);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart.x || !touchEnd.x) return;

    const horizontalDistance = touchEnd.x - touchStart.x;
    const verticalDistance = touchEnd.y - touchStart.y;

    // If the horizontal swipe is greater than the vertical and exceeds minimum distance
    if (
      Math.abs(horizontalDistance) > Math.abs(verticalDistance) &&
      Math.abs(horizontalDistance) > minSwipeDistance
    ) {
      const direction = horizontalDistance > 0 ? "right" : "left";
      handleSwipe(direction, template._id);
    }

    // Reset states
    setSwiping(false);
    setSwipeDirection(null);
  };

  const handleDislike = () => {
    handleSwipe("left", template._id);
  };

  const handleLike = () => {
    handleSwipe("right", template._id);
  };

  const handleFavoriteClick = () => {
    handleFavorite(template._id);
  };
  
  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  return (
    <Card
      style={{
        backgroundImage: `url(${template.imageUrl})`,
        ...style,
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <CardOverlay />
      
      <InfoButton onClick={toggleDetails}>
        <Info fontSize="small" />
      </InfoButton>
      
      <SwipeOverlay
        className={swipeDirection}
        style={{ opacity: swiping ? 0.9 : 0 }}
      >
        {swipeDirection === "like" ? "Like" : "Nope"}
      </SwipeOverlay>

      <CardContent>
        <Title>{template.title}</Title>
        <Description style={{ maxHeight: showDetails ? 'none' : '48px' }}>
          {template.description}
        </Description>

        <TagsContainer>
          {template.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </TagsContainer>
        
        <ButtonsContainer>
          <ActionButton onClick={handleDislike}>
            <Close style={{ color: "var(--status-error)", fontSize: 28 }} />
          </ActionButton>

          <ActionButton onClick={handleFavoriteClick}>
            <Star style={{ color: "var(--action-favorite)", fontSize: 28 }} />
          </ActionButton>

          <ActionButton onClick={handleLike}>
            <Favorite style={{ fontSize: 28 }} />
          </ActionButton>
        </ButtonsContainer>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
