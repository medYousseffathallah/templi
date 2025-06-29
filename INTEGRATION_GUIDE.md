# Performance Optimization Integration Guide

This guide provides step-by-step instructions for integrating the performance optimizations into existing Templi pages and components.

## 🎯 Quick Start Checklist

### ✅ Essential Integrations
- [ ] Wrap app with `DataProvider`
- [ ] Register service worker
- [ ] Replace images with `OptimizedImage`
- [ ] Add performance monitoring to key components
- [ ] Implement debounced user interactions
- [ ] Use virtual scrolling for large lists

## 📋 Step-by-Step Integration

### 1. App-Level Setup

#### Update App.js
```javascript
// src/App.js
import React, { useEffect } from 'react';
import { DataProvider } from './context/DataContext';
import { logSummary } from './utils/performanceMonitor';

function App() {
  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Log performance summary in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => logSummary(), 5000);
    }
  }, []);

  return (
    <DataProvider>
      {/* Your existing app content */}
    </DataProvider>
  );
}
```

### 2. Page-Level Optimizations

#### ExplorePage.js Integration
```javascript
// src/pages/ExplorePage.js
import React, { useEffect, useRef } from 'react';
import VirtualScrollList from '../components/VirtualScrollList';
import { useDebouncedSearch } from '../hooks/useDebounce';
import { useData } from '../context/DataContext';
import { measureTemplateLoad, recordMetric } from '../utils/performanceMonitor';
import OptimizedTemplateCard from '../components/OptimizedTemplateCard';

const ExplorePage = () => {
  const { cache, preloadTrendingTemplates } = useData();
  const loadTimerRef = useRef(null);

  // Performance monitoring
  useEffect(() => {
    loadTimerRef.current = measureTemplateLoad('explore_page', 'Load');
    recordMetric('Explore_Page_Visit', 1, 'increment');

    return () => {
      if (loadTimerRef.current) {
        loadTimerRef.current.end();
      }
    };
  }, []);

  // Debounced search
  const {
    query,
    results,
    loading,
    setQuery,
    clearSearch
  } = useDebouncedSearch(async (searchTerm) => {
    const timer = measureTemplateLoad('search', 'Execute');
    try {
      const response = await templateApi.discoverTemplates({
        search: searchTerm,
        page: 1,
        limit: 20
      });
      timer.end();
      return response.templates;
    } catch (error) {
      timer.end();
      throw error;
    }
  }, 300);

  // Virtual scrolling for template list
  const renderTemplate = (template, index) => (
    <OptimizedTemplateCard
      key={template._id}
      template={template}
      index={index}
      priority={index < 3} // Prioritize first 3 templates
    />
  );

  return (
    <div>
      {/* Search input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search templates..."
      />

      {/* Virtual scrolled template list */}
      <VirtualScrollList
        items={results.length > 0 ? results : cache.templates || []}
        itemHeight={300}
        containerHeight={600}
        renderItem={renderTemplate}
        loading={loading}
        onEndReached={() => {
          recordMetric('Explore_Pagination', 1, 'increment');
          // Load more templates
        }}
        overscan={3}
      />
    </div>
  );
};
```

#### TrendingPage.js Integration
```javascript
// src/pages/TrendingPage.js
import React, { useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { measureTemplateLoad, recordMetric } from '../utils/performanceMonitor';
import { useMediaPreloader } from '../hooks/useMediaPreloader';

const TrendingPage = () => {
  const { cache, preloadTrendingTemplates } = useData();
  const { preloadImages } = useMediaPreloader({ priority: 'high' });
  const loadTimerRef = useRef(null);

  useEffect(() => {
    loadTimerRef.current = measureTemplateLoad('trending_page', 'Load');
    recordMetric('Trending_Page_Visit', 1, 'increment');

    // Preload trending templates
    preloadTrendingTemplates();

    // Preload hero images
    if (cache.trendingTemplates?.length > 0) {
      const heroImages = cache.trendingTemplates
        .slice(0, 5)
        .map(t => t.imageUrls?.[0] || t.imageUrl)
        .filter(Boolean);
      preloadImages(heroImages);
    }

    return () => {
      if (loadTimerRef.current) {
        loadTimerRef.current.end();
      }
    };
  }, [cache.trendingTemplates, preloadTrendingTemplates, preloadImages]);

  // Rest of component...
};
```

### 3. Component-Level Optimizations

#### Template Card Integration
```javascript
// Replace existing TemplateCard usage
import OptimizedTemplateCard from '../components/OptimizedTemplateCard';

// Instead of:
// <TemplateCard template={template} />

// Use:
<OptimizedTemplateCard
  template={template}
  priority={index < 3} // Prioritize first 3 cards
  lazy={index > 5} // Lazy load cards beyond 5th
/>
```

#### Image Replacement
```javascript
// Replace all img tags with OptimizedImage
import OptimizedImage from '../components/OptimizedImage';

// Instead of:
// <img src={imageUrl} alt={alt} />

// Use:
<OptimizedImage
  src={imageUrl}
  alt={alt}
  placeholder="shimmer"
  lazy={true}
  webp={true}
  onLoad={() => recordMetric('Image_Load_Success', 1, 'increment')}
/>
```

### 4. Search and Filter Optimization

