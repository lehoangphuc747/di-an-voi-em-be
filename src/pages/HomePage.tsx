import { useState, useEffect, useMemo } from "react";
import { MonAn, LoaiMon } from "@/types/index";
import { MonAnCard } from "@/components/MonAnCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import monAnData from "@/data/monan.json";
import loaiMonData from "@/data/loaimon.json";

const HomePage = () => {
  const [monAnList] = useState<MonAn[]>(() => 
    [...monAnData].sort((a, b) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime())
  );
  const [loaiMonMap] = useState<Map<string, LoaiMon>>(() => {
    const map = new Map<string, LoaiMon>();
    loaiMonData.forEach(loai => map.set(loai.id, loai));
    return map;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const allCities = useMemo(() => [...new Set(monAnData.map(m => m.thanhPho))], []);
  const allCategories = useMemo(() => [...loaiMonData], []);

  const handleCityChange = (city: string) => {
    setSelectedCities(prev => 
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    );
  };

  const filteredMonAn = useMemo(() => {
    return monAnList.filter(mon => {
      const searchMatch = debouncedSearchTerm 
        ? mon.ten.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) 
        : true;
      const cityMatch = selectedCities.length > 0 
        ? selectedCities.includes(mon.thanhPho) 
        : true;
      const categoryMatch = selectedCategories.length > 0 
        ? selectedCategories.includes(mon.loaiId) 
        : true;
      
      return searchMatch && cityMatch && categoryMatch;
    });
  }, [monAnList, debouncedSearchTerm, selectedCities, selectedCategories]);

  return (
    <div className="grid lg:grid-cols-[280px_1fr] lg:gap-8">
      <FilterSidebar
        cities={allCities}
        categories={allCategories}
        selectedCities={selectedCities}
        onCityChange={handleCityChange}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
      />
      <main>
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Tìm kiếm tên món ăn..."
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {filteredMonAn.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMonAn.map((monAn) => (
              <MonAnCard 
                key={monAn.id} 
                monAn={monAn} 
                loaiMon={loaiMonMap.get(monAn.loaiId)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy món ăn nào phù hợp.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;