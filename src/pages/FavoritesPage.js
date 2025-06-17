import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { userApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import TemplateCard from "../components/TemplateCard";
import { CircularProgress, Alert } from "@mui/material";
import { Favorite } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const FavoritesContainer = styled.div`
  padding: 24px;
  margin-left: 240px; /* Space for sidebar */
  max-width: 1400px;
  min-height: calc(100vh - 64px);
  background-color: var(--background-default);
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-bottom: 80px;
    padding: 16px;
    margin-top: 64px;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-weight: 700;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 32px;
  line-height: 1.5;
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 28px;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  background-color: var(--background-paper);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 40px;
`;

const EmptyStateTitle = styled.h2`
  font-size: 28px;
  margin-bottom: 16px;
  color: var(--text-primary);
  font-weight: 600;
`;

const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.5;
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  max-width: 480px;
  margin: 0 auto 24px;
  color: var(--text-secondary);
`;

const ExploreButton = styled.button`
  background-color: var(--primary-main);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--primary-dark);
    transform: translateY(-1px);
  }
`;

const ErrorContainer = styled.div`
  margin: 20px 0;
`;

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get user ID - handle both object and string formats
        const userId = currentUser._id || currentUser.id || currentUser;
        
        const response = await userApi.getFavorites(userId);
        setFavorites(response.data || []);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError(err.response?.data?.message || 'Failed to load favorite templates');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [currentUser]);

  const handleRemoveFromFavorites = async (templateId) => {
    try {
      const userId = currentUser._id || currentUser.id || currentUser;
      await userApi.removeFromFavorites(userId, templateId);
      
      // Remove the template from the local state
      setFavorites(prev => prev.filter(template => 
        (template._id || template.id) !== templateId
      ));
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError('Failed to remove template from favorites');
    }
  };

  if (!currentUser) {
    return (
      <FavoritesContainer>
        <Title>My Favorites</Title>
        <Subtitle>Your saved templates will appear here</Subtitle>
        <ErrorContainer>
          <Alert severity="warning">
            Please log in to view your favorite templates.
          </Alert>
        </ErrorContainer>
      </FavoritesContainer>
    );
  }

  if (loading) {
    return (
      <FavoritesContainer>
        <Title>My Favorites</Title>
        <Subtitle>Loading your saved templates...</Subtitle>
        <LoadingContainer>
          <CircularProgress size={40} style={{ color: 'var(--primary-main)' }} />
        </LoadingContainer>
      </FavoritesContainer>
    );
  }

  if (error) {
    return (
      <FavoritesContainer>
        <Title>My Favorites</Title>
        <Subtitle>Something went wrong</Subtitle>
        <ErrorContainer>
          <Alert severity="error">
            {error}
          </Alert>
        </ErrorContainer>
      </FavoritesContainer>
    );
  }

  if (favorites.length === 0) {
    return (
      <FavoritesContainer>
        <Title>My Favorites</Title>
        <Subtitle>Your saved templates will appear here</Subtitle>
        <EmptyState>
          <EmptyStateIcon>
            <Favorite style={{ fontSize: 'inherit', color: 'var(--primary-main)' }} />
          </EmptyStateIcon>
          <EmptyStateTitle>No Favorite Templates Yet</EmptyStateTitle>
          <EmptyStateText>
            Start exploring templates and add them to your favorites by clicking the star icon.
            Your favorite templates will appear here for easy access and quick reference.
          </EmptyStateText>
          <ExploreButton onClick={() => navigate('/explore')}>
            Explore Templates
          </ExploreButton>
        </EmptyState>
      </FavoritesContainer>
    );
  }

  return (
    <FavoritesContainer>
      <Title>My Favorites</Title>
      <Subtitle>
        {favorites.length === 1 
          ? '1 saved template' 
          : `${favorites.length} saved templates`
        }
      </Subtitle>
      <TemplatesGrid>
        {favorites.map((template) => (
          <TemplateCard
            key={template._id || template.id}
            template={template}
            onRemoveFromFavorites={() => handleRemoveFromFavorites(template._id || template.id)}
            showRemoveButton={true}
          />
        ))}
      </TemplatesGrid>
    </FavoritesContainer>
  );
}

export default FavoritesPage;