import React, { useState, useEffect } from "react";
import styled from "styled-components";
import TemplateCard from "./TemplateCard";
import { templateApi, interactionApi, userApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { CircularProgress, Button } from "@mui/material";
import { Refresh, ErrorOutline } from "@mui/icons-material";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  padding: 16px;
`;

const CardContainer = styled.div`
  width: 100%;
  max-width: 400px;
  height: 600px;
  position: relative;
  margin-bottom: 24px;
`;

const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;
  background-color: var(--background-paper);
  border-radius: var(--borderRadius-large);
  box-shadow: var(--shadows-card);
  width: 100%;
  max-width: 400px;
  min-height: 300px;
`;

const StatusTitle = styled.h3`
  margin: 16px 0 8px;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 20px;
`;

const StatusMessage = styled.p`
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.5;
`;

const StatusIcon = styled.div`
  color: ${props => props.color || 'var(--text-secondary)'};
  font-size: 48px;
  margin-bottom: 16px;
`;

const ActionButton = styled(Button)`
  && {
    background-color: var(--primary-main);
    color: white;
    font-weight: 600;
    padding: 8px 24px;
    border-radius: 8px;
    text-transform: none;
    box-shadow: 0 2px 8px rgba(255, 88, 100, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 88, 100, 0.4);
    }
  }
`;

const ProgressIndicator = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background-color: var(--background-paper);
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const SwipeContainer = () => {
  const [templates, setTemplates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the current user from auth context
  const { currentUser, isAuthenticated } = useAuth();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching templates from API...");

      // Use getAll instead of discover to avoid pagination issues
      const response = await templateApi.getAll();
      console.log("API response:", response);
      
      // If user is authenticated, filter out templates they've already interacted with
      if (isAuthenticated && currentUser) {
        const userId = currentUser._id || currentUser.id;
        console.log('Filtering templates for user:', userId);
        
        try {
          // Get all user interactions
          const userInteractions = await interactionApi.getByUser(userId);
          console.log('User interactions:', userInteractions.data);
          
          // Extract template IDs the user has liked or favorited (exclude disliked to allow re-interaction)
          // Only filter out liked and favorited templates, keep disliked ones
          const excludedTemplateIds = userInteractions.data
            .filter(interaction => interaction.interactionType === 'like' || interaction.interactionType === 'favorite')
            .map(interaction => interaction.template._id || interaction.template);
          console.log('Templates to exclude (liked/favorited):', excludedTemplateIds);
          
          // Filter out only liked and favorited templates, keep disliked ones for re-interaction
          const filteredTemplates = response.data.filter(template => {
            const templateId = template._id;
            const shouldExclude = excludedTemplateIds.some(id => {
              // Handle both string and object IDs
              const excludedId = typeof id === 'object' ? id._id : id;
              const templateIdStr = typeof templateId === 'object' ? templateId._id : templateId;
              return excludedId === templateIdStr;
            });
            return !shouldExclude;
          });
          
          console.log('Filtered templates count:', filteredTemplates.length);
          
          setTemplates(filteredTemplates);
        } catch (interactionErr) {
          console.error("Error fetching user interactions:", interactionErr);
          // If we can't get interactions, just show all templates
          setTemplates(response.data);
        }
      } else {
        // If not authenticated, show all templates
        setTemplates(response.data);
      }
      
      setCurrentIndex(0);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError("Failed to load templates. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Record view interaction when a new template is shown
  useEffect(() => {
    const recordViewInteraction = async () => {
      if (isAuthenticated && currentUser && templates.length > 0 && currentIndex < templates.length) {
        const userId = currentUser._id || currentUser.id;
        const templateId = templates[currentIndex]._id;
        
        try {
          console.log('Recording view interaction for template:', templateId);
          // The API will handle the case if the interaction already exists
          await interactionApi.viewTemplate(userId, templateId);
          
          // Check if we need to update the interaction status
          // This is handled by the API, which will return success even if the interaction already exists
          console.log('View interaction recorded or already existed');
        } catch (err) {
          // Just log the error but don't show to user
          console.error('Error recording view interaction:', err);
        }
      }
    };
    
    recordViewInteraction();
  }, [currentIndex, templates, isAuthenticated, currentUser]);

  const handleSwipe = async (direction, templateId) => {
    if (isAuthenticated && currentUser) {
      console.log('Current user:', currentUser);
      console.log('Template ID:', templateId);
      try {
        // Use currentUser._id if available, otherwise fall back to currentUser.id
        const userId = currentUser._id || currentUser.id;
        console.log('Using user ID for swipe:', userId);
        
        if (direction === "right") {
          await interactionApi.likeTemplate(userId, templateId);
        } else if (direction === "left") {
          await interactionApi.dislikeTemplate(userId, templateId);
        }
        // Move to the next card
        setCurrentIndex((prevIndex) => prevIndex + 1);
      } catch (err) {
        console.error("Error recording swipe interaction:", err);
        // Still move to the next card even if the interaction fails
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }
    } else {
      // Move to the next card if not authenticated
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleFavorite = async (templateId) => {
    if (isAuthenticated && currentUser) {
      console.log('Current user for favorite:', currentUser);
      console.log('Template ID for favorite:', templateId);
      try {
        // Check if currentUser._id exists and use it instead of currentUser.id
        const userId = currentUser._id || currentUser.id;
        console.log('Using user ID:', userId);
        
        // Create the interaction (API now handles the case if it already exists)
        const interactionResult = await interactionApi.favoriteTemplate(userId, templateId);
        console.log('Interaction result:', interactionResult);
        
        // Also create a like interaction for the same template
        await interactionApi.likeTemplate(userId, templateId);
        console.log('Also liked the template');
        
        // Add to user's favorites collection - use the string version of the ID
        // MongoDB ObjectIds are stored as strings in the database
        const userIdStr = userId.toString();
        await interactionApi.favoriteTemplate(userIdStr, templateId);
        console.log('Successfully added to favorites');
        
        // Also add to user's favorites collection
        await userApi.addToFavorites(userIdStr, templateId);
        
        // Move to the next card like a swipe right
        setCurrentIndex((prevIndex) => prevIndex + 1);
      } catch (err) {
        console.error("Error adding to favorites:", err);
        console.error("Error details:", err.response?.data);
        
        // Don't show alert for duplicate interaction errors
        if (err.response?.data?.message !== "Interaction already exists") {
          alert("Failed to add to favorites. Please try again.");
        } else {
          console.log('Interaction already exists, continuing with adding to favorites');
          
          try {
            // Even if the interaction exists, still try to add to favorites
            const userIdStr = (currentUser._id || currentUser.id).toString();
            await interactionApi.favoriteTemplate(userIdStr, templateId);
            console.log('Successfully added to favorites after handling duplicate interaction');
            
            // Also add to user's favorites collection
            await userApi.addToFavorites(userIdStr, templateId);
            
            // Move to the next card like a swipe right
            setCurrentIndex((prevIndex) => prevIndex + 1);
          } catch (favErr) {
            console.error("Error adding to favorites collection:", favErr);
            alert("Failed to add to favorites. Please try again.");
          }
        }
      }
    } else {
      // If not authenticated, show auth modal
      alert("Please sign in to save favorites");
    }
  };

  const handleRefresh = () => {
    fetchTemplates();
  };

  if (loading) {
    return (
      <Container>
        <StatusContainer>
          <CircularProgress size={48} style={{ color: 'var(--primary-main)' }} />
          <StatusTitle>Loading templates</StatusTitle>
          <StatusMessage>Please wait while we find the best templates for you</StatusMessage>
        </StatusContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <StatusContainer>
          <StatusIcon color="var(--status-error)">
            <ErrorOutline style={{ fontSize: 48 }} />
          </StatusIcon>
          <StatusTitle>Something went wrong</StatusTitle>
          <StatusMessage>{error}</StatusMessage>
          <ActionButton onClick={handleRefresh} startIcon={<Refresh />}>
            Try Again
          </ActionButton>
        </StatusContainer>
      </Container>
    );
  }

  if (templates.length === 0 || currentIndex >= templates.length) {
    return (
      <Container>
        <StatusContainer>
          <StatusIcon>
            <img 
              src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" 
              alt="Empty state" 
              style={{ width: 80, height: 80, opacity: 0.7 }}
            />
          </StatusIcon>
          <StatusTitle>No more templates</StatusTitle>
          <StatusMessage>
            You've seen all available templates. Check back later for new content!
          </StatusMessage>
          <ActionButton onClick={handleRefresh} startIcon={<Refresh />}>
            Refresh
          </ActionButton>
        </StatusContainer>
      </Container>
    );
  }

  return (
    <Container>
      <CardContainer>
        {templates.map((template, index) => (
          <TemplateCard
            key={template._id}
            template={template}
            isActive={index === currentIndex}
            handleSwipe={handleSwipe}
            handleFavorite={handleFavorite}
            style={{
              position: "absolute",
              zIndex: templates.length - index,
              transform:
                index === currentIndex
                  ? "scale(1) rotate(0deg)"
                  : index === currentIndex + 1
                  ? "scale(0.95) translateY(-10px) rotate(-1deg)"
                  : index === currentIndex + 2
                  ? "scale(0.9) translateY(-20px) rotate(1deg)"
                  : "scale(0.85) translateY(-30px)",
              opacity:
                index === currentIndex
                  ? 1
                  : index === currentIndex + 1
                  ? 0.8
                  : index === currentIndex + 2
                  ? 0.6
                  : 0,
              pointerEvents: index === currentIndex ? "auto" : "none",
              transition: "transform 0.3s ease, opacity 0.3s ease",
            }}
          />
        ))}
      </CardContainer>
    </Container>
  );
};

export default SwipeContainer;
