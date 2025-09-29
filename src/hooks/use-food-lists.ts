import { useState, useEffect, useCallback } from 'react';
import { YeuThich } from '@/types';

const LISTS_KEY = 'food-diary-lists';

interface FoodLists {
  favorites: YeuThich[];
  wishlist: string[]; // array of monAnId
  visited: string[]; // array of monAnId
}

const initialLists: FoodLists = {
  favorites: [],
  wishlist: [],
  visited: [],
};

export const useFoodLists = () => {
  const [lists, setLists] = useState<FoodLists>(initialLists);

  useEffect(() => {
    try {
      const storedLists = localStorage.getItem(LISTS_KEY);
      if (storedLists) {
        const parsedLists = JSON.parse(storedLists);
        setLists({
          favorites: parsedLists.favorites || [],
          wishlist: parsedLists.wishlist || [],
          visited: parsedLists.visited || [],
        });
      }
    } catch (error) {
      console.error("Failed to parse lists from localStorage", error);
      setLists(initialLists);
    }
  }, []);

  const saveLists = (newLists: FoodLists) => {
    try {
      setLists(newLists);
      localStorage.setItem(LISTS_KEY, JSON.stringify(newLists));
    } catch (error) {
      console.error("Failed to save lists to localStorage", error);
    }
  };

  // Favorites
  const addFavorite = useCallback((monAnId: string, ghiChu?: string) => {
    const newFavorite: YeuThich = { monAnId, ghiChu: ghiChu || '' };
    saveLists({ ...lists, favorites: [...lists.favorites, newFavorite] });
  }, [lists]);

  const removeFavorite = useCallback((monAnId: string) => {
    const newFavorites = lists.favorites.filter(fav => fav.monAnId !== monAnId);
    saveLists({ ...lists, favorites: newFavorites });
  }, [lists]);

  const isFavorite = useCallback((monAnId: string) => {
    return lists.favorites.some(fav => fav.monAnId === monAnId);
  }, [lists.favorites]);
  
  const getFavoriteNote = useCallback((monAnId: string) => {
    return lists.favorites.find(fav => fav.monAnId === monAnId)?.ghiChu;
  }, [lists.favorites]);

  const updateFavoriteNote = useCallback((monAnId: string, ghiChu: string) => {
    const newFavorites = lists.favorites.map(fav => 
      fav.monAnId === monAnId ? { ...fav, ghiChu } : fav
    );
    saveLists({ ...lists, favorites: newFavorites });
  }, [lists]);

  // Wishlist
  const isWishlist = useCallback((monAnId: string) => {
    return lists.wishlist.includes(monAnId);
  }, [lists.wishlist]);

  const toggleWishlist = useCallback((monAnId: string) => {
    const newWishlist = isWishlist(monAnId)
      ? lists.wishlist.filter(id => id !== monAnId)
      : [...lists.wishlist, monAnId];
    saveLists({ ...lists, wishlist: newWishlist });
  }, [lists, isWishlist]);

  // Visited
  const isVisited = useCallback((monAnId: string) => {
    return lists.visited.includes(monAnId);
  }, [lists.visited]);

  const toggleVisited = useCallback((monAnId: string) => {
    const newVisited = isVisited(monAnId)
      ? lists.visited.filter(id => id !== monAnId)
      : [...lists.visited, monAnId];
    saveLists({ ...lists, visited: newVisited });
  }, [lists, isVisited]);


  return { 
    favorites: lists.favorites, 
    wishlist: lists.wishlist,
    visited: lists.visited,
    addFavorite, 
    removeFavorite, 
    isFavorite, 
    getFavoriteNote, 
    updateFavoriteNote,
    isWishlist,
    toggleWishlist,
    isVisited,
    toggleVisited
  };
};