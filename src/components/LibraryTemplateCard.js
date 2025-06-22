import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { IconButton } from '@mui/material';
import { Favorite, Delete, GitHub, Visibility } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { interactionApi } from '../services/api';

const TemplateCard = styled.div`
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: var(--background-paper);
  border: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const TemplateImage = styled.div`
  height: 200px;
  background-image: url(${(props) => props.imageUrl});
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.1) 100%);
  }
  
  @media (max-width: 768px) {
    height: 180px;
  }
`;

const TemplateVideo = styled.video`
  width: 100%;
  height: 200px;
  object-fit: cover;
  position: relative;
  
  @media (max-width: 768px) {
    height: 180px;
  }
`;

const TemplateInfo = styled.div`
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const TemplateTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const TemplateDescription = styled.p`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const Tag = styled.span`
  background-color: var(--background-default);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--secondary-light);
    color: white;
    transform: translateY(-1px);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const ViewedAt = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
  font-style: italic;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const LibraryTemplateCard = ({ 
  template, 
  onRemoveFromFavorites, 
  viewedAt,
  showRemoveButton = false,
  showGitHubButton = false,
  onDownload
}) => {
  const { currentUser } = useAuth();
  const getPreviewMedia = () => {
    if (template.videoUrl) {
      return (
        <TemplateVideo 
          src={template.videoUrl} 
          muted 
          loop 
          playsInline
          onMouseEnter={(e) => e.target.play()}
          onMouseLeave={(e) => e.target.pause()}
        />
      );
    } else if (template.imageUrls && template.imageUrls.length > 0) {
      return <TemplateImage imageUrl={template.imageUrls[0]} />;
    } else if (template.imageUrl) {
      return <TemplateImage imageUrl={template.imageUrl} />;
    } else {
      return <TemplateImage imageUrl="" />; // Empty placeholder
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleGitHubClick = async (e) => {
    e.stopPropagation();
    if (template.githubLink) {
      // Record download interaction if user is logged in
      if (currentUser) {
        try {
          await interactionApi.downloadTemplate(currentUser, template._id);
          // Refresh download history if callback is provided
          if (onDownload) {
            onDownload();
          }
        } catch (error) {
          console.error('Failed to record download interaction:', error);
          // Don't prevent the download if tracking fails
        }
      }
      window.open(template.githubLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    if (onRemoveFromFavorites) {
      onRemoveFromFavorites();
    }
  };

  return (
    <TemplateCard>
      {getPreviewMedia()}
      <TemplateInfo>
        <TemplateTitle>{template.title}</TemplateTitle>
        <TemplateDescription>{template.description}</TemplateDescription>
        <TagsContainer>
          {template.tags && template.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </TagsContainer>
        <ActionButtons>
          {viewedAt && (
            <ViewedAt>
              <Visibility style={{ fontSize: '14px', marginRight: '4px' }} />
              Viewed {formatDate(viewedAt)}
            </ViewedAt>
          )}
          <ButtonGroup>
            {showGitHubButton && template.githubLink && (
              <IconButton
                onClick={handleGitHubClick}
                style={{ color: 'var(--primary-main)' }}
                title="View on GitHub"
                size="small"
              >
                <GitHub />
              </IconButton>
            )}
            {showRemoveButton && (
              <IconButton
                onClick={handleRemoveClick}
                style={{ color: 'var(--status-error)' }}
                title="Remove from favorites"
                size="small"
              >
                <Delete />
              </IconButton>
            )}
          </ButtonGroup>
        </ActionButtons>
      </TemplateInfo>
    </TemplateCard>
  );
};

export default LibraryTemplateCard;