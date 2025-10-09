import { supabase } from '@/lib/supabase';
import { UserLists } from '@/types';
import { toast } from 'sonner';

type ListType = keyof UserLists;

export const toggleListItem = async (
  userId: string,
  foodId: string,
  listType: ListType,
  currentUserLists: UserLists
): Promise<UserLists | null> => {
  try {
    const list = currentUserLists[listType];
    const isInList = list.includes(foodId);
    const tableName = listType;

    if (isInList) {
      // Remove from list
      const { error } = await supabase
        .from(tableName)
        .delete()
        .match({ user_id: userId, mon_an_id: foodId });

      if (error) throw error;

      return {
        ...currentUserLists,
        [listType]: currentUserLists[listType].filter((id) => id !== foodId),
      };
    } else {
      // Add to list
      const { error } = await supabase
        .from(tableName)
        .insert([{ user_id: userId, mon_an_id: foodId }]);

      if (error) throw error;

      return {
        ...currentUserLists,
        [listType]: [...currentUserLists[listType], foodId],
      };
    }
  } catch (error: any) {
    console.error(`Error toggling ${listType}:`, error);
    toast.error(`Đã có lỗi xảy ra khi cập nhật danh sách.`);
    return null;
  }
};