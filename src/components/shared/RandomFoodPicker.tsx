"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MonAn, LoaiMon } from '@/types';
import { useFoodLists } from '@/hooks/use-food-lists';
import { useAllMonAn } from '@/hooks/use-all-food-items';
import loaiMonData from '@/data/food-categories.json';
import { Link } from 'react-router-dom';
import { Dices } from 'lucide-react';

export const RandomFoodPicker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<MonAn | null>(null);
  const [searchScope, setSearchScope] = useState('all');
  const { favorites, wishlist } = useFoodLists();
  const { allMonAn } = useAllMonAn();

  const loaiMonMap = new Map<string, LoaiMon>();
  loaiMonData.forEach(loai => loaiMonMap.set(loai.id, loai));

  const pickRandomFood = () => {
    let baseList: MonAn[] = [];

    if (searchScope === 'all') {
      baseList = allMonAn;
    } else if (searchScope === 'favorites') {
      const favoriteIds = new Set(favorites.map(f => f.monAnId)); // Corrected this line
      baseList = allMonAn.filter(m => favoriteIds.has(m.id));
    } else if (searchScope === 'wishlist') {
      const wishlistIds = new Set(wishlist);
      baseList = allMonAn.filter(m => wishlistIds.has(m.id));
    }

    if (baseList.length > 0) {
      const randomIndex = Math.floor(Math.random() * baseList.length);
      setSelectedFood(baseList[randomIndex]);
    } else {
      setSelectedFood(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Ăn gì giờ?</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hôm nay ăn gì?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Chọn phạm vi tìm kiếm và để chúng tôi gợi ý một món ăn ngẫu nhiên cho bạn!</p>
          <Select value={searchScope} onValueChange={setSearchScope}>
            <SelectTrigger>
              <SelectValue placeholder="Phạm vi tìm kiếm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả món ăn</SelectItem>
              <SelectItem value="favorites">Món yêu thích</SelectItem>
              <SelectItem value="wishlist">Món muốn thử</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={pickRandomFood} className="w-full">
            <Dices className="mr-2 h-4 w-4" />
            Tìm món ăn cho tôi!
          </Button>
          {selectedFood && (
            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="font-bold text-lg">{selectedFood.ten}</h3>
              <p className="text-sm text-muted-foreground">{selectedFood.diaChi}</p>
              <Link to={`/mon/${selectedFood.id}`} onClick={() => setIsOpen(false)}>
                <Button variant="link" className="p-0 h-auto mt-2">Xem chi tiết</Button>
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};