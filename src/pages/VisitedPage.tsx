import { useFoodLists } from "@/hooks/use-food-lists";
import { MonAnCard } from "@/components/MonAnCard";
import { monAnData } from "@/data/loader";
import loaiMonData from "@/data/loaimon.json";
import { MonAn, LoaiMon } from "@/types";

const VisitedPage = () => {
  const { visited } = useFoodLists();
  
  const loaiMonMap = new Map<string, LoaiMon>();
  loaiMonData.forEach(loai => loaiMonMap.set(loai.id, loai));

  const visitedMonAnIds = new Set(visited);
  const visitedMonAnList: MonAn[] = monAnData.filter(m => visitedMonAnIds.has(m.id));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Ăn rùi (Đã thử)</h1>
      {visitedMonAnList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {visitedMonAnList.map((monAn) => (
            <MonAnCard 
              key={monAn.id} 
              monAn={monAn} 
              loaiMon={loaiMonMap.get(monAn.loaiId)} 
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