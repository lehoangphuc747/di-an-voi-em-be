import { useState, useEffect, useCallback } from 'react';
import { YeuThich } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { showError, showSuccess } from '@/utils/toast';

interface VisitedEntry {
  monAnId: string;
  rating: number | null;
  notes: string | null;
}

interface FoodLists {
  favorites: YeuThich[];
  wishlist: string[]; // array of monAnId
  visited: VisitedEntry[];
}

const initialLists: FoodLists = {
  favorites: [],
  wishlist: [],
  visited: [],
};

export const useFoodLists = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [lists, setLists] = useState<FoodLists>(initialLists);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFoodLists = useCallback(async () => {
    if (!user) {
      setLists(initialLists);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('mon_an_id, ghi_chu')
        .eq('user_id', user.id);

      if (favoritesError) throw favoritesError;

      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlist')
        .select('mon_an_id')
        .eq('user_id', user.id);

      if (wishlistError) throw wishlistError;

      const { data: visitedData, error: visitedError } = await supabase
        .from('visited')
        .select('mon_an_id, rating, notes')
        .eq('user_id', user.id);

      if (visitedError) throw visitedError;

      setLists({
        favorites: favoritesData.map(item => ({ monAnId: item.mon_an_id, ghiChu: item.ghi_chu || '' })),
        wishlist: wishlistData.map(item => item.mon_an_id),
        visited: visitedData.map(item => ({ 
          monAnId: item.mon_an_id, 
          rating: item.rating, 
          notes: item.notes 
        })),
      });
    } catch (error) {
      console.error("Error fetching food lists:", error);
      showError('Lỗi khi tải danh sách món ăn của bạn.');
      setLists(initialLists);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isSessionLoading) {
      fetchFoodLists();
    }
  }, [user, isSessionLoading, fetchFoodLists]);

  // Favorites
  const addFavorite = useCallback(async (monAnId: string, ghiChu?: string) => {
    if (!user) {
      showError('Bạn cần đăng nhập để thêm món ăn yêu thích.');
      return;
    }
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: user.id, mon_an_id: monAnId, ghi_chu: ghiChu || '' });

    if (error) {
      console.error("Error adding favorite:", error);
      showError('Lỗi khi thêm vào danh sách yêu thích.');
    } else {
      setLists(prev => ({
        ...prev,
        favorites: [...prev.favorites, { monAnId, ghiChu: ghiChu || '' }],
      }));
      showSuccess("Đã thêm vào danh sách yêu thích");
    }
  }, [user]);

  const removeFavorite = useCallback(async (monAnId: string) => {
    if (!user) {
      showError('Bạn cần đăng nhập để xóa món ăn yêu thích.');
      return;
    }
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('mon_an_id', monAnId);

    if (error) {
      console.error("Error removing favorite:", error);
      showError('Lỗi khi xóa khỏi danh sách yêu thích.');
    } else {
      setLists(prev => ({
        ...prev,
        favorites: prev.favorites.filter(fav => fav.monAnId !== monAnId),
      }));
      showSuccess("Đã xóa khỏi danh sách yêu thích");
    }
  }, [user]);

  const isFavorite = useCallback((monAnId: string) => {
    return lists.favorites.some(fav => fav.monAnId === monAnId);
  }, [lists.favorites]);
  
  const getFavoriteNote = useCallback((monAnId: string) => {
    return lists.favorites.find(fav => fav.monAnId === monAnId)?.ghiChu;
  }, [lists.favorites]);

  const updateFavoriteNote = useCallback(async (monAnId: string, ghiChu: string) => {
    if (!user) {
      showError('Bạn cần đăng nhập để cập nhật ghi chú.');
      return;
    }
    const { error } = await supabase
      .from('favorites')
      .update({ ghi_chu: ghiChu, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('mon_an_id', monAnId);

    if (error) {
      console.error("Error updating favorite note:", error);
      showError('Lỗi khi cập nhật ghi chú.');
    } else {
      setLists(prev => ({
        ...prev,
        favorites: prev.favorites.map(fav => 
          fav.monAnId === monAnId ? { ...fav, ghiChu } : fav
        ),
      }));
      showSuccess('Đã lưu ghi chú!');
    }
  }, [user]);

  // Wishlist
  const isWishlist = useCallback((monAnId: string) => {
    return lists.wishlist.includes(monAnId);
  }, [lists.wishlist]);

  const toggleWishlist = useCallback(async (monAnId: string) => {
    if (!user) {
      showError('Bạn cần đăng nhập để quản lý danh sách muốn thử.');
      return;
    }
    const currentlyOnWishlist = isWishlist(monAnId);
    let error;

    if (currentlyOnWishlist) {
      const { error: deleteError } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('mon_an_id', monAnId);
      error = deleteError;
    } else {
      const { error: insertError } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, mon_an_id: monAnId });
      error = insertError;
    }

    if (error) {
      console.error("Error toggling wishlist:", error);
      showError('Lỗi khi cập nhật danh sách muốn thử.');
    } else {
      setLists(prev => ({
        ...prev,
        wishlist: currentlyOnWishlist
          ? prev.wishlist.filter(id => id !== monAnId)
          : [...prev.wishlist, monAnId],
      }));
      showSuccess(currentlyOnWishlist ? "Đã xóa khỏi danh sách 'Chờ embe'" : "Đã thêm vào danh sách 'Chờ embe'");
    }
  }, [user, isWishlist]);

  // Visited
  const isVisited = useCallback((monAnId: string) => {
    return lists.visited.some(v => v.monAnId === monAnId);
  }, [lists.visited]);

  const toggleVisited = useCallback(async (monAnId: string) => {
    if (!user) {
      showError('Bạn cần đăng nhập để quản lý danh sách đã thử.');
      return;
    }
    const hasBeenVisited = isVisited(monAnId);
    let error;

    if (hasBeenVisited) {
      const { error: deleteError } = await supabase
        .from('visited')
        .delete()
        .eq('user_id', user.id)
        .eq('mon_an_id', monAnId);
      error = deleteError;
    } else {
      const { error: insertError } = await supabase
        .from('visited')
        .insert({ user_id: user.id, mon_an_id: monAnId });
      error = insertError;
    }

    if (error) {
      console.error("Error toggling visited:", error);
      showError('Lỗi khi cập nhật danh sách đã thử.');
    } else {
      setLists(prev => ({
        ...prev,
        visited: hasBeenVisited
          ? prev.visited.filter(v => v.monAnId !== monAnId)
          : [...prev.visited, { monAnId, rating: null, notes: null }],
      }));
      showSuccess(hasBeenVisited ? "Đã bỏ đánh dấu 'Ăn rùi'" : "Đã đánh dấu 'Ăn rùi'");
    }
  }, [user, isVisited]);

  // Removed getVisitedDetails and updateVisited as their logic is now handled in UserFeedbackSection

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
    toggleVisited,
    isLoading: isLoading || isSessionLoading,
  };
};