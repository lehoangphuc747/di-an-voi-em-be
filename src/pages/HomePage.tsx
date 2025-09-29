import { useState, useEffect } from "react";
import { MonAn, LoaiMon } from "@/types/index";
import { MonAnCard } from "@/components/MonAnCard";
import monAnData from "@/data/monan.json";
import loaiMonData from "@/data/loaimon.json";

const HomePage = () => {
  const [monAnList, setMonAnList] = useState<MonAn[]>([]);
  const [loaiMonMap, setLoaiMonMap] = useState<Map<string, LoaiMon>>(new Map());

  useEffect(() => {
    // Sắp xếp món ăn theo ngày tạo mới nhất
    const sortedMonAn = [...monAnData].sort((a, b) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime());
    setMonAnList(sortedMonAn);

    const map = new Map<string, LoaiMon>();
    loaiMonData.forEach(loai => map.set(loai.id, loai));
    setLoaiMonMap(map);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">Khám phá ẩm thực</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {monAnList.map((monAn) => (
          <MonAnCard 
            key={monAn.id} 
            monAn={monAn} 
            loaiMon={loaiMonMap.get(monAn.loaiId)} 
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;