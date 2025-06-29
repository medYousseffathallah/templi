import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Modal, IconButton, Typography } from '@mui/material';
import { Close, Star, Favorite, GitHub, ZoomIn, ZoomOut, RestartAlt } from '@mui/icons-material';
import { templateApi, interactionApi } from "../services/api";
import { useAuth } from '../context/AuthContext';

const TrendingContainer = styled.div`
  padding: 24px;
  margin-left: 240px; /* Space for sidebar */
  margin-top: 64px; /* Space for fixed header */
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
  font-weight: 700;
  margin-bottom: 32px;
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--primary-main), var(--secondary-main));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 48px 0 24px 0;
  color: var(--text-primary);
  position: relative;
  padding-bottom: 12px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-main), var(--secondary-main));
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin: 32px 0 20px 0;
  }
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const TemplateCard = styled.div`
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: var(--background-paper);
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const TemplateImage = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'imageUrl',
})`
  width: 100%;
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
    background-color: var(--primary-light);
    color: white;
    transform: translateY(-1px);
  }
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  font-size: 14px;
  color: var(--text-secondary);
  flex: 1;
  
  .main-stat {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
    color: var(--text-primary);
  }
  
  .weekly-stat {
    font-size: 12px;
    color: var(--primary-main);
    font-weight: 600;
    background-color: rgba(255, 88, 100, 0.1);
    padding: 2px 8px;
    border-radius: 12px;
  }
`;

const TrendingBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, var(--primary-main), var(--secondary-main));
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  box-shadow: 0 4px 12px rgba(255, 88, 100, 0.3);
  z-index: 2;
  letter-spacing: 0.5px;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--primary-main);
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  margin: 40px auto;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--status-error);
  font-size: 18px;
  font-weight: 500;
  background-color: rgba(231, 76, 60, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(231, 76, 60, 0.1);
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 16px;
  background-color: var(--background-paper);
  border-radius: 16px;
  border: 2px dashed rgba(0, 0, 0, 0.1);
  
  &::before {
    content: '📊';
    display: block;
    font-size: 48px;
    margin-bottom: 16px;
  }
`;

// Modal Styled Components
const ModalContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  outline: none;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
`;

const ModalContent = styled.div`
  padding: 1.5rem;
  max-height: calc(90vh - 80px);
  overflow-y: auto;
`;

const ModalImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  margin-bottom: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
`;

const ModalImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ModalVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const ModalDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const ModalTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const ModalTag = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: #1976d2;
    color: white;
    
    &:hover {
      background: #1565c0;
    }
  }
  
  &.secondary {
    background: #f5f5f5;
    color: #333;
    
    &:hover {
      background: #e0e0e0;
    }
  }
`;

const MediaNavigation = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
`;

const MediaIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$active ? '#1976d2' : 'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? '#1976d2' : 'rgba(255, 255, 255, 0.8)'};
  }
`;

const ZoomControls = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px;
  border-radius: 8px;
  z-index: 10;
`;

const ZoomButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ZoomableImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$zoom > 1 ? 'contain' : 'cover'};
  transform: scale(${props => props.$zoom});
  transition: transform 0.3s ease;
  cursor: ${props => props.$zoom > 1 ? 'grab' : 'default'};
  
  &:active {
    cursor: ${props => props.$zoom > 1 ? 'grabbing' : 'default'};
  }
`;

const TrendingPage = () => {
  const { currentUser } = useAuth();
  const [mostLiked, setMostLiked] = useState([]);
  const [mostFavorited, setMostFavorited] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    const fetchTrendingTemplates = async () => {
      try {
        setLoading(true);
        
        // Fetch most liked templates of the week
        const likedResponse = await templateApi.getTrending('like');
        let mostLikedTemplates = likedResponse.data;
        
        // Fetch most favorited templates of the week
        const favoritedResponse = await templateApi.getTrending('favorite');
        let mostFavoritedTemplates = favoritedResponse.data;
        
        // If user is logged in, fetch their interactions and merge with template data
        if (currentUser) {
          try {
            const userId = currentUser._id || currentUser.id;
            const [likesResponse, favoritesResponse] = await Promise.all([
              interactionApi.getUserInteractions(userId, 'like'),
              interactionApi.getUserInteractions(userId, 'favorite')
            ]);
            
            const likedTemplateIds = new Set(
               (likesResponse.data || []).map(interaction => 
                 interaction.template._id || interaction.template.id || interaction.template
               )
             );
             
             const favoritedTemplateIds = new Set(
               (favoritesResponse.data || []).map(interaction => 
                 interaction.template._id || interaction.template.id || interaction.template
               )
             );
            
            // Merge interaction data with most liked templates
            mostLikedTemplates = mostLikedTemplates.map(template => ({
              ...template,
              isLiked: likedTemplateIds.has(template._id || template.id),
              isFavorited: favoritedTemplateIds.has(template._id || template.id)
            }));
            
            // Merge interaction data with most favorited templates
            mostFavoritedTemplates = mostFavoritedTemplates.map(template => ({
              ...template,
              isLiked: likedTemplateIds.has(template._id || template.id),
              isFavorited: favoritedTemplateIds.has(template._id || template.id)
            }));
          } catch (interactionErr) {
            console.error("Error fetching user interactions:", interactionErr);
            // Continue without interaction data if fetch fails
          }
        }
        
        setMostLiked(mostLikedTemplates);
        setMostFavorited(mostFavoritedTemplates);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching trending templates:", err);
        setError("Failed to load trending templates. Please try again later.");
        setLoading(false);
      }
    };

    fetchTrendingTemplates();
  }, [currentUser]);

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setCurrentMediaIndex(0);
    setImageZoom(1);
    setIsLiked(template.isLiked || false);
    setIsFavorited(template.isFavorited || false);
    setLikeCount(template.likeCount || 0);
    setFavoriteCount(template.favoriteCount || 0);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTemplate(null);
    setCurrentMediaIndex(0);
    setImageZoom(1);
  };

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setImageZoom(1);
  };

  const handleLike = async () => {
    if (!currentUser || !selectedTemplate) return;
    
    try {
      const response = await interactionApi.likeTemplate(currentUser.id || currentUser._id, selectedTemplate._id || selectedTemplate.id);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking template:', error);
    }
  };

  const handleFavorite = async () => {
    if (!currentUser || !selectedTemplate) return;
    
    try {
      const response = await interactionApi.favoriteTemplate(currentUser.id || currentUser._id, selectedTemplate._id || selectedTemplate.id);
      setIsFavorited(!isFavorited);
      setFavoriteCount(prev => isFavorited ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error favoriting template:', error);
    }
  };

  const getTemplateMedia = (template) => {
    const media = [];
    if (template.videoUrl) {
      media.push({ type: 'video', url: template.videoUrl });
    }
    if (template.imageUrls && template.imageUrls.length > 0) {
      template.imageUrls.forEach(url => media.push({ type: 'image', url }));
    } else if (template.imageUrl) {
      media.push({ type: 'image', url: template.imageUrl });
    }
    return media;
  };

  const handleMediaNavigation = (index) => {
    setCurrentMediaIndex(index);
  };

  const handleDownload = () => {
    if (selectedTemplate?.githubLink) {
      window.open(selectedTemplate.githubLink, '_blank', 'noopener,noreferrer');
    }
  };

  const renderTemplateCard = (template, rank) => {
    // Determine what media to show - prioritize video, then first image from imageUrls, then fallback to imageUrl
    const getPreviewMedia = () => {
      if (template.videoUrl) {
        return (
          <TemplateVideo 
            src={template.videoUrl} 
            muted 
            loop 
            playsInline
            onMouseEnter={(e) => {
              e.target.play().catch(() => {
                // Silently handle play errors (common when video is being removed/added)
              });
            }}
            onMouseLeave={(e) => {
              try {
                e.target.pause();
              } catch (error) {
                // Silently handle pause errors
              }
            }}
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

    return (
      <TemplateCard key={template._id} onClick={() => handleTemplateClick(template)}>
        <TrendingBadge>#{rank}</TrendingBadge>
        {getPreviewMedia()}
      <TemplateInfo>
        <TemplateTitle>{template.title}</TemplateTitle>
        <TemplateDescription>{template.description}</TemplateDescription>
        <TagsContainer>
          {template.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </TagsContainer>
        <StatsContainer>
          <StatItem>
            <div className="main-stat">
              ❤️ {template.likeCount || 0} total likes
            </div>
            {template.weeklyLikeCount > 0 && (
              <div className="weekly-stat">
                +{template.weeklyLikeCount} this week
              </div>
            )}
          </StatItem>
          <StatItem>
            <div className="main-stat">
              ⭐ {template.favoriteCount || 0} total favorites
            </div>
            {template.weeklyFavoriteCount > 0 && (
              <div className="weekly-stat">
                +{template.weeklyFavoriteCount} this week
              </div>
            )}
          </StatItem>
        </StatsContainer>
      </TemplateInfo>
    </TemplateCard>
    );
  };

  const renderModal = () => {
    if (!selectedTemplate) return null;

    const mediaFiles = getTemplateMedia(selectedTemplate);
    const currentMedia = mediaFiles[currentMediaIndex];

    return (
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <ModalContainer>
          <ModalHeader>
            <Typography variant="h6" component="h2">
              Template Details
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <Close />
            </IconButton>
          </ModalHeader>
          
          <ModalContent>
            {currentMedia && (
              <ModalImageContainer>
                {currentMedia.type === 'video' ? (
                  <ModalVideo 
                    src={currentMedia.url} 
                    controls 
                    muted 
                    loop 
                    playsInline
                  />
                ) : (
                  <>
                    <ZoomableImage 
                      src={currentMedia.url} 
                      alt={selectedTemplate.title}
                      $zoom={imageZoom}
                    />
                    <ZoomControls>
                      <ZoomButton 
                        onClick={handleZoomOut}
                        disabled={imageZoom <= 0.5}
                        title="Zoom Out"
                      >
                        <ZoomOut fontSize="small" />
                      </ZoomButton>
                      <ZoomButton 
                        onClick={handleZoomReset}
                        title="Reset Zoom"
                      >
                        <RestartAlt fontSize="small" />
                      </ZoomButton>
                      <ZoomButton 
                        onClick={handleZoomIn}
                        disabled={imageZoom >= 3}
                        title="Zoom In"
                      >
                        <ZoomIn fontSize="small" />
                      </ZoomButton>
                    </ZoomControls>
                  </>
                )}
                
                {mediaFiles.length > 1 && (
                  <MediaNavigation>
                    {mediaFiles.map((_, index) => (
                      <MediaIndicator
                        key={index}
                        $active={index === currentMediaIndex}
                        onClick={() => handleMediaNavigation(index)}
                      />
                    ))}
                  </MediaNavigation>
                )}
              </ModalImageContainer>
            )}
            
            <ModalTitle>{selectedTemplate.title}</ModalTitle>
            <ModalDescription>{selectedTemplate.description}</ModalDescription>
            
            <ModalTagsContainer>
              {selectedTemplate.tags.map((tag, index) => (
                <ModalTag key={index}>{tag}</ModalTag>
              ))}
            </ModalTagsContainer>
            
            <ModalActions>
              <ActionButton 
                className={isFavorited ? "primary" : "secondary"}
                onClick={handleFavorite}
                disabled={!currentUser}
              >
                <Star /> {isFavorited ? 'Favorited' : 'Add to Favorites'} ({favoriteCount})
              </ActionButton>
              
              {selectedTemplate.githubLink && (
                <ActionButton className="primary" onClick={handleDownload}>
                  <GitHub /> View on GitHub
                </ActionButton>
              )}
              
              <ActionButton 
                className={isLiked ? "primary" : "secondary"}
                onClick={handleLike}
                disabled={!currentUser}
              >
                <Favorite /> {isLiked ? 'Liked' : 'Like'} ({likeCount})
              </ActionButton>
            </ModalActions>
          </ModalContent>
        </ModalContainer>
      </Modal>
    );
  };

  if (loading) {
    return (
      <TrendingContainer>
        <Title>Trending Templates</Title>
        <LoadingSpinner />
      </TrendingContainer>
    );
  }

  if (error) {
    return (
      <TrendingContainer>
        <Title>Trending Templates</Title>
        <ErrorMessage>{error}</ErrorMessage>
      </TrendingContainer>
    );
  }

  return (
    <TrendingContainer>
      <Title>Trending Templates</Title>
      
      <SectionTitle>Most Liked This Week</SectionTitle>
      {mostLiked.length > 0 ? (
        <TemplatesGrid>
          {mostLiked.map((template, index) => renderTemplateCard(template, index + 1))}
        </TemplatesGrid>
      ) : (
        <EmptyMessage>No liked templates this week yet.</EmptyMessage>
      )}
      
      <SectionTitle>Most Favorited This Week</SectionTitle>
      {mostFavorited.length > 0 ? (
        <TemplatesGrid>
          {mostFavorited.map((template, index) => renderTemplateCard(template, index + 1))}
        </TemplatesGrid>
      ) : (
        <EmptyMessage>No favorited templates this week yet.</EmptyMessage>
      )}
      
      {renderModal()}
    </TrendingContainer>
  );
};

export default TrendingPage;