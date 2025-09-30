import { useFoodLists } from "@/hooks/use-food-lists";
import { MonAnCard } from "@/components/MonAnCard";
import loaiMonData from "@/data/loaimon.json";
import { MonAn, LoaiMon } from "@/types";
import { useAllMonAn } from "@/hooks/use-all-mon-an";
import { Loader2 } from "lucide-react";

const VisitedPage = () => {
  const { visited, isFavorite, isWishlist } = useFoodLists();
  const { allMonAn, isLoading } = useAllMonAn();
  
  const loaiMonMap = new Map<string, LoaiMon>();
  loaiMonData.forEach(loai => loaiMonMap.set(loai.id, loai));

  const visitedMonAnIds = new Set(visited);
  const visitedMonAnList: MonAn[] = allMonAn.filter(m => visitedMonAnIds.has(m.id));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Ăn rùi (Đã thử)</h1>
      {visitedMonAnList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {visitedMonAnList.map((monAn) => (
            <MonAnCard 
              key={monAn.id} 
              monAn={monAn} 
              loaiMon={monAn.loaiIds.map(id => loaiMonMap.get(id)).filter(Boolean) as LoaiMon[]}
              isVisited={true}
              isFavorite={isFavorite(monAn.id)}
              isWishlist={isWishlist(monAn.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Bạn chưa đánh dấu món ăn nào đã thử.</p>
        </div>
      )}
    </div>
  );
};

export default VisitedPage;