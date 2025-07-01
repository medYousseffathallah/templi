import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { templateApi, interactionApi, userApi } from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [cache, setCache] = useState({
    templates: new Map(),
    userInteractions: new Map(),
    notifications: [],
    favorites: [],
    trending: {
      mostLiked: [],
      mostFavorited: []
    }
  });
  const [loading, setLoading] = useState({
    templates: false,
    interactions: false,
    notifications: false,
    favorites: false,
    trending: false
  });
  const [lastFetch, setLastFetch] = useState({
    templates: null,
    interactions: null,
    notifications: null,
    favorites: null,
    trending: null
  });

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Check if data is fresh
  const isFresh = useCallback((key) => {
    const lastFetchTime = lastFetch[key];
    return lastFetchTime && (Date.now() - lastFetchTime) < CACHE_DURATION;
  }, [lastFetch]);

  // Preload trending templates
  const preloadTrending = useCallback(async () => {
    if (loading.trending || isFresh('trending')) return cache.trending;

    setLoading(prev => ({ ...prev, trending: true }));
    try {
      const [mostLikedResponse, mostFavoritedResponse] = await Promise.all([
        templateApi.getTrending('like'),
        templateApi.getTrending('favorite')
      ]);

      const trendingData = {
        mostLiked: mostLikedResponse.data || [],
        mostFavorited: mostFavoritedResponse.data || []
      };

      setCache(prev => ({ ...prev, trending: trendingData }));
      setLastFetch(prev => ({ ...prev, trending: Date.now() }));
      return trendingData;
    } catch (error) {
      console.error('Error preloading trending templates:', error);
      return cache.trending;
    } finally {
      setLoading(prev => ({ ...prev, trending: false }));
    }
  }, [loading.trending, isFresh]);

  // Preload user interactions
  const preloadUserInteractions = useCallback(async () => {
    if (!isAuthenticated || !currentUser || loading.interactions || isFresh('interactions')) {
      return cache.userInteractions;
    }

    setLoading(prev => ({ ...prev, interactions: true }));
    try {
      const response = await interactionApi.getUserInteractions(currentUser._id);
      const interactions = response.data || [];
      
      const interactionMap = new Map();
      interactions.forEach(interaction => {
        if (interaction.template && interaction.template._id) {
          const templateId = interaction.template._id;
          if (!interactionMap.has(templateId)) {
            interactionMap.set(templateId, []);
          }
          interactionMap.get(templateId).push(interaction);
        }
      });

      setCache(prev => ({ ...prev, userInteractions: interactionMap }));
      setLastFetch(prev => ({ ...prev, interactions: Date.now() }));
      return interactionMap;
    } catch (error) {
      console.error('Error preloading user interactions:', error);
      return cache.userInteractions;
    } finally {
      setLoading(prev => ({ ...prev, interactions: false }));
    }
  }, [isAuthenticated, currentUser, loading.interactions, isFresh]);

  // Preload user favorites
  const preloadFavorites = useCallback(async () => {
    if (!isAuthenticated || !currentUser || loading.favorites || isFresh('favorites')) {
      return cache.favorites;
    }

    setLoading(prev => ({ ...prev, favorites: true }));
    try {
      const response = await userApi.getFavorites(currentUser._id);
      const favorites = response.data || [];
      
      setCache(prev => ({ ...prev, favorites }));
      setLastFetch(prev => ({ ...prev, favorites: Date.now() }));
      return favorites;
    } catch (error) {
      console.error('Error preloading favorites:', error);
      return cache.favorites;
    } finally {
      setLoading(prev => ({ ...prev, favorites: false }));
    }
  }, [isAuthenticated, currentUser, loading.favorites, isFresh]);

  // Preload notifications
  const preloadNotifications = useCallback(async () => {
    if (!isAuthenticated || !currentUser || loading.notifications || isFresh('notifications')) {
      return cache.notifications;
    }

    setLoading(prev => ({ ...prev, notifications: true }));
    try {
      const response = await interactionApi.getNotifications(currentUser._id);
      const notifications = response.data || [];
      
      setCache(prev => ({ ...prev, notifications }));
      setLastFetch(prev => ({ ...prev, notifications: Date.now() }));
      return notifications;
    } catch (error) {
      console.error('Error preloading notifications:', error);
      return cache.notifications;
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  }, [isAuthenticated, currentUser, loading.notifications, isFresh]);

  // Preload initial templates
  const preloadInitialTemplates = useCallback(async (page = 1, limit = 20) => {
    const cacheKey = `${page}-${limit}`;
    if (loading.templates || cache.templates.has(cacheKey)) {
      return cache.templates.get(cacheKey) || [];
    }

    setLoading(prev => ({ ...prev, templates: true }));
    try {
      const response = await templateApi.discover(page, limit);
      const templates = response.data?.templates || [];
      
      setCache(prev => {
        const newTemplates = new Map(prev.templates);
        newTemplates.set(cacheKey, templates);
        return { ...prev, templates: newTemplates };
      });
      setLastFetch(prev => ({ ...prev, templates: Date.now() }));
      return templates;
    } catch (error) {
      console.error('Error preloading initial templates:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, templates: false }));
    }
  }, [loading.templates]);

  // Initialize preloading when user logs in
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Preload user-specific data
      preloadUserInteractions();
      preloadFavorites();
      preloadNotifications();
    }
  }, [isAuthenticated, currentUser, preloadUserInteractions, preloadFavorites, preloadNotifications]);

  // Preload trending templates on mount
  useEffect(() => {
    preloadTrending();
    preloadInitialTemplates();
  }, [preloadTrending, preloadInitialTemplates]);

  // Clear cache when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setCache(prev => ({
        ...prev,
        userInteractions: new Map(),
        notifications: [],
        favorites: []
      }));
      setLastFetch(prev => ({
        ...prev,
        interactions: null,
        notifications: null,
        favorites: null
      }));
    }
  }, [isAuthenticated]);

  // Invalidate cache function
  const invalidateCache = useCallback((keys) => {
    const keysToInvalidate = Array.isArray(keys) ? keys : [keys];
    setLastFetch(prev => {
      const newLastFetch = { ...prev };
      keysToInvalidate.forEach(key => {
        newLastFetch[key] = null;
      });
      return newLastFetch;
    });
  }, []);

  // Update cache function
  const updateCache = useCallback((key, data) => {
    setCache(prev => ({ ...prev, [key]: data }));
    setLastFetch(prev => ({ ...prev, [key]: Date.now() }));
  }, []);

  const value = {
    cache,
    loading,
    preloadTrending,
    preloadUserInteractions,
    preloadFavorites,
    preloadNotifications,
    preloadInitialTemplates,
    invalidateCache,
    updateCache,
    isFresh
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;