import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { templateApi } from "../services/api";

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

const TrendingPage = () => {
  const [mostLiked, setMostLiked] = useState([]);
  const [mostFavorited, setMostFavorited] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingTemplates = async () => {
      try {
        setLoading(true);
        
        // Fetch most liked templates of the week
        const likedResponse = await templateApi.getTrending('like');
        setMostLiked(likedResponse.data);
        
        // Fetch most favorited templates of the week
        const favoritedResponse = await templateApi.getTrending('favorite');
        setMostFavorited(favoritedResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching trending templates:", err);
        setError("Failed to load trending templates. Please try again later.");
        setLoading(false);
      }
    };

    fetchTrendingTemplates();
  }, []);

  const renderTemplateCard = (template, rank) => (
    <TemplateCard key={template._id}>
      <TrendingBadge>#{rank}</TrendingBadge>
      <TemplateImage imageUrl={template.imageUrl} />
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
    </TrendingContainer>
  );
};

export default TrendingPage;