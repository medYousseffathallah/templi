import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useThrottleCallback } from '../hooks/useDebounce';


const Container = styled.div`
  height: ${props => props.height}px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  will-change: scroll-position;
  
  /* Smooth scrolling */
  scroll-behavior: ${props => props.smoothScroll ? 'smooth' : 'auto'};
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors?.gray?.[100] || '#f1f1f1'};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors?.gray?.[400] || '#c1c1c1'};
    border-radius: 4px;
    
    &:hover {
      background: ${props => props.theme.colors?.gray?.[500] || '#a1a1a1'};
    }
  }
`;

const ScrollContent = styled.div`
  height: ${props => props.totalHeight}px;
  position: relative;
`;

const VisibleContent = styled.div`
  position: absolute;
  top: ${props => props.offsetY}px;
  left: 0;
  right: 0;
  will-change: transform;
`;

const LoadingPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${props => props.height}px;
  color: ${props => props.theme.colors?.gray?.[500] || '#666'};
  font-size: 14px;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${props => props.height}px;
  color: ${props => props.theme.colors?.red?.[500] || '#ef4444'};
  font-size: 14px;
  text-align: center;
  padding: 20px;
`;

/**
 * VirtualScrollList Component
 * Efficiently renders large lists by only rendering visible items
 */
const VirtualScrollList = ({
  items = [],
  itemHeight = 100,
  containerHeight = 400,
  renderItem,
  getItemKey,
  overscan = 5,
  onScroll,
  onEndReached,
  endReachedThreshold = 0.8,
  loading = false,
  error = null,
  loadingHeight = 100,
  smoothScroll = false,
  className,
  style,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const lastScrollTop = useRef(0);
  const endReachedRef = useRef(false);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    return items.length * itemHeight + (loading ? loadingHeight : 0);
  }, [items.length, itemHeight, loading, loadingHeight]);

  // Calculate offset for visible content
  const offsetY = useMemo(() => {
    return visibleRange.startIndex * itemHeight;
  }, [visibleRange.startIndex, itemHeight]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // Throttled scroll handler
  const handleScroll = useThrottleCallback((event) => {
    const newScrollTop = event.target.scrollTop;
    const scrollDirection = newScrollTop > lastScrollTop.current ? 'down' : 'up';
    
    setScrollTop(newScrollTop);
    setIsScrolling(true);
    lastScrollTop.current = newScrollTop;
    
    // Record scroll performance
    recordMetric('Virtual_Scroll_Event', 1, 'increment');
    
    // Call external scroll handler
    if (onScroll) {
      onScroll({
        scrollTop: newScrollTop,
        scrollDirection,
        visibleRange,
        isScrolling: true
      });
    }
    
    // Check if end reached
    const scrollPercentage = newScrollTop / (totalHeight - containerHeight);
    if (scrollPercentage >= endReachedThreshold && !endReachedRef.current && !loading) {
      endReachedRef.current = true;
      if (onEndReached) {
        onEndReached();
      }
    }
    
    // Reset end reached flag when scrolling up
    if (scrollPercentage < endReachedThreshold - 0.1) {
      endReachedRef.current = false;
    }
    
    // Clear scrolling state after delay
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      if (onScroll) {
        onScroll({
          scrollTop: newScrollTop,
          scrollDirection,
          visibleRange,
          isScrolling: false
        });
      }
    }, 150);
  }, 16); // ~60fps

  // Scroll to specific item
  const scrollToItem = useCallback((index, behavior = 'smooth') => {
    if (containerRef.current && index >= 0 && index < items.length) {
      const targetScrollTop = index * itemHeight;
      containerRef.current.scrollTo({
        top: targetScrollTop,
        behavior
      });
    }
  }, [items.length, itemHeight]);

  // Scroll to top
  const scrollToTop = useCallback((behavior = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior
      });
    }
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: totalHeight,
        behavior
      });
    }
  }, [totalHeight]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Reset scroll position when items change significantly
  useEffect(() => {
    if (items.length === 0) {
      setScrollTop(0);
      endReachedRef.current = false;
    }
  }, [items.length]);

  // Render visible items
  const renderVisibleItems = () => {
    return visibleItems.map((item, index) => {
      const actualIndex = visibleRange.startIndex + index;
      const key = getItemKey ? getItemKey(item, actualIndex) : actualIndex;
      
      return (
        <div
          key={key}
          style={{
            height: itemHeight,
            position: 'relative'
          }}
        >
          {renderItem(item, actualIndex, {
            isScrolling,
            isVisible: true
          })}
        </div>
      );
    });
  };

  // Render loading indicator
  const renderLoading = () => {
    if (!loading) return null;
    
    return (
      <LoadingPlaceholder height={loadingHeight}>
        Loading more items...
      </LoadingPlaceholder>
    );
  };

  // Render error message
  const renderError = () => {
    if (!error) return null;
    
    return (
      <ErrorMessage height={loadingHeight}>
        {typeof error === 'string' ? error : 'Failed to load items'}
      </ErrorMessage>
    );
  };

  // Expose scroll methods via ref
  React.useImperativeHandle(props.ref, () => ({
    scrollToItem,
    scrollToTop,
    scrollToBottom,
    getVisibleRange: () => visibleRange,
    getScrollTop: () => scrollTop,
    container: containerRef.current
  }), [scrollToItem, scrollToTop, scrollToBottom, visibleRange, scrollTop]);

  return (
    <Container
      ref={containerRef}
      height={containerHeight}
      smoothScroll={smoothScroll}
      onScroll={handleScroll}
      className={className}
      style={style}
      {...props}
    >
      <ScrollContent totalHeight={totalHeight}>
        <VisibleContent offsetY={offsetY}>
          {renderVisibleItems()}
          {renderLoading()}
          {renderError()}
        </VisibleContent>
      </ScrollContent>
    </Container>
  );
};

// Higher-order component for easy integration
export const withVirtualScrolling = (Component, defaultProps = {}) => {
  return React.forwardRef((props, ref) => {
    return (
      <VirtualScrollList
        ref={ref}
        {...defaultProps}
        {...props}
        renderItem={(item, index, meta) => (
          <Component
            item={item}
            index={index}
            meta={meta}
            {...props.itemProps}
          />
        )}
      />
    );
  });
};

// Hook for virtual scrolling state
export const useVirtualScrolling = ({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;
  
  return {
    scrollTop,
    setScrollTop,
    visibleRange,
    visibleItems,
    totalHeight,
    offsetY
  };
};

export default VirtualScrollList;