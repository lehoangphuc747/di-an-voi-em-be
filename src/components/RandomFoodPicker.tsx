import { useState } from 'react';
import { MonAn, LoaiMon } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dices } from 'lucide-react';
import { MonAnCard } from './MonAnCard';
import { showError } from '@/utils/toast';
import loaiMonData from "@/data/loaimon.json";

interface RandomFoodPickerProps {
  wishlist: string[];
  allMonAn: MonAn[];
}

const loaiMonMap = new Map<string, LoaiMon>();
loaiMonData.forEach(loai => loaiMonMap.set(loai.id, loai));

export const RandomFoodPicker = ({ wishlist, allMonAn }: RandomFoodPickerProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMonAn, setSelectedMonAn] = useState<MonAn | null>(null);
  const [searchScope, setSearchScope] = useState<'wishlist' | 'all'>('wishlist');

  const handlePick = () => {
    const wishlistMonAn = allMonAn.filter(m => wishlist.includes(m.id));
    const sourceList = searchScope === 'wishlist' ? wishlistMonAn : allMonAn;

    if (sourceList.length === 0) {
      setSelectedMonAn(null);
      showError(searchScope === 'wishlist' ? 'Danh sách "Chờ embe" của bạn trống!' : 'Không có món ăn nào để chọn.');
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
              <TabsTrigger value="wishlist">Từ "Chờ embe"</TabsTrigger>
              <TabsTrigger value="all">Từ tất cả</TabsTrigger>
            </TabsList>
          </Tabs>
          
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