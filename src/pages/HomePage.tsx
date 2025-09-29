import { useState, useMemo, useEffect, useCallback } from "react";
import { MonAn, LoaiMon } from "@/types/index";
import { MonAnCard } from "@/components/MonAnCard";
import { FilterSidebar, PriceRange } from "@/components/FilterSidebar";
import { FilterDrawer } from "@/components/FilterDrawer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { useIsMobile } from "@/hooks/use-mobile";
import { monAnData } from "@/data/loader";
import loaiMonData from "@/data/loaimon.json";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom"; // Import useSearchParams

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

const PRICE_RANGES: (PriceRange & { min: number; max: number })[] = [
  { id: 'all', ten: 'Tất cả', min: 0, max: Infinity },
  { id: 'under-100', ten: 'Dưới 100k', min: 0, max: 100000 },
  { id: '100-200', ten: '100k - 200k', min: 100000, max: 200000 },
  { id: '200-300', ten: '200k - 300k', min: 200000, max: 300000 },
  { id: '300-500', ten: '300k - 500k', min: 300000, max: 500000 },
  { id: 'over-500', ten: 'Trên 500k', min: 500000, max: Infinity },
];

const HomePage = () => {
  const [userSubmittedMonAn, setUserSubmittedMonAn] = useState<MonAn[]>([]);
  const [loadingSubmitted, setLoadingSubmitted] = useState(true);
  const [searchParams] = useSearchParams(); // Initialize useSearchParams

  const [loaiMonMap] = useState<Map<string, LoaiMon>>(() => {
    const map = new Map<string, LoaiMon>();
    loaiMonData.forEach(loai => map.set(loai.id, loai));
    return map;
  });

  const isMobile = useIsMobile();

  // Initialize searchTerm from URL query parameter
  const [searchTerm, setSearchTerm] = useState(searchParams.get('searchTerm') || "");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRangeId, setSelectedPriceRangeId] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Effect to update searchTerm if URL search parameter changes (e.g., navigating from a tag)
  useEffect(() => {
    const urlSearchTerm = searchParams.get('searchTerm') || '';
    if (searchTerm !== urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams]); // Depend on searchParams to react to URL changes

  const fetchUserSubmittedMonAn = useCallback(async () => {
    setLoadingSubmitted(true);
    const { data, error } = await supabase
      .from('user_submitted_mon_an')
      .select('*')
      .eq('is_approved', true); // Chỉ lấy các món ăn đã được duyệt

    if (error) {
      console.error("Error fetching user submitted food items:", error);
      showError('Lỗi khi tải món ăn do người dùng gửi.');
      setUserSubmittedMonAn([]);
    } else {
      // Chuyển đổi tên cột từ snake_case sang camelCase để phù hợp với MonAn interface
      const formattedData: MonAn[] = data.map(item => ({
        id: item.id,
        ten: item.ten,
        loaiId: item.loai_id,
        hinhAnh: item.hinh_anh || [],
        moTa: item.mo_ta || '',
        diaChi: item.dia_chi,
        thanhPho: item.thanh_pho,
        googleMapLink: item.google_map_link || '',
        facebookLink: item.facebook_link || '',
        tags: item.tags || [],
        giaMin: item.gia_min || undefined,
        giaMax: item.gia_max || undefined,
        ngayTao: item.ngay_tao,
      }));
      setUserSubmittedMonAn(formattedData);
    }
    setLoadingSubmitted(false);
  }, []);

  useEffect(() => {
    fetchUserSubmittedMonAn();
  }, [fetchUserSubmittedMonAn]);

  const allMonAn = useMemo(() => {
    // Kết hợp dữ liệu tĩnh và dữ liệu từ Supabase
    return [...monAnData, ...userSubmittedMonAn];
  }, [monAnData, userSubmittedMonAn]);

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
        ? selectedCategories.includes(mon.loaiId) 
        : true;
      
      const priceMatch = (() => {
        if (selectedPriceRangeId === 'all') return true;
        const range = PRICE_RANGES.find(r => r.id === selectedPriceRangeId);
        if (!range) return true;

        const itemPrice = mon.giaMin ?? mon.giaMax;
        if (itemPrice === undefined) return false;

        return itemPrice >= range.min && itemPrice < range.max;
      })();
      
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
  }, [allMonAn, debouncedSearchTerm, selectedCities, selectedCategories, selectedPriceRangeId, sortOption]);

  const filterContent = (
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
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="sr-only">Đang tải món ăn...</span>
          </div>
        ) : filteredAndSortedMonAn.length > 0 ? (
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