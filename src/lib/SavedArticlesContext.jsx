import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { listSavedItems, removeSavedItem, saveItem } from '@/lib/local-store';

const SavedArticlesContext = createContext(null);

export function SavedArticlesProvider({ children }) {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    setSavedItems(listSavedItems());
    setLoading(false);
  }, []);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  const isSaved = useCallback(
    (itemId) => savedItems.some(s => s.item_id === itemId),
    [savedItems]
  );

  const toggleSave = useCallback(async (item) => {
    const existing = savedItems.find(s => s.item_id === item.item_id);
    if (existing) {
      removeSavedItem(item.item_id);
      setSavedItems(prev => prev.filter(s => s.item_id !== item.item_id));
    } else {
      const created = saveItem(item);
      setSavedItems(prev => [...prev, created]);
    }
  }, [savedItems]);

  return (
    <SavedArticlesContext.Provider value={{ savedItems, isSaved, toggleSave, loading }}>
      {children}
    </SavedArticlesContext.Provider>
  );
}

export function useSavedArticles() {
  return useContext(SavedArticlesContext);
}
