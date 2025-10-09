"use client";

import { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, Eye } from 'lucide-react';
import { useSession } from '@/components/SessionContextProvider';
import { toggleListItem } from '@/lib/userActions';
import { toast } from 'sonner';
import { MonAn } from '@/types';
import foodData from '@/data/monan';
import loaiMonData from '@/data/loaimon.json';

export default function HomePage() {
  const { session, userLists, setUserLists } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredFood, setFilteredFood] = useState<MonAn[]>([]);

  const allFoodItems = useMemo(() => Object.values(foodData), []);

  const uniqueCities = useMemo(() => {
    const cities = new Set(allFoodItems.map(item => item.thanhPho));
    return ['all', ...Array.from(cities)];
  }, [allFoodItems]);

  useEffect(() => {
    let results = [...allFoodItems];

    // Filter by search term
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      results = results.filter(item =>
        item.ten.toLowerCase().includes(lowercasedTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm)) ||
        item.diaChi.toLowerCase().includes(lowercasedTerm)
      );
    }

    // Filter by city
    if (selectedCity !== 'all') {
      results = results.filter(item => item.thanhPho === selectedCity);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(item => item.loaiIds.includes(selectedCategory));
    }

    setFilteredFood(results);
  }, [searchTerm, selectedCity, selectedCategory, allFoodItems]);

  const handleToggle = async (listType: 'favorites' | 'wishlist' | 'visited', foodId: string) => {
    if (!session) {
      toast.error("Bạn cần đăng nhập để thực hiện chức năng này.");
      return;
    }

    const updatedLists = await toggleListItem(session.user.id, foodId, listType, userLists);
    if (updatedLists) {
      setUserLists(updatedLists);
      let message = '';
      const foodName = allFoodItems.find(f => f.id === foodId)?.ten || 'Món ăn';
      const isInList = updatedLists[listType].includes(foodId);

      if (listType === 'favorites') {
        message = isInList ? `Đã thêm "${foodName}" vào Yêu thích` : `Đã xóa "${foodName}" khỏi Yêu thích`;
      } else if (listType === 'wishlist') {
        message = isInList ? `Đã thêm "${foodName}" vào Muốn thử` : `Đã xóa "${foodName}" khỏi Muốn thử`;
      } else {
        message = isInList ? `Đã đánh dấu "${foodName}" là Đã thử` : `Đã bỏ đánh dấu "${foodName}"`;
      }
      toast.success(message);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl">
          Khám Phá Ẩm Thực Đà Lạt
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Tìm kiếm những món ăn ngon, những địa điểm hấp dẫn không thể bỏ lỡ tại thành phố ngàn hoa.
        </p>
        <div className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
          <Input
            type="search"
            placeholder="Tìm món ăn, địa chỉ, tag..."
            className="w-full text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-4">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Chọn thành phố" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCities.map(city => (
                  <SelectItem key={city} value={city}>
                    {city === 'all' ? 'Tất cả TP' : city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Chọn loại món" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {loaiMonData.map(loai => (
                  <SelectItem key={loai.id} value={loai.id}>{loai.ten}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFood.map((item) => {
          const isFavorite = userLists.favorites.includes(item.id);
          const isWishlisted = userLists.wishlist.includes(item.id);
          const isVisited = userLists.visited.includes(item.id);

          return (
            <Card key={item.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="p-0 relative">
                <Link to={`/mon/${item.id}`}>
                  <img
                    src={item.hinhAnh[0]}
                    alt={item.ten}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="absolute top-2 right-2 flex flex-col space-y-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full h-8 w-8 bg-white/80 hover:bg-white ${isFavorite ? 'text-red-500' : 'text-gray-600'}`}
                    onClick={() => handleToggle('favorites', item.id)}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full h-8 w-8 bg-white/80 hover:bg-white ${isWishlisted ? 'text-blue-500' : 'text-gray-600'}`}
                    onClick={() => handleToggle('wishlist', item.id)}
                  >
                    <Star className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </Button>
                   <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full h-8 w-8 bg-white/80 hover:bg-white ${isVisited ? 'text-green-500' : 'text-gray-600'}`}
                    onClick={() => handleToggle('visited', item.id)}
                  >
                    <Eye className={`h-5 w-5 ${isVisited ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg font-semibold hover:text-indigo-600">
                  <Link to={`/mon/${item.id}`}>{item.ten}</Link>
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  {item.diaChi}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="flex flex-wrap gap-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {filteredFood.length === 0 && (
        <div className="text-center py-16">
          <p className="text-xl text-gray-700 dark:text-gray-300">Không tìm thấy kết quả nào phù hợp.</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm nhé.</p>
        </div>
      )}
    </div>
  );
}