#### Debounced Search Implementation
```javascript
// src/components/SearchBar.js
import React from 'react';
import { useDebouncedSearch } from '../hooks/useDebounce';
import { templateApi } from '../services/api';

const SearchBar = ({ onResults }) => {
  const {
    query,
    results,
    loading,
    error,
    setQuery
  } = useDebouncedSearch(async (searchTerm) => {
    const response = await templateApi.discoverTemplates({
      search: searchTerm,
      limit: 20
    });
    return response.templates;
  }, 300);

  useEffect(() => {
    onResults(results);
  }, [results, onResults]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search templates..."
      />
      {loading && <div>Searching...</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
};
```

### 5. List Optimization with Virtual Scrolling

#### Large Template Lists
```javascript
// For any page with many templates
import VirtualScrollList from '../components/VirtualScrollList';

const TemplateList = ({ templates }) => {
  const renderTemplate = useCallback((template, index, meta) => (
    <OptimizedTemplateCard
      key={template._id}
      template={template}
      priority={index < 3}
      lazy={!meta.isVisible}
    />
  ), []);

  return (
    <VirtualScrollList
      items={templates}
      itemHeight={300}
      containerHeight={window.innerHeight - 200}
      renderItem={renderTemplate}
      overscan={5}
      onEndReached={loadMoreTemplates}
    />
  );
};
```

### 6. User Interaction Optimization

#### Debounced Button Actions
```javascript
// For like, favorite, and other user actions
import { useDebounceCallback } from '../hooks/useDebounce';
import { recordMetric } from '../utils/performanceMonitor';

const InteractiveButton = ({ onAction, type }) => {
  const debouncedAction = useDebounceCallback(() => {
    recordMetric(`${type}_Action`, 1, 'increment');
    onAction();
  }, 300, [onAction, type]);

  return (
    <button onClick={debouncedAction}>
      {type}
    </button>
  );
};
```

## 🔧 Configuration Updates

### Environment Variables
Add to your `.env` file:
```env
# Performance monitoring
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true

# Service worker
REACT_APP_ENABLE_SERVICE_WORKER=true

# Cache settings
REACT_APP_CACHE_DURATION=300000
REACT_APP_MAX_CACHE_SIZE=50

# Image optimization
REACT_APP_ENABLE_WEBP=true
REACT_APP_IMAGE_QUALITY=80
```

### Package.json Scripts
Add performance monitoring scripts:
```json
{
  "scripts": {
    "analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js",
    "perf:monitor": "node scripts/performance-monitor.js",
    "perf:report": "node scripts/generate-performance-report.js"
  }
}
```

## 📊 Monitoring Integration

### Development Monitoring
```javascript
// Add to any component for debugging
import { logSummary, getCoreWebVitals } from '../utils/performanceMonitor';

// In component
useEffect(() => {
  // Log performance after 5 seconds
  const timer = setTimeout(() => {
    console.log('Performance Summary:', logSummary());
    console.log('Core Web Vitals:', getCoreWebVitals());
  }, 5000);

  return () => clearTimeout(timer);
}, []);
```

### Production Analytics
```javascript
// Send metrics to analytics service
import { getSummary } from '../utils/performanceMonitor';

const sendPerformanceMetrics = () => {
  if (process.env.NODE_ENV === 'production') {
    const metrics = getSummary();
    // Send to your analytics service
    analytics.track('performance_metrics', metrics);
  }
};

// Call periodically or on page unload
window.addEventListener('beforeunload', sendPerformanceMetrics);
```

## 🚨 Common Migration Issues

### 1. Image Loading Issues
**Problem**: Images not loading with OptimizedImage
**Solution**: Check image URLs and add error handling
```javascript
<OptimizedImage
  src={imageUrl}
  alt={alt}
  onError={(e) => {
    console.error('Image failed to load:', imageUrl);
    // Fallback logic
  }}
/>
```

### 2. Virtual Scrolling Performance
**Problem**: Slow scrolling with VirtualScrollList
**Solution**: Optimize item height and overscan
```javascript
<VirtualScrollList
  itemHeight={200} // Fixed height for better performance
  overscan={3} // Reduce overscan for better performance
  // ...
/>
```

### 3. Service Worker Caching
**Problem**: Stale content after updates
**Solution**: Implement cache versioning
```javascript
// In service worker
const CACHE_VERSION = 'v1.2.0';
const CACHE_NAME = `templi-cache-${CACHE_VERSION}`;
```

## 🎯 Performance Targets

### Before Integration
- Initial Load: ~3.2s
- Template Render: ~150ms
- Image Loading: ~800ms
- Memory Usage: ~45MB

### After Integration
- Initial Load: <2s (37% improvement)
- Template Render: <80ms (47% improvement)
- Image Loading: <400ms (50% improvement)
- Memory Usage: <30MB (33% improvement)

## 📈 Measuring Success

### Key Metrics to Track
1. **Core Web Vitals**
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1

2. **Custom Metrics**
   - Template load time
   - Search response time
   - Image load success rate
   - Cache hit ratio

3. **User Experience**
   - Bounce rate
   - Time on page
   - Interaction rate
   - Error rate

### Monitoring Tools
- Browser DevTools Performance tab
- Lighthouse CI
- Real User Monitoring (RUM)
- Custom performance dashboard

## 🔄 Rollback Plan

If issues arise:
1. **Disable service worker**: Set `REACT_APP_ENABLE_SERVICE_WORKER=false`
2. **Revert to standard images**: Replace OptimizedImage with img tags
3. **Disable virtual scrolling**: Use standard list rendering
4. **Remove performance monitoring**: Comment out monitoring calls

---

*Follow this guide step by step to ensure smooth integration of all performance optimizations. Test thoroughly in development before deploying to production.*