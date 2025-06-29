import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { templateApi, interactionApi } from "../services/api";
import { Link, useSearchParams } from "react-router-dom";
import FilterPanel from "../components/FilterPanel";
import QuickFilters from "../components/QuickFilters";
import { Pagination, Typography, Box, Modal, IconButton } from "@mui/material";
import { Close, Star, Favorite, Download, GitHub, ZoomIn, ZoomOut, RestartAlt } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const ExploreContainer = styled.div`
  display: flex;
  gap: 24px;
  padding: 24px;
  margin-left: 240px; /* Space for sidebar */
  margin-top: 64px; /* Space for fixed header */
  max-width: 1400px;
  min-height: calc(100vh - 64px);
  background-color: var(--background-default);
  
  @media (max-width: 768px) {
    flex-direction: column;
    margin-left: 0;
    margin-bottom: 80px;
    padding: 16px;
    margin-top: 64px;
    gap: 16px;
  }
`;

const FilterSidebar = styled.div`
  flex: 0 0 320px;
  
  @media (max-width: 768px) {
    flex: none;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--secondary-main), var(--primary-main));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 16px;
  }
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const ResultsCount = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 20px 0;
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
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
  border: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const ModalContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  background: var(--background-paper);
  border-radius: 20px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  outline: none;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const ModalContent = styled.div`
  padding: 24px;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
`;

const ModalImageContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
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
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-primary);
`;

const ModalDescription = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 20px;
`;

const ModalTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
`;

const ModalTag = styled.span`
  background-color: var(--background-default);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  border: 1px solid rgba(0, 0, 0, 0.06);
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 20px 0;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: linear-gradient(135deg, var(--primary-main), var(--secondary-main));
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 88, 100, 0.3);
    }
  }
  
  &.secondary {
    background: var(--background-default);
    color: var(--text-primary);
    border: 1px solid rgba(0, 0, 0, 0.1);
    
    &:hover {
      background: var(--background-paper);
      transform: translateY(-2px);
    }
  }
`;

const MediaNavigation = styled.div`
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  border-radius: 20px;
`;

const MediaIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: white;
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

const TemplateImage = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'imageUrl',
})`
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

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--secondary-main);
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

const ExplorePage = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [filters, setFilters] = useState({});
  const [debouncedFilters, setDebouncedFilters] = useState({});
  const [initialFiltersSet, setInitialFiltersSet] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Initialize filters from URL parameters
  useEffect(() => {
    if (!initialFiltersSet) {
      const urlSearch = searchParams.get('search');
      const initialFilters = {};
      
      if (urlSearch) {
        initialFilters.searchQuery = urlSearch;
      }
      
      setFilters(initialFilters);
      setDebouncedFilters(initialFilters);
      setInitialFiltersSet(true);
    }
  }, [searchParams, initialFiltersSet]);

  // Debounce filters to avoid too many API calls
  useEffect(() => {
    if (initialFiltersSet) {
      const timer = setTimeout(() => {
        setDebouncedFilters(filters);
        setCurrentPage(1); // Reset to first page when filters change
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [filters, initialFiltersSet]);

  const fetchTemplates = useCallback(async (page = 1, appliedFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await templateApi.discover(page, 12, appliedFilters);
      let templates = response.data.templates;
      
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
          
          // Merge interaction data with templates
          templates = templates.map(template => ({
            ...template,
            isLiked: likedTemplateIds.has(template._id || template.id),
            isFavorited: favoritedTemplateIds.has(template._id || template.id)
          }));
        } catch (interactionErr) {
          console.error("Error fetching user interactions:", interactionErr);
          // Continue without interaction data if fetch fails
        }
      }
      
      setTemplates(templates);
      setTotalPages(response.data.totalPages);
      setTotalTemplates(response.data.totalTemplates);
      setCurrentPage(response.data.currentPage);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError("Failed to load templates. Please try again later.");
      setLoading(false);
    }
  }, [currentUser]);

  // Fetch templates when filters or page changes
  useEffect(() => {
    if (initialFiltersSet) {
      fetchTemplates(currentPage, debouncedFilters);
    }
  }, [fetchTemplates, currentPage, debouncedFilters, initialFiltersSet]);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleQuickFilter = useCallback((quickFilters) => {
    setFilters(prev => ({
      ...prev,
      ...quickFilters
    }));
  }, []);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setCurrentMediaIndex(0);
    setImageZoom(1);
    setIsLiked(template.isLiked || false);
    setIsFavorited(template.isFavorited || false);
    setLikeCount(template.likes || 0);
    setFavoriteCount(template.favorites || 0);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTemplate(null);
    setCurrentMediaIndex(0);
    setImageZoom(1);
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

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.5, 0.5));
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

  const renderTemplateCard = (template) => {
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
        {getPreviewMedia()}
        <TemplateInfo>
          <TemplateTitle>{template.title}</TemplateTitle>
          <TemplateDescription>{template.description}</TemplateDescription>
          <TagsContainer>
            {template.tags.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </TagsContainer>
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

  return (
    <ExploreContainer>
      <FilterSidebar>
        <FilterPanel 
          onFiltersChange={handleFiltersChange} 
          initialFilters={filters}
        />
      </FilterSidebar>
      
      <ContentArea>
        <Title>Discover Templates</Title>
        
        <QuickFilters 
          onQuickFilter={handleQuickFilter}
          activeFilters={filters}
        />
        
        <ResultsHeader>
          <ResultsCount>
            {loading ? 'Loading...' : `${totalTemplates} template${totalTemplates !== 1 ? 's' : ''} found`}
          </ResultsCount>
        </ResultsHeader>

        {loading && <LoadingSpinner />}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {!loading && !error && (
          <>
            {templates.length > 0 ? (
              <>
                <TemplatesGrid>
                  {templates.map(renderTemplateCard)}
                </TemplatesGrid>
                
                {totalPages > 1 && (
                  <PaginationContainer>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="secondary"
                      size="large"
                      showFirstButton
                      showLastButton
                    />
                  </PaginationContainer>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No templates found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your filters or search terms
                </Typography>
              </Box>
            )}
          </>
        )}
      </ContentArea>
      
      {renderModal()}
    </ExploreContainer>
  );
};

export default ExplorePage;
