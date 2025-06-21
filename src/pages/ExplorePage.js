import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { templateApi } from "../services/api";
import { Link } from "react-router-dom";

const ExploreContainer = styled.div`
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
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentTemplates = async () => {
      try {
        setLoading(true);
        // Fetch all templates and sort by creation date (newest first)
        const response = await templateApi.getAll();
        setTemplates(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching templates:", err);
        setError("Failed to load templates. Please try again later.");
        setLoading(false);
      }
    };

    fetchRecentTemplates();
  }, []);

  if (loading) {
    return (
      <ExploreContainer>
        <Title>Recently Added Templates</Title>
        <LoadingSpinner />
      </ExploreContainer>
    );
  }

  if (error) {
    return (
      <ExploreContainer>
        <Title>Recently Added Templates</Title>
        <ErrorMessage>{error}</ErrorMessage>
      </ExploreContainer>
    );
  }

  return (
    <ExploreContainer>
      <Title>Recently Added Templates</Title>
      <TemplatesGrid>
        {templates.map((template) => {
          // Determine what media to show - prioritize video, then first image from imageUrls, then fallback to imageUrl
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
        })}
      </TemplatesGrid>
    </ExploreContainer>
  );
};

export default ExplorePage;
