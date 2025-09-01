import { useQuery, useQueryClient } from '@tanstack/react-query';
import offlineStorage from '../services/offlineStorage';

/**
 * Custom hook for API queries with caching and offline support
 * @param {string} queryKey - Unique key for the query
 * @param {Function} queryFn - Function that fetches the data
 * @param {Object} options - Additional query options
 */
export function useQueryWithCache(queryKey, queryFn, options = {}) {
  const queryClient = useQueryClient();
  
  const defaultOptions = {
    // Cache data for 5 minutes by default
    staleTime: 5 * 60 * 1000,
    // Keep data in cache for 10 minutes
    cacheTime: 10 * 60 * 1000,
    // Retry failed requests 3 times
    retry: 3,
    // Exponential backoff for retries
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch on window focus
    refetchOnWindowFocus: true,
    // Don't refetch on reconnect if data is fresh
    refetchOnReconnect: 'always',
    
    // Custom error handler
    onError: (error) => {
      console.error(`Query error for ${queryKey}:`, error);
      
      // If offline, try to get data from IndexedDB
      if (!navigator.onLine) {
        return handleOfflineQuery(queryKey);
      }
    },
    
    // Custom success handler
    onSuccess: (data) => {
      // Save to IndexedDB for offline access
      saveToOfflineStorage(queryKey, data);
    },
    
    ...options
  };
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Check if we're offline
      if (!navigator.onLine) {
        const offlineData = await getFromOfflineStorage(queryKey);
        if (offlineData) {
          return offlineData;
        }
        throw new Error('No offline data available');
      }
      
      // Try to fetch from API
      try {
        const data = await queryFn();
        return data;
      } catch (error) {
        // If API fails, try offline storage
        const offlineData = await getFromOfflineStorage(queryKey);
        if (offlineData) {
          console.log(`Using offline data for ${queryKey}`);
          return offlineData;
        }
        throw error;
      }
    },
    ...defaultOptions
  });
}

/**
 * Handle offline queries by fetching from IndexedDB
 */
async function handleOfflineQuery(queryKey) {
  try {
    const data = await getFromOfflineStorage(queryKey);
    if (data) {
      console.log(`Retrieved offline data for ${queryKey}`);
      return data;
    }
  } catch (error) {
    console.error('Failed to retrieve offline data:', error);
  }
  return null;
}

/**
 * Save data to offline storage
 */
async function saveToOfflineStorage(queryKey, data) {
  try {
    const keyString = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
    
    // Map query keys to appropriate offline storage methods
    if (keyString.includes('habits')) {
      if (Array.isArray(data)) {
        for (const habit of data) {
          await offlineStorage.saveHabit(habit);
        }
      }
    } else if (keyString.includes('checkins')) {
      if (Array.isArray(data)) {
        for (const checkin of data) {
          await offlineStorage.saveCheckin(checkin);
        }
      }
    } else if (keyString.includes('moods')) {
      if (Array.isArray(data)) {
        for (const mood of data) {
          await offlineStorage.saveMood(mood);
        }
      }
    } else if (keyString.includes('mission')) {
      await offlineStorage.saveMission(data);
    } else if (keyString.includes('vision')) {
      await offlineStorage.saveVision(data);
    } else if (keyString.includes('badges')) {
      if (Array.isArray(data)) {
        await offlineStorage.saveBadges(data);
      }
    }
  } catch (error) {
    console.error('Failed to save to offline storage:', error);
  }
}

/**
 * Get data from offline storage
 */
async function getFromOfflineStorage(queryKey) {
  try {
    const keyString = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
    const userId = localStorage.getItem('user_id');
    
    // Map query keys to appropriate offline storage methods
    if (keyString.includes('habits')) {
      return await offlineStorage.getHabits(userId);
    } else if (keyString.includes('checkins')) {
      // Parse habit ID from query key if available
      const habitId = extractHabitId(queryKey);
      if (habitId) {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return await offlineStorage.getCheckins(habitId, thirtyDaysAgo, today);
      }
    } else if (keyString.includes('moods')) {
      return await offlineStorage.getMoods(userId);
    } else if (keyString.includes('mission')) {
      return await offlineStorage.getMission(userId);
    } else if (keyString.includes('vision')) {
      return await offlineStorage.getVision(userId);
    } else if (keyString.includes('badges')) {
      return await offlineStorage.getBadges(userId);
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get from offline storage:', error);
    return null;
  }
}

/**
 * Extract habit ID from query key
 */
function extractHabitId(queryKey) {
  if (Array.isArray(queryKey)) {
    for (const key of queryKey) {
      if (typeof key === 'string' && key.match(/^[0-9a-f-]+$/)) {
        return key;
      }
    }
  }
  return null;
}

/**
 * Prefetch and cache data for offline use
 */
export async function prefetchForOffline(queryClient) {
  const userId = localStorage.getItem('user_id');
  if (!userId) return;
  
  const queriesToPrefetch = [
    ['habits', userId],
    ['mission', userId],
    ['vision', userId],
    ['badges', userId],
    ['moods', userId, 30],
  ];
  
  for (const queryKey of queriesToPrefetch) {
    try {
      await queryClient.prefetchQuery({
        queryKey,
        staleTime: Infinity, // Never consider prefetched data stale
      });
    } catch (error) {
      console.error(`Failed to prefetch ${queryKey}:`, error);
    }
  }
  
  console.log('✅ Data prefetched for offline use');
}

/**
 * Invalidate and refetch queries when coming back online
 */
export function setupOnlineListener(queryClient) {
  window.addEventListener('online', () => {
    console.log('🌐 Back online - refetching data...');
    
    // Invalidate all queries to refetch fresh data
    queryClient.invalidateQueries();
    
    // Sync offline changes
    offlineStorage.syncWithBackend();
  });
  
  window.addEventListener('offline', () => {
    console.log('📴 Offline mode - using cached data');
  });
}

export default useQueryWithCache;