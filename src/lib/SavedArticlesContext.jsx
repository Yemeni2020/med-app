import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ApiError, listSavedItems, removeSavedItem, saveItem } from '@/lib/med-api';
import { useAuth } from '@/lib/AuthContext';

const SavedArticlesContext = createContext(null);

export function SavedArticlesProvider({ children }) {
  const { isAuthenticated, authChecked } = useAuth();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    if (!authChecked) {
      return;
    }

    if (!isAuthenticated) {
      setSavedItems([]);
      setLoading(false);
      return;
    }

    try {
      setSavedItems(await listSavedItems());
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) {
        throw error;
      }
      setSavedItems([]);
    } finally {
      setLoading(false);
    }
  }, [authChecked, isAuthenticated]);

  useEffect(() => {
    setLoading(true);
    fetchSaved();
  }, [fetchSaved]);

  const isSaved = useCallback(
    (itemId) => savedItems.some(s => s.item_id === itemId),
    [savedItems]
  );

  const toggleSave = useCallback(async (item) => {
    if (!isAuthenticated) {
      throw new ApiError('Please sign in to save articles.', 401, {});
    }

    const existing = savedItems.find(s => s.item_id === item.item_id);
    if (existing) {
      await removeSavedItem(item.item_id);
      setSavedItems(prev => prev.filter(s => s.item_id !== item.item_id));
    } else {
      const created = await saveItem(item);
      setSavedItems(prev => [...prev, created]);
    }
  }, [isAuthenticated, savedItems]);

  return (
    <SavedArticlesContext.Provider value={{ savedItems, isSaved, toggleSave, loading, requiresAuth: !isAuthenticated }}>
      {children}
    </SavedArticlesContext.Provider>
  );
}

export function useSavedArticles() {
  return useContext(SavedArticlesContext);
}
