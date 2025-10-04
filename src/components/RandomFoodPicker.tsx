import { useState } from 'react';
import { MonAn, LoaiMon } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dices } from 'lucide-react';
import { MonAnCard } from './MonAnCard';
import { showError } from '@/utils/toast';
import loaiMonData from "@/data/loaimon.json";
import { YeuThich } from '@/types'; // Import YeuThich type
import { isStoreOpen } from '@/lib/time-utils'; // Import isStoreOpen

interface RandomFoodPickerProps {
  favorites: YeuThich[]; // Thêm danh sách yêu thích
  wishlist: string[];
  visited: { monAnId: string; rating: number | null; notes: string | null }[]; // Thêm danh sách đã thử
  allMonAn: MonAn[];
  allCategories: LoaiMon[];
  allCities: string[];
}

const loaiMonMap = new Map<string, LoaiMon>();
loaiMonData.forEach(loai => loaiMonMap.set(loai.id, loai));

export const RandomFoodPicker = ({ favorites, wishlist, visited, allMonAn, allCategories, allCities }: RandomFoodPickerProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMonAn, setSelectedMonAn] = useState<MonAn | null>(null);
  const [searchScope, setSearchScope] = useState<'wishlist' | 'all' | 'favorites' | 'visited'>('wishlist'); // Cập nhật searchScope
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedOpeningStatus, setSelectedOpeningStatus] = useState<'all' | 'open' | 'closed'>('all'); // Thêm trạng thái mở cửa

  const handlePick = () => {
    let baseList: MonAn[] = [];

    if (searchScope === 'wishlist') {
      baseList = allMonAn.filter(m => wishlist.includes(m.id));
    } else if (searchScope === 'favorites') {
      const favoriteIds = new Set(favorites.map(f => f.monAnId));
      baseList = allMonAn.filter(m => favoriteIds.has(m.id));
    } else if (searchScope === 'visited') {
      const visitedIds = new Set(visited.map(v => v.monAnId));
      baseList = allMonAn.filter(m => visitedIds.has(m.id));
    } else { // 'all'
      baseList = allMonAn;
    }

    let sourceList = baseList;

    // Apply filters
    if (selectedCity !== 'all') {
      sourceList = sourceList.filter(m => m.thanhPho === selectedCity);
    }
    if (selectedCategory !== 'all') {
      sourceList = sourceList.filter(m => m.loaiIds.includes(selectedCategory));
    }
    if (selectedOpeningStatus !== 'all') {
      sourceList = sourceList.filter(m => {
        const isOpen = isStoreOpen(m.gioMoCua);
        if (isOpen === null) return false; // If no opening hours, consider it not matching
        return selectedOpeningStatus === 'open' ? isOpen : !isOpen;
      });
    }

    if (sourceList.length === 0) {
      setSelectedMonAn(null);
      showError('Không tìm thấy món ăn nào phù hợp với bộ lọc của bạn.');
      return;
    }

    const randomIndex = Math.floor(Math.random() * sourceList.length);
    setSelectedMonAn(sourceList[randomIndex]);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full text-lg">
          <Dices className="mr-2 h-5 w-5" />
          Ăn gì hôm nay?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gợi ý ngẫu nhiên</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Tabs value={searchScope} onValueChange={(value) => setSearchScope(value as 'wishlist' | 'all' | 'favorites' | 'visited')} className="w-full mb-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="favorites">Yêu thích</TabsTrigger>
              <TabsTrigger value="wishlist">Muốn thử</TabsTrigger>
              <TabsTrigger value="visited">Ăn rùi</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại món" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại món</SelectItem>
                {allCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.ten}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4">
            <Select value={selectedOpeningStatus} onValueChange={(value) => setSelectedOpeningStatus(value as 'all' | 'open' | 'closed')}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái mở cửa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="open">Đang mở</SelectItem>
                <SelectItem value="closed">Đóng cửa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="min-h-[300px] flex items-center justify-center">
            {selectedMonAn ? (
              <MonAnCard 
                monAn={selectedMonAn} 
                loaiMon={selectedMonAn.loaiIds.map(id => loaiMonMap.get(id)).filter(Boolean) as LoaiMon[]}
              />
            ) : (
              <p className="text-muted-foreground text-center">Nhấn nút "Chọn giúp tôi!" để nhận gợi ý.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handlePick} className="w-full">
            <Dices className="mr-2 h-4 w-4" />
            Chọn giúp tôi!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};