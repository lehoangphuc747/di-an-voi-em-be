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

interface RandomFoodPickerProps {
  wishlist: string[];
  allMonAn: MonAn[];
  allCategories: LoaiMon[];
  allCities: string[];
}

const loaiMonMap = new Map<string, LoaiMon>();
loaiMonData.forEach(loai => loaiMonMap.set(loai.id, loai));

export const RandomFoodPicker = ({ wishlist, allMonAn, allCategories, allCities }: RandomFoodPickerProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMonAn, setSelectedMonAn] = useState<MonAn | null>(null);
  const [searchScope, setSearchScope] = useState<'wishlist' | 'all'>('wishlist');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const handlePick = () => {
    const wishlistMonAn = allMonAn.filter(m => wishlist.includes(m.id));
    let sourceList = searchScope === 'wishlist' ? wishlistMonAn : allMonAn;

    // Apply filters
    if (selectedCity !== 'all') {
      sourceList = sourceList.filter(m => m.branches.some(branch => branch.thanhPho === selectedCity));
    }
    if (selectedCategory !== 'all') {
      sourceList = sourceList.filter(m => m.loaiIds.includes(selectedCategory));
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
          <Tabs value={searchScope} onValueChange={(value) => setSearchScope(value as 'wishlist' | 'all')} className="w-full mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="wishlist">Từ "Muốn thử"</TabsTrigger>
              <TabsTrigger value="all">Từ tất cả</TabsTrigger>
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