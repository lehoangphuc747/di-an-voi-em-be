import { useFoodLists } from "@/hooks/use-food-lists";
import { MonAnCard } from "@/components/MonAnCard";
import loaiMonData from "@/data/loaimon.json";
import { MonAn, LoaiMon } from "@/types";
import { useAllMonAn } from "@/hooks/use-all-mon-an";
import { Loader2 } from "lucide-react";

const WishlistPage = () => {
  const { wishlist, isFavorite, isVisited } = useFoodLists();
  const { allMonAn, isLoading } = useAllMonAn();
  
  const loaiMonMap = new Map<string, LoaiMon>();
  loaiMonData.forEach(loai => loaiMonMap.set(loai.id, loai));

  const wishlistMonAnIds = new Set(wishlist);
  const wishlistMonAnList: MonAn[] = allMonAn.filter(m => wishlistMonAnIds.has(m.id));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Muốn thử</h1>
      {wishlistMonAnList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistMonAnList.map((monAn) => (
            <MonAnCard 
              key={monAn.id} 
              monAn={monAn} 
              loaiMon={monAn.loaiIds.map(id => loaiMonMap.get(id)).filter(Boolean) as LoaiMon[]}
              isWishlist={true}
              isFavorite={isFavorite(monAn.id)}
              isVisited={isVisited(monAn.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Bạn chưa có món ăn nào trong danh sách muốn thử.</p>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;