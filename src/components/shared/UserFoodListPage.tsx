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
import { toggleListItem } from '@/lib/user-actions';
import { toast } from 'sonner';
import { MonAn } from '@/types';

interface UserFoodListPageProps {
  title: string;
  foodItems: MonAn[];
}

export function UserFoodListPage({ title, foodItems }: UserFoodListPageProps) {
  const { session, userLists, setUserLists } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [filteredFood, setFilteredFood] = useState<MonAn[]>([]);

  const uniqueCities = useMemo(() => {
    const cities = new Set(foodItems.map(item => item.thanhPho));
    return ['all', ...Array.from(cities)];
  }, [foodItems]);

  useEffect(() => {
    let results = [...foodItems];

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      results = results.filter(item =>
        item.ten.toLowerCase().includes(lowercasedTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm)) ||
        item.diaChi.toLowerCase().includes(lowercasedTerm)
      );
    }

    if (selectedCity !== 'all') {
      results = results.filter(item => item.thanhPho === selectedCity);
    }

    setFilteredFood(results);
  }, [searchTerm, selectedCity, foodItems]);

  const handleToggle = async (listType: 'favorites' | 'wishlist' | 'visited', foodId: string) => {
    if (!session) {
      toast.error("Bạn cần đăng nhập để thực hiện chức năng này.");
      return;
    }
    const updatedLists = await toggleListItem(session.user.id, foodId, listType, userLists);
    if (updatedLists) setUserLists(updatedLists);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{title}</h1>

      <div className="mb-8 max-w-xl flex flex-col sm:flex-row gap-4">
        <Input
          type="search"
          placeholder="Tìm trong danh sách..."
          className="w-full text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Chọn thành phố" />
          </SelectTrigger>
          <SelectContent>
            {uniqueCities.map(city => (
              <SelectItem key={city} value={city}>
                {city === 'all' ? 'Tất cả thành phố' : city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {foodItems.length === 0 ? (
         <div className="text-center py-16">
          <p className="text-xl text-gray-700 dark:text-gray-300">Danh sách của bạn đang trống.</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Hãy khám phá và thêm các món ăn bạn thích nhé!</p>
        </div>
      ) : filteredFood.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-700 dark:text-gray-300">Không tìm thấy kết quả nào phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFood.map((item) => {
            const isFavorite = userLists.favorites.includes(item.id);
            const isWishlisted = userLists.wishlist.includes(item.id);
            const isVisited = userLists.visited.includes(item.id);

            return (
              <Card key={item.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                <CardHeader className="p-0 relative">
                  <Link to={`/mon/${item.id}`}>
                    <img src={item.hinhAnh[0]} alt={item.ten} className="w-full h-48 object-cover" />
                  </Link>
                  <div className="absolute top-2 right-2 flex flex-col space-y-2">
                    <Button variant="ghost" size="icon" className={`rounded-full h-8 w-8 bg-white/80 ${isFavorite ? 'text-red-500' : ''}`} onClick={() => handleToggle('favorites', item.id)}>
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className={`rounded-full h-8 w-8 bg-white/80 ${isWishlisted ? 'text-blue-500' : ''}`} onClick={() => handleToggle('wishlist', item.id)}>
                      <Star className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className={`rounded-full h-8 w-8 bg-white/80 ${isVisited ? 'text-green-500' : ''}`} onClick={() => handleToggle('visited', item.id)}>
                      <Eye className={`h-5 w-5 ${isVisited ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <CardTitle className="text-lg font-semibold">
                    <Link to={`/mon/${item.id}`}>{item.ten}</Link>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {item.diaChi}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {item.tags.slice(0, 3).map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}