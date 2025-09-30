import { useFoodLists } from "@/hooks/use-food-lists";
import { FavoriteItem } from "@/components/FavoriteItem";
import loaiMonData from "@/data/loaimon.json";
import { MonAn, LoaiMon } from "@/types";
import { useAllMonAn } from "@/hooks/use-all-mon-an";
import { Loader2 } from "lucide-react";

const FavoritesPage = () => {
  const { favorites } = useFoodLists();
  const { allMonAn, isLoading } = useAllMonAn();
  
  const loaiMonMap = new Map<string, LoaiMon>();
  loaiMonData.forEach(loai => loaiMonMap.set(loai.id, loai));

  const favoriteMonAnIds = new Set(favorites.map(f => f.monAnId));
  const favoriteMonAnList: MonAn[] = allMonAn.filter(m => favoriteMonAnIds.has(m.id));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Món ăn yêu thích</h1>
      {favoriteMonAnList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favoriteMonAnList.map((monAn) => (
            <FavoriteItem 
              key={monAn.id} 
              monAn={monAn} 
              loaiMon={monAn.loaiIds.map(id => loaiMonMap.get(id)).filter(Boolean) as LoaiMon[]} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Bạn chưa có món ăn yêu thích nào.</p>
          <p className="text-sm text-muted-foreground mt-2">Hãy khám phá và bấm "Yêu thích" để lưu lại nhé!</p>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;