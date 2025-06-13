import React, { useState } from "react";
import styled from "styled-components";
import { Close, Star, Favorite } from "@mui/icons-material";

const Card = styled.div`
  position: relative;
  background-color: #fff;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const CardContent = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
`;

const Title = styled.h2`
  margin: 0 0 5px 0;
  font-size: 24px;
`;

const Description = styled.p`
  margin: 0 0 10px 0;
  font-size: 16px;
  opacity: 0.9;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
`;

const Tag = styled.span`
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 12px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 10px;
  position: absolute;
  bottom: 20px;
`;

const ActionButton = styled.button`
  background-color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
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
  font-size: 32px;
  font-weight: bold;
  text-transform: uppercase;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 10;

  &.like {
    background-color: rgba(0, 200, 0, 0.2);
    color: #00c800;
  }

  &.dislike {
    background-color: rgba(255, 0, 0, 0.2);
    color: #ff0000;
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
      <SwipeOverlay
        className={swipeDirection}
        style={{ opacity: swiping ? 0.8 : 0 }}
      >
        {swipeDirection === "like" ? "Like" : "Nope"}
      </SwipeOverlay>

      <CardContent>
        <Title>{template.title}</Title>
        <Description>{template.description}</Description>

        <TagsContainer>
          {template.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </TagsContainer>
      </CardContent>

      <ButtonsContainer>
        <ActionButton onClick={handleDislike}>
          <Close style={{ color: "#ff6b6b" }} />
        </ActionButton>

        <ActionButton onClick={handleFavoriteClick}>
          <Star style={{ color: "#ffd166" }} />
        </ActionButton>

        <ActionButton onClick={handleLike}>
          <Favorite style={{ color: "#06d6a0" }} />
        </ActionButton>
      </ButtonsContainer>
    </Card>
  );
};

export default TemplateCard;
