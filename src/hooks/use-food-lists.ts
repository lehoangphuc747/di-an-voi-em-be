"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/components/SessionContextProvider';
import { toast } from 'sonner';
import { FavoriteEntry, VisitedEntry } from '@/types';

interface FoodLists {
  favorites: FavoriteEntry[];
  wishlist: string[];
  visited: VisitedEntry[];
}

export function useFoodLists() {
  const { session } = useSession();
  const [lists, setLists] = useState<FoodLists>({
    favorites: [],
    wishlist: [],
    visited: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    if (!session?.user) {
      setLists({ favorites: [], wishlist: [], visited: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userId = session.user.id;
      const [favoritesRes, wishlistRes, visitedRes] = await Promise.all([
        supabase.from('favorites').select('mon_an_id, ghi_chu').eq('user_id', userId),
        supabase.from('wishlist').select('mon_an_id').eq('user_id', userId),
        supabase.from('visited').select('mon_an_id, rating, notes').eq('user_id', userId),
      ]);

      if (favoritesRes.error) throw favoritesRes.error;
      if (wishlistRes.error) throw wishlistRes.error;
      if (visitedRes.error) throw visitedRes.error;

      setLists({
        favorites: favoritesRes.data.map(item => ({ monAnId: item.mon_an_id, ghiChu: item.ghi_chu || '' })),
        wishlist: wishlistRes.data.map(item => item.mon_an_id),
        visited: visitedRes.data.map(item => ({ monAnId: item.mon_an_id, rating: item.rating, notes: item.notes || '' })),
      });
    } catch (error) {
      console.error('Error fetching user lists:', error);
      toast.error('Không thể tải danh sách của bạn.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // --- Checkers ---
  const isFavorite = useCallback((monAnId: string) => lists.favorites.some(fav => fav.monAnId === monAnId), [lists.favorites]);
  const isWishlist = useCallback((monAnId: string) => lists.wishlist.includes(monAnId), [lists.wishlist]);
  const isVisited = useCallback((monAnId: string) => lists.visited.some(v => v.monAnId === monAnId), [lists.visited]);

  // --- Generic Toggler for Wishlist & Visited ---
  const createToggler = useCallback((listName: 'wishlist' | 'visited', table: string) => {
    return async (monAnId: string) => {
      if (!session?.user) return toast.error('Bạn cần đăng nhập.');
      
      const currentList = lists[listName];
      const isInList = listName === 'wishlist' 
        ? (currentList as string[]).includes(monAnId)
        : (currentList as VisitedEntry[]).some(v => v.monAnId === monAnId);

      try {
        if (isInList) {
          const { error } = await supabase.from(table).delete().match({ user_id: session.user.id, mon_an_id: monAnId });
          if (error) throw error;
          setLists(prev => ({ ...prev, [listName]: currentList.filter((id: any) => (typeof id === 'string' ? id : id.monAnId) !== monAnId) }));
        } else {
          const { error } = await supabase.from(table).insert({ user_id: session.user.id, mon_an_id: monAnId });
          if (error) throw error;
          const newItem = listName === 'wishlist' ? monAnId : { monAnId, rating: null, notes: '' };
          setLists(prev => ({ ...prev, [listName]: [...currentList, newItem] }));
        }
      } catch (error) {
        console.error(`Error toggling ${listName}:`, error);
        toast.error('Có lỗi xảy ra, vui lòng thử lại.');
      }
    };
  }, [session, lists]);

  const toggleWishlist = createToggler('wishlist', 'wishlist');
  const toggleVisited = createToggler('visited', 'visited');

  // --- Favorite Management ---
  const addFavorite = useCallback(async (monAnId: string, ghiChu: string = '') => {
     if (!session?.user) return toast.error('Bạn cần đăng nhập.');
     const { error } = await supabase.from('favorites').insert({ user_id: session.user.id, mon_an_id: monAnId, ghi_chu: ghiChu });
     if (error) toast.error('Không thể thêm vào yêu thích.');
     else setLists(prev => ({ ...prev, favorites: [...prev.favorites, { monAnId, ghiChu }] }));
  }, [session]);

  const removeFavorite = useCallback(async (monAnId: string) => {
    if (!session?.user) return toast.error('Bạn cần đăng nhập.');
    const { error } = await supabase.from('favorites').delete().match({ user_id: session.user.id, mon_an_id: monAnId });
    if (error) toast.error('Không thể xóa khỏi yêu thích.');
    else setLists(prev => ({ ...prev, favorites: prev.favorites.filter(fav => fav.monAnId !== monAnId) }));
  }, [session]);

  const updateFavoriteNote = useCallback(async (monAnId: string, ghiChu: string) => {
    if (!session?.user) return toast.error('Bạn cần đăng nhập.');
    const { error } = await supabase.from('favorites').update({ ghi_chu: ghiChu }).match({ user_id: session.user.id, mon_an_id: monAnId });
    if (error) toast.error('Không thể cập nhật ghi chú.');
    else setLists(prev => ({ ...prev, favorites: prev.favorites.map(fav => fav.monAnId === monAnId ? { ...fav, ghiChu } : fav) }));
  }, [session]);

  const getFavoriteNote = useCallback((monAnId: string) => lists.favorites.find(fav => fav.monAnId === monAnId)?.ghiChu, [lists.favorites]);

  return {
    ...lists,
    loading,
    fetchLists,
    isFavorite,
    addFavorite,
    removeFavorite,
    updateFavoriteNote,
    getFavoriteNote,
    isWishlist,
    toggleWishlist,
    isVisited,
    toggleVisited,
  };
}