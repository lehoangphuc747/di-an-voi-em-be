"use client";

import { useMemo } from 'react';
import { useSession } from '@/components/SessionContextProvider';
import { useAllMonAn } from '@/hooks/use-all-food-items';
import { UserFoodListPage } from '@/components/shared/UserFoodListPage';
import { Skeleton } from '@/components/ui/skeleton';

export default function WishlistPage() {
  const { userLists, isLoading } = useSession();
  const { allMonAn, isLoading: isFoodLoading } = useAllMonAn();

  const wishlistItems = useMemo(() => {
    if (isLoading || isFoodLoading) return [];
    const wishlistIds = new Set(userLists.wishlist);
    return allMonAn.filter(item => wishlistIds.has(item.id));
  }, [userLists.wishlist, allMonAn, isLoading, isFoodLoading]);

  if (isLoading || isFoodLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-1/3 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
        </div>
      </div>
    );
  }

  return <UserFoodListPage title="Danh sách Muốn thử" foodItems={wishlistItems} />;
}