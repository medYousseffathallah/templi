import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { templateApi } from "../services/api";
import { Link, useSearchParams } from "react-router-dom";
import FilterPanel from "../components/FilterPanel";
import QuickFilters from "../components/QuickFilters";
import { Pagination, Typography, Box } from "@mui/material";

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
      
      setTemplates(response.data.templates);
      setTotalPages(response.data.totalPages);
      setTotalTemplates(response.data.totalTemplates);
      setCurrentPage(response.data.currentPage);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError("Failed to load templates. Please try again later.");
      setLoading(false);
    }
  }, []);

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
      <TemplateCard key={template._id}>
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
    </ExploreContainer>
  );
};

export default ExplorePage;
