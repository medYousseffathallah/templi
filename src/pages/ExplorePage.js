import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { templateApi } from "../services/api";
import { Link } from "react-router-dom";

const ExploreContainer = styled.div`
  padding: 20px;
  margin-left: 80px; /* Space for sidebar */
  max-width: 1200px;
  margin: 0 auto 0 80px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const TemplateCard = styled.div`
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  background-color: white;

  &:hover {
    transform: translateY(-5px);
  }
`;

const TemplateImage = styled.div`
  height: 180px;
  background-image: url(${(props) => props.imageUrl});
  background-size: cover;
  background-position: center;
`;

const TemplateInfo = styled.div`
  padding: 15px;
`;

const TemplateTitle = styled.h3`
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #333;
`;

const TemplateDescription = styled.p`
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const Tag = styled.span`
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #555;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;

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
  padding: 20px;
  color: #e74c3c;
  font-size: 18px;
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
        {templates.map((template) => (
          <TemplateCard key={template._id}>
            <TemplateImage imageUrl={template.imageUrl} />
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
        ))}
      </TemplatesGrid>
    </ExploreContainer>
  );
};

export default ExplorePage;
