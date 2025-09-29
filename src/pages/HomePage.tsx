import { useState, useMemo } from "react";
import { MonAn, LoaiMon } from "@/types/index";
import { MonAnCard } from "@/components/MonAnCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { FilterDrawer } from "@/components/FilterDrawer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { useIsMobile } from "@/hooks/use-mobile";
import { monAnData } from "@/data/loader";
import loaiMonData from "@/data/loaimon.json";

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

const HomePage = () => {
  const [monAnList] = useState<MonAn[]>(monAnData);
  const [loaiMonMap] = useState<Map<string, LoaiMon>>(() => {
    const map = new Map<string, LoaiMon>();
    loaiMonData.forEach(loai => map.set(loai.id, loai));
    return map;
  });

  const isMobile = useIsMobile();

  const maxPrice = useMemo(() => {
    return Math.max(...monAnData.map(m => m.giaMax || m.giaMin || 0));
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [sortOption, setSortOption] = useState<SortOption>("newest");

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

  const filteredAndSortedMonAn = useMemo(() => {
    let filtered = monAnList.filter(mon => {
      const searchMatch = debouncedSearchTerm 
        ? mon.ten.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) 
        : true;
      const cityMatch = selectedCities.length > 0 
        ? selectedCities.includes(mon.thanhPho) 
        : true;
      const categoryMatch = selectedCategories.length > 0 
        ? selectedCategories.includes(mon.loaiId) 
        : true;
      const priceMatch = (mon.giaMin || 0) >= priceRange[0] && (mon.giaMax || mon.giaMin || Infinity) <= priceRange[1];
      
      return searchMatch && cityMatch && categoryMatch && priceMatch;
    });

    switch (sortOption) {
      case "price-asc":
        filtered.sort((a, b) => (a.giaMin || 0) - (b.giaMin || 0));
        break;
      case "price-desc":
        filtered.sort((a, b) => (b.giaMin || 0) - (a.giaMin || 0));
        break;
      case "name-asc":
        filtered.sort((a, b) => a.ten.localeCompare(b.ten));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime());
        break;
    }

    return filtered;
  }, [monAnList, debouncedSearchTerm, selectedCities, selectedCategories, priceRange, sortOption]);

  const filterContent = (
    <FilterSidebar
      cities={allCities}
      categories={allCategories}
      selectedCities={selectedCities}
      onCityChange={handleCityChange}
      selectedCategories={selectedCategories}
      onCategoryChange={handleCategoryChange}
      priceRange={priceRange}
      onPriceChange={(value) => setPriceRange(value as [number, number])}
      maxPrice={maxPrice}
    />
  );

  return (
    <div className="grid lg:grid-cols-[280px_1fr] lg:gap-8">
      {isMobile ? (
        <FilterDrawer>{filterContent}</FilterDrawer>
      ) : (
        <aside className="sticky top-20 h-fit">
          <h2 className="text-xl font-semibold mb-4">Bộ lọc</h2>
          {filterContent}
        </aside>
      )}
      
      <main>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            type="text"
            placeholder="Tìm kiếm tên món ăn..."
            className="flex-grow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="price-asc">Giá: Thấp đến Cao</SelectItem>
              <SelectItem value="price-desc">Giá: Cao đến Thấp</SelectItem>
              <SelectItem value="name-asc">Tên: A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredAndSortedMonAn.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedMonAn.map((monAn) => (
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