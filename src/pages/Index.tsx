import { useState, useMemo } from "react";
import { MonAn, LoaiMon } from "@/types";
import { MonAnCard } from "@/components/MonAnCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { isStoreOpen } from "@/lib/time-utils";

// Import data
const monAnFiles = import.meta.glob('@/data/monan/*.json', { eager: true });
const loaiMonFiles = import.meta.glob('@/data/loaimon/*.json', { eager: true });

const allMonAn: MonAn[] = Object.values(monAnFiles).map((file: any) => file.default || file);
const allLoaiMon: LoaiMon[] = Object.values(loaiMonFiles).map((file: any) => file.default || file);

const allCities = [...new Set(allMonAn.map(m => m.thanhPho))];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const filteredMonAn = useMemo(() => {
    return allMonAn.filter(monAn => {
      const matchesSearch = monAn.ten.toLowerCase().includes(searchTerm.toLowerCase()) || monAn.diaChi.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = selectedCity === "all" || monAn.thanhPho === selectedCity;
      const matchesCategory = selectedCategory === "all" || monAn.loaiIds.includes(selectedCategory);
      const matchesOpen = !onlyOpen || isStoreOpen(monAn.gioMoCua) === true;

      return matchesSearch && matchesCity && matchesCategory && matchesOpen;
    });
  }, [searchTerm, selectedCity, selectedCategory, onlyOpen]);

  return (
    <div>
      <div className="mb-8 bg-secondary/50 p-6 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="lg:col-span-2">
            <Label htmlFor="search">Tìm kiếm món ăn</Label>
            <Input
              id="search"
              type="text"
              placeholder="Nhập tên món, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label>Thành phố</Label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn thành phố" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thành phố</SelectItem>
                {allCities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Loại món</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại món" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại món</SelectItem>
                {allLoaiMon.map(loai => (
                  <SelectItem key={loai.id} value={loai.id}>{loai.ten}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Switch id="open-now" checked={onlyOpen} onCheckedChange={setOnlyOpen} />
            <Label htmlFor="open-now">Chỉ hiển thị quán đang mở</Label>
          </div>
        </div>
      </div>

      {filteredMonAn.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMonAn.map(monAn => {
            const loaiMonForCard = allLoaiMon.filter(l => monAn.loaiIds.includes(l.id));
            return <MonAnCard key={monAn.id} monAn={monAn} loaiMon={loaiMonForCard} />;
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">Không tìm thấy kết quả</h2>
          <p className="text-muted-foreground mt-2">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
        </div>
      )}
    </div>
  );
};

export default Index;