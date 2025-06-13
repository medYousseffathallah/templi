import React, { useState, useEffect } from "react";
import styled from "styled-components";
import TemplateCard from "./TemplateCard";
import { templateApi, interactionApi, userApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
`;

const CardContainer = styled.div`
  width: 100%;
  max-width: 400px;
  height: 500px;
  position: relative;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #888;
  font-size: 18px;
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

const SwipeContainer = () => {
  const [templates, setTemplates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the current user from auth context
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    // Fetch templates from API
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        console.log("Fetching templates from API...");
        console.log("API baseURL from component:", templateApi);

        // Try a direct fetch to test the API connection
        try {
          const testResponse = await fetch(
            "http://localhost:5000/api/templates"
          );
          console.log("Direct fetch test response:", testResponse);
          const testData = await testResponse.json();
          console.log("Direct fetch test data:", testData);
        } catch (testErr) {
          console.error("Direct fetch test failed:", testErr);
        }

        // Use getAll instead of discover to avoid pagination issues
        const response = await templateApi.getAll();
        console.log("API response:", response);
        setTemplates(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching templates:", err);
        console.error("Error details:", {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          config: err.config,
        });
        setError("Failed to load templates. Please try again later.");
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSwipe = (direction, templateId) => {
    // Only record interactions if user is authenticated
    if (isAuthenticated && currentUser) {
      if (direction === "right") {
        interactionApi.likeTemplate(currentUser._id, templateId);
      } else if (direction === "left") {
        interactionApi.dislikeTemplate(currentUser._id, templateId);
      }
    }

    // Move to the next card
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleFavorite = (templateId) => {
    if (isAuthenticated && currentUser) {
      interactionApi.favoriteTemplate(currentUser._id, templateId);

      // Also add to user's favorites collection
      userApi.addToFavorites(currentUser._id, templateId);
    } else {
      // If not authenticated, show auth modal
      alert("Please sign in to save favorites");
    }
  };

  // We're now fetching templates from the backend

  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <EmptyMessage>{error}</EmptyMessage>
      </Container>
    );
  }

  if (templates.length === 0 || currentIndex >= templates.length) {
    return (
      <Container>
        <EmptyMessage>
          No more templates to show. Check back later!
        </EmptyMessage>
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
                  ? "scale(1)"
                  : "scale(0.95) translateY(-10px)",
              opacity:
                index === currentIndex
                  ? 1
                  : index === currentIndex + 1
                  ? 0.7
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
