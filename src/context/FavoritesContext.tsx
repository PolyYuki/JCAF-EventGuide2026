import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoritesContextType {
  favoriteStallIds: string[];
  toggleFavoriteStall: (id: string) => void;
  isStallFavorite: (id: string) => boolean;
  clearFavorites: () => void;
}

const STORAGE_KEY = 'jcaf_favorite_stalls';

const FavoritesContext = createContext<FavoritesContextType>({
  favoriteStallIds: [],
  toggleFavoriteStall: () => {},
  isStallFavorite: () => false,
  clearFavorites: () => {}
});

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteStallIds, setFavoriteStallIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteStallIds));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage:', e);
    }
  }, [favoriteStallIds]);

  const toggleFavoriteStall = (id: string) => {
    setFavoriteStallIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isStallFavorite = (id: string) => favoriteStallIds.includes(id);

  const clearFavorites = () => {
    setFavoriteStallIds([]);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteStallIds,
        toggleFavoriteStall,
        isStallFavorite,
        clearFavorites
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
