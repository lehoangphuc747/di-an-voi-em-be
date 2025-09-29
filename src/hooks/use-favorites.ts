import { useState, useEffect, useCallback } from 'react';
import { YeuThich } from '@/types';

const FAVORITES_KEY = 'food-diary-favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<YeuThich[]>([]);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to parse favorites from localStorage", error);
      setFavorites([]);
    }
  }, []);

  const saveFavorites = (newFavorites: YeuThich[]) => {
    try {
      setFavorites(newFavorites);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Failed to save favorites to localStorage", error);
    }
  };

  const addFavorite = useCallback((monAnId: string, ghiChu?: string) => {
    const newFavorite: YeuThich = { monAnId, ghiChu: ghiChu || '' };
    saveFavorites([...favorites, newFavorite]);
  }, [favorites]);

  const removeFavorite = useCallback((monAnId: string) => {
    const newFavorites = favorites.filter(fav => fav.monAnId !== monAnId);
    saveFavorites(newFavorites);
  }, [favorites]);

  const isFavorite = useCallback((monAnId: string) => {
    return favorites.some(fav => fav.monAnId === monAnId);
  }, [favorites]);
  
  const getFavoriteNote = useCallback((monAnId: string) => {
    return favorites.find(fav => fav.monAnId === monAnId)?.ghiChu;
  }, [favorites]);

  const updateFavoriteNote = useCallback((monAnId: string, ghiChu: string) => {
    const newFavorites = favorites.map(fav => 
      fav.monAnId === monAnId ? { ...fav, ghiChu } : fav
    );
    saveFavorites(newFavorites);
  }, [favorites]);


  return { favorites, addFavorite, removeFavorite, isFavorite, getFavoriteNote, updateFavoriteNote };
};