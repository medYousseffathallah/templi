import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { userApi, interactionApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LibraryTemplateCard from "../components/LibraryTemplateCard";
import { 
  CircularProgress, 
  Alert, 
  Tabs, 
  Tab, 
  Box, 
  Typography,
  Chip,
  IconButton
} from "@mui/material";
import { 
  History, 
  Download, 
  Favorite, 
  Visibility,
  Delete,
  GitHub
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const LibraryContainer = styled.div`
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
  background: linear-gradient(135deg, var(--secondary-main), var(--primary-main));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 24px;
  }
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 30px;
`;

const TabsContainer = styled(Box)`
  margin-bottom: 30px;
  border-bottom: 1px solid var(--border-color);
  
  .MuiTabs-root {
    min-height: 48px;
  }
  
  .MuiTab-root {
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: none;
    font-size: 1rem;
    min-height: 48px;
    
    &.Mui-selected {
      color: var(--primary-main);
    }
  }
  
  .MuiTabs-indicator {
    background-color: var(--primary-main);
  }
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const EmptyStateTitle = styled.h3`
  color: var(--text-primary);
  font-size: 1.5rem;
  margin-bottom: 10px;
`;

const EmptyStateText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

const ErrorContainer = styled.div`
  margin: 20px 0;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatsChip = styled(Chip)`
  background: var(--background-secondary) !important;
  color: var(--text-secondary) !important;
  font-size: 0.875rem !important;
`;

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: var(--background-secondary);
  border-radius: 12px;
  margin-bottom: 10px;
  border: 1px solid var(--border-color);
`;

const HistoryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
`;

const HistoryText = styled.div`
  h4 {
    color: var(--text-primary);
    margin: 0 0 5px 0;
    font-size: 1rem;
    font-weight: 500;
  }
  
  p {
    color: var(--text-secondary);
    margin: 0;
    font-size: 0.875rem;
  }
`;

const HistoryActions = styled.div`
  display: flex;
  gap: 10px;
`;

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`library-tabpanel-${index}`}
      aria-labelledby={`library-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

function LibraryPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLibraryData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const userId = currentUser._id || currentUser.id || currentUser;
        
        // Fetch all library data in parallel
        const [favoritesResponse, viewsResponse, downloadsResponse] = await Promise.all([
          userApi.getFavorites(userId),
          interactionApi.getUserInteractions(userId, 'view'),
          interactionApi.getUserInteractions(userId, 'download')
        ]);
        
        setFavorites(favoritesResponse.data || []);
        setRecentlyViewed(viewsResponse.data || []);
        setDownloadHistory(downloadsResponse.data || []);
        
      } catch (err) {
        console.error('Error fetching library data:', err);
        setError(err.response?.data?.message || 'Failed to load library data');
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryData();
  }, [currentUser]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRemoveFromFavorites = async (templateId) => {
    try {
      const userId = currentUser._id || currentUser.id || currentUser;
      await userApi.removeFromFavorites(userId, templateId);
      
      setFavorites(prev => prev.filter(template => 
        (template._id || template.id) !== templateId
      ));
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError('Failed to remove template from favorites');
    }
  };

  const handleOpenGitHub = (githubLink) => {
    if (githubLink) {
      window.open(githubLink, '_blank', 'noopener,noreferrer');
    }
  };

  const refreshDownloadHistory = async () => {
    if (!currentUser) return;
    
    try {
      const userId = currentUser._id || currentUser.id || currentUser;
      const downloadsResponse = await interactionApi.getUserInteractions(userId, 'download');
      setDownloadHistory(downloadsResponse.data || []);
    } catch (err) {
      console.error('Error refreshing download history:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (!currentUser) {
    return (
      <LibraryContainer>
        <Title>My Library</Title>
        <Subtitle>Your personal template collection</Subtitle>
        <EmptyState>
          <EmptyStateTitle>Please log in to view your library</EmptyStateTitle>
        </EmptyState>
      </LibraryContainer>
    );
  }

  if (loading) {
    return (
      <LibraryContainer>
        <Title>My Library</Title>
        <Subtitle>Loading your template collection...</Subtitle>
        <LoadingContainer>
          <CircularProgress size={40} style={{ color: 'var(--primary-main)' }} />
        </LoadingContainer>
      </LibraryContainer>
    );
  }

  return (
    <LibraryContainer>
      <Title>My Library</Title>
      
      {error && (
        <ErrorContainer>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </ErrorContainer>
      )}

      <TabsContainer>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="library tabs">
          <Tab 
            icon={<Favorite />} 
            label={`Favorites (${favorites.length})`} 
            iconPosition="start"
          />
          <Tab 
            icon={<Visibility />} 
            label={`Recently Viewed (${recentlyViewed.length})`} 
            iconPosition="start"
          />
          <Tab 
            icon={<Download />} 
            label={`Downloads (${downloadHistory.length})`} 
            iconPosition="start"
          />
        </Tabs>
      </TabsContainer>

      {/* Favorites Tab */}
      <TabPanel value={activeTab} index={0}>
        {favorites.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>
              <Favorite style={{ fontSize: 'inherit', color: 'var(--primary-main)' }} />
            </EmptyStateIcon>
            <EmptyStateTitle>No Favorite Templates Yet</EmptyStateTitle>
            <EmptyStateText>
              Start exploring templates and add them to your favorites by clicking the star icon.
              Your favorite templates will appear here for easy access.
            </EmptyStateText>
          </EmptyState>
        ) : (
          <>
            <SectionHeader>
              <SectionTitle>
                <Favorite /> Favorite Templates
              </SectionTitle>
              <StatsChip label={`${favorites.length} templates`} />
            </SectionHeader>
            <TemplatesGrid>
              {favorites.map((template) => (
                <LibraryTemplateCard
                  key={template._id || template.id}
                  template={template}
                  showRemoveButton={true}
                  showGitHubButton={true}
                  onRemoveFromFavorites={() => handleRemoveFromFavorites(template._id || template.id)}
                  onDownload={refreshDownloadHistory}
                />
              ))}
            </TemplatesGrid>
          </>
        )}
      </TabPanel>

      {/* Recently Viewed Tab */}
      <TabPanel value={activeTab} index={1}>
        {recentlyViewed.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>
              <History style={{ fontSize: 'inherit', color: 'var(--primary-main)' }} />
            </EmptyStateIcon>
            <EmptyStateTitle>No Recently Viewed Templates</EmptyStateTitle>
            <EmptyStateText>
              Templates you view will appear here, making it easy to find templates you looked at before.
            </EmptyStateText>
          </EmptyState>
        ) : (
          <>
            <SectionHeader>
              <SectionTitle>
                <History /> Recently Viewed
              </SectionTitle>
              <StatsChip label={`${recentlyViewed.length} views`} />
            </SectionHeader>
            <TemplatesGrid>
              {recentlyViewed.map((interaction) => (
                <LibraryTemplateCard
                  key={`${interaction._id}-${interaction.createdAt}`}
                  template={interaction.template}
                  showGitHubButton={true}
                  viewedAt={interaction.createdAt}
                  onDownload={refreshDownloadHistory}
                />
              ))}
            </TemplatesGrid>
          </>
        )}
      </TabPanel>

      {/* Download History Tab */}
      <TabPanel value={activeTab} index={2}>
        {downloadHistory.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>
              <Download style={{ fontSize: 'inherit', color: 'var(--primary-main)' }} />
            </EmptyStateIcon>
            <EmptyStateTitle>No Download History</EmptyStateTitle>
            <EmptyStateText>
              Templates you download (view on GitHub) will appear here for quick access to repositories.
            </EmptyStateText>
          </EmptyState>
        ) : (
          <>
            <SectionHeader>
              <SectionTitle>
                <Download /> Download History
              </SectionTitle>
              <StatsChip label={`${downloadHistory.length} downloads`} />
            </SectionHeader>
            <TemplatesGrid>
              {downloadHistory.map((interaction) => (
                <LibraryTemplateCard
                  key={`${interaction._id}-${interaction.createdAt}`}
                  template={interaction.template}
                  showGitHubButton={true}
                  viewedAt={interaction.createdAt}
                  onDownload={refreshDownloadHistory}
                />
              ))}
            </TemplatesGrid>
          </>
        )}
      </TabPanel>
    </LibraryContainer>
  );
}

export default LibraryPage;