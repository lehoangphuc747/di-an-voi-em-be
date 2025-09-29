import { useFavorites } from "@/hooks/use-favorites";
import { FavoriteItem } from "@/components/FavoriteItem";
import monAnData from "@/data/monan.json";
import loaiMonData from "@/data/loaimon.json";
import { MonAn, LoaiMon } from "@/types";

const FavoritesPage = () => {
  const { favorites } = useFavorites();
  
  const loaiMonMap = new Map<string, LoaiMon>();
  loaiMonData.forEach(loai => loaiMonMap.set(loai.id, loai));

  const favoriteMonAnIds = new Set(favorites.map(f => f.monAnId));
  const favoriteMonAnList: MonAn[] = monAnData.filter(m => favoriteMonAnIds.has(m.id));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Món ăn yêu thích</h1>
      {favoriteMonAnList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favoriteMonAnList.map((monAn) => (
            <FavoriteItem 
              key={monAn.id} 
              monAn={monAn} 
              loaiMon={loaiMonMap.get(monAn.loaiId)} 
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