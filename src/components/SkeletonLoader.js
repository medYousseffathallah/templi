import React from 'react';
import styled, { keyframes, css } from 'styled-components';

// Animations
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const wave = keyframes`
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

// Base skeleton component
const SkeletonBase = styled.div`
  background: ${props => props.theme.colors?.gray?.[200] || '#e5e7eb'};
  border-radius: ${props => props.borderRadius || '8px'};
  position: relative;
  overflow: hidden;
  
  ${props => props.animation === 'shimmer' && css`
    background: linear-gradient(
      90deg,
      ${props.theme.colors?.gray?.[200] || '#e5e7eb'} 0%,
      ${props.theme.colors?.gray?.[300] || '#d1d5db'} 50%,
      ${props.theme.colors?.gray?.[200] || '#e5e7eb'} 100%
    );
    background-size: 200px 100%;
    animation: ${shimmer} 1.5s infinite;
  `}
  
  ${props => props.animation === 'pulse' && css`
    animation: ${pulse} 2s infinite;
  `}
  
  ${props => props.animation === 'wave' && css`
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.6),
        transparent
      );
      animation: ${wave} 1.6s infinite;
    }
  `}
`;

// Skeleton components
export const SkeletonBox = styled(SkeletonBase)`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '20px'};
`;

export const SkeletonText = styled(SkeletonBase)`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '16px'};
  border-radius: 4px;
`;

export const SkeletonCircle = styled(SkeletonBase)`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border-radius: 50%;
`;

export const SkeletonImage = styled(SkeletonBase)`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '200px'};
  border-radius: ${props => props.borderRadius || '12px'};
`;

// Template Card Skeleton
const TemplateCardSkeletonContainer = styled.div`
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  width: 100%;
  max-width: 400px;
  height: 600px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SkeletonMediaArea = styled(SkeletonBase)`
  width: 100%;
  height: 300px;
  border-radius: 16px;
  margin-bottom: 16px;
`;

const SkeletonContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SkeletonActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 16px;
`;

const SkeletonButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

export const TemplateCardSkeleton = ({ animation = 'shimmer' }) => {
  return (
    <TemplateCardSkeletonContainer>
      <SkeletonMediaArea animation={animation} />
      
      <SkeletonContent>
        <SkeletonText width="80%" height="24px" animation={animation} />
        <SkeletonText width="60%" height="16px" animation={animation} />
        <SkeletonText width="90%" height="14px" animation={animation} />
        <SkeletonText width="70%" height="14px" animation={animation} />
        
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <SkeletonText width="60px" height="20px" borderRadius="12px" animation={animation} />
          <SkeletonText width="80px" height="20px" borderRadius="12px" animation={animation} />
          <SkeletonText width="50px" height="20px" borderRadius="12px" animation={animation} />
        </div>
      </SkeletonContent>
      
      <SkeletonActions>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SkeletonCircle size="32px" animation={animation} />
          <SkeletonText width="80px" height="16px" animation={animation} />
        </div>
        
        <SkeletonButtonGroup>
          <SkeletonCircle size="40px" animation={animation} />
          <SkeletonCircle size="40px" animation={animation} />
          <SkeletonCircle size="40px" animation={animation} />
        </SkeletonButtonGroup>
      </SkeletonActions>
    </TemplateCardSkeletonContainer>
  );
};

// Grid Skeleton
const SkeletonGridContainer = styled.div`
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

export const TemplateGridSkeleton = ({ count = 6, animation = 'shimmer' }) => {
  return (
    <SkeletonGridContainer>
      {Array.from({ length: count }, (_, index) => (
        <TemplateCardSkeleton key={index} animation={animation} />
      ))}
    </SkeletonGridContainer>
  );
};

// List Skeleton
const SkeletonListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SkeletonListItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const SkeletonListContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TemplateListSkeleton = ({ count = 5, animation = 'shimmer' }) => {
  return (
    <SkeletonListContainer>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonListItem key={index}>
          <SkeletonImage width="120px" height="80px" animation={animation} />
          <SkeletonListContent>
            <SkeletonText width="70%" height="20px" animation={animation} />
            <SkeletonText width="50%" height="16px" animation={animation} />
            <SkeletonText width="90%" height="14px" animation={animation} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <SkeletonText width="60px" height="18px" borderRadius="12px" animation={animation} />
              <SkeletonText width="80px" height="18px" borderRadius="12px" animation={animation} />
            </div>
          </SkeletonListContent>
        </SkeletonListItem>
      ))}
    </SkeletonListContainer>
  );
};

// Loading States
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${props => props.theme.colors?.gray?.[200] || '#e5e7eb'};
  border-top: 3px solid ${props => props.theme.colors?.primary?.main || '#3b82f6'};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: ${props => props.theme.colors?.gray?.[600] || '#6b7280'};
  font-size: 16px;
  margin: 0;
`;

const LoadingSubtext = styled.p`
  color: ${props => props.theme.colors?.gray?.[500] || '#9ca3af'};
  font-size: 14px;
  margin: 0;
`;

export const LoadingState = ({ 
  message = 'Loading templates...', 
  subtext = 'This may take a few moments',
  showSpinner = true 
}) => {
  return (
    <LoadingContainer>
      {showSpinner && <LoadingSpinner />}
      <LoadingText>{message}</LoadingText>
      {subtext && <LoadingSubtext>{subtext}</LoadingSubtext>}
    </LoadingContainer>
  );
};

// Progressive Loading Component
const ProgressiveContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: ${props => props.theme.colors?.primary?.main || '#3b82f6'};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
  border-radius: 0 0 8px 8px;
`;

export const ProgressiveLoader = ({ 
  children, 
  loading = false, 
  progress = 0, 
  skeleton = null,
  showProgress = true 
}) => {
  return (
    <ProgressiveContainer>
      {loading ? skeleton : children}
      {loading && showProgress && <ProgressBar progress={progress} />}
    </ProgressiveContainer>
  );
};

export default {
  SkeletonBox,
  SkeletonText,
  SkeletonCircle,
  SkeletonImage,
  TemplateCardSkeleton,
  TemplateGridSkeleton,
  TemplateListSkeleton,
  LoadingState,
  ProgressiveLoader
};