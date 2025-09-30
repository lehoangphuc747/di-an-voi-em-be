import { useState, useMemo, useEffect } from "react";
import { MonAn, LoaiMon } from "@/types/index";
import { MonAnCard } from "@/components/MonAnCard";
import { FilterSidebar, PriceRange } from "@/components/FilterSidebar";
import { FilterDrawer } from "@/components/FilterDrawer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useIsMobile } from "@/hooks/use-mobile";
import loaiMonData from "@/data/loaimon.json";
import { RotateCcw } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { isStoreOpen } from "@/lib/time-utils";
import { useFoodLists } from "@/hooks/use-food-lists";
import { useAllMonAn } from "@/hooks/use-all-mon-an";
import { MonAnCardSkeleton } from "@/components/MonAnCardSkeleton";
import { RandomFoodPicker } from "@/components/RandomFoodPicker";

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";
type OpeningStatus = 'all' | 'open' | 'closed';

const PRICE_RANGES: (PriceRange & { min: number; max: number })[] = [
  { id: 'all', ten: 'Tất cả', min: 0, max: Infinity },
  { id: 'under-100', ten: 'Dưới 100k', min: 0, max: 100000 },
  { id: '100-200', ten: '100k - 200k', min: 100000, max: 200000 },
  { id: '200-300', ten: '200k - 300k', min: 200000, max: 300000 },
  { id: '300-500', ten: '300k - 500k', min: 300000, max: 500000 },
  { id: 'over-500', ten: 'Trên 500k', min: 500000, max: Infinity },
];

const ITEMS_PER_PAGE = 9;

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const { wishlist, isFavorite, isWishlist, isVisited } = useFoodLists();
  const { allMonAn, isLoading: loadingSubmitted } = useAllMonAn();

  const [loaiMonMap] = useState<Map<string, LoaiMon>>(() => {
    const map = new Map<string, LoaiMon>();
    loaiMonData.forEach(loai => map.set(loai.id, loai));
    return map;
  });

  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('searchTerm') || "");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRangeId, setSelectedPriceRangeId] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedOpeningStatus, setSelectedOpeningStatus] = useState<OpeningStatus>('all');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const urlSearchTerm = searchParams.get('searchTerm') || '';
    if (searchTerm !== urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams, searchTerm]);

  const allCities = useMemo(() => [...new Set(allMonAn.map(m => m.thanhPho))], [allMonAn]);
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

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCities([]);
    setSelectedCategories([]);
    setSelectedPriceRangeId('all');
    setSelectedOpeningStatus('all');
  };

  const filteredAndSortedMonAn = useMemo(() => {
    let filtered = allMonAn.filter(mon => {
      const searchTermLower = debouncedSearchTerm.toLowerCase();
      const searchMatch = debouncedSearchTerm 
        ? mon.ten.toLowerCase().includes(searchTermLower) || 
          mon.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
        : true;

      const cityMatch = selectedCities.length > 0 
        ? selectedCities.includes(mon.thanhPho) 
        : true;
      
      const categoryMatch = selectedCategories.length > 0
        ? selectedCategories.some(catId => mon.loaiIds.includes(catId))
        : true;
      
      const priceMatch = (() => {
        if (selectedPriceRangeId === 'all') return true;
        const range = PRICE_RANGES.find(r => r.id === selectedPriceRangeId);
        if (!range) return true;

        const itemPrice = mon.giaMin ?? mon.giaMax;
        if (itemPrice === undefined) return false;

        return itemPrice >= range.min && itemPrice < range.max;
      })();

      const statusMatch = (() => {
        if (selectedOpeningStatus === 'all') return true;
        
        const isOpen = isStoreOpen(mon.gioMoCua);

        if (isOpen === null) {
          return selectedOpeningStatus === 'open';
        }

        if (selectedOpeningStatus === 'open') return isOpen;
        if (selectedOpeningStatus === 'closed') return !isOpen;
        
        return true;
      })();
      
      return searchMatch && cityMatch && categoryMatch && priceMatch && statusMatch;
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
  }, [allMonAn, debouncedSearchTerm, selectedCities, selectedCategories, selectedPriceRangeId, sortOption, selectedOpeningStatus]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [filteredAndSortedMonAn]);

  const itemsToDisplay = useMemo(() => {
    return filteredAndSortedMonAn.slice(0, visibleCount);
  }, [filteredAndSortedMonAn, visibleCount]);

  const filterContent = (
    <div>
      <Button variant="ghost" onClick={handleResetFilters} className="w-full justify-start mb-2 text-sm text-muted-foreground hover:text-foreground">
        <RotateCcw className="mr-2 h-4 w-4" />
        Xóa bộ lọc
      </Button>
      <FilterSidebar
        cities={allCities}
        categories={allCategories}
        selectedCities={selectedCities}
        onCityChange={handleCityChange}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
        priceRanges={PRICE_RANGES}
        selectedPriceRangeId={selectedPriceRangeId}
        onPriceRangeChange={setSelectedPriceRangeId}
        selectedOpeningStatus={selectedOpeningStatus}
        onOpeningStatusChange={setSelectedOpeningStatus}
      />
    </div>
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
        <div className="mb-6">
          <RandomFoodPicker 
            wishlist={wishlist} 
            allMonAn={allMonAn} 
            allCategories={allCategories}
            allCities={allCities}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            type="text"
            placeholder="Tìm kiếm tên món ăn, tag..."
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

        {loadingSubmitted ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <MonAnCardSkeleton key={index} />
            ))}
          </div>
        ) : itemsToDisplay.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {itemsToDisplay.map((monAn) => (
                <MonAnCard 
                  key={monAn.id} 
                  monAn={monAn} 
                  loaiMon={monAn.loaiIds.map(id => loaiMonMap.get(id)).filter(Boolean) as LoaiMon[]}
                  isFavorite={isFavorite(monAn.id)}
                  isWishlist={isWishlist(monAn.id)}
                  isVisited={isVisited(monAn.id)}
                />
              ))}
            </div>
            {visibleCount < filteredAndSortedMonAn.length && (
              <div className="mt-8 text-center">
                <Button onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}>
                  Tải thêm
                </Button>
              </div>
            )}
          </>
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