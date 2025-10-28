import { useState } from "react";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { MapPin, ExternalLink, Copy, Heart, Bookmark, CheckCircle2, Facebook, Clock, List, LayoutGrid, ArrowLeft, Phone, Share2, Trash2, Edit, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useFoodLists } from "@/hooks/use-food-lists";
import { showError, showSuccess } from "@/utils/toast";
import { findMonAnById } from "@/data/data-loader";
import { cn } from "@/lib/utils";
import { UserFeedbackSection } from "@/components/features/detail/UserFeedbackSection";
import { isStoreOpen } from "@/lib/time-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from '@/components/SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const formatPrice = (price: number) => `${(price / 1000).toFixed(0)}k`;

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isViewerOpen, setIsViewerOpen] = useState(0); // Use number for selected image index
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); // Changed default to 'grid'
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useSession();
  const { 
    addFavorite, removeFavorite, isFavorite,
    toggleWishlist, isWishlist,
    toggleVisited, isVisited
  } = useFoodLists();

  const monAn = findMonAnById(id);

  if (!monAn) {
    return <Navigate to="/404" replace />;
  }

  const openImageViewer = (index: number) => {
    setIsViewerOpen(index + 1); // Use 1-based index for dialog open state
  };

  const handleShare = async () => {
    const shareData = {
      title: monAn.ten,
      text: `Cùng xem thử "${monAn.ten}" nhé!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showSuccess("Đã sao chép liên kết vào clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
      showError("Không thể chia sẻ vào lúc này.");
    }
  };

  const isCurrentlyFavorite = isFavorite(monAn.id);
  const isCurrentlyOnWishlist = isWishlist(monAn.id);
  const hasBeenVisited = isVisited(monAn.id);

  const handleToggleFavorite = () => {
    if (isCurrentlyFavorite) {
      removeFavorite(monAn.id);
    } else {
      addFavorite(monAn.id);
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlist(monAn.id);
  };

  const handleToggleVisited = () => {
    toggleVisited(monAn.id);
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
      .then(() => showSuccess("Đã sao chép địa chỉ!"))
      .catch(() => showError("Không thể sao chép địa chỉ."));
  };

  const handleCopyPhoneNumber = (phoneNumber: string) => {
    navigator.clipboard.writeText(phoneNumber)
      .then(() => showSuccess("Đã sao chép số điện thoại!"))
      .catch(() => showError("Không thể sao chép số điện thoại."));
  };

  const handleDeleteMonAn = async () => {
    if (!user || monAn.user_id !== user.id) {
      showError("Bạn không có quyền xóa món ăn này.");
      return;
    }
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('user_submitted_mon_an')
        .delete()
        .eq('id', monAn.id)
        .eq('user_id', user.id);

      if (error) throw error;

      showSuccess("Món ăn đã được xóa thành công!");
      navigate('/profile'); // Navigate to profile or home page after deletion
    } catch (error: any) {
      console.error("Error deleting food item:", error);
      showError(`Lỗi khi xóa món ăn: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const priceRange =
    monAn.giaMin && monAn.giaMax
      ? `${formatPrice(monAn.giaMin)} - ${formatPrice(monAn.giaMax)}`
      : monAn.giaMax
      ? `Dưới ${formatPrice(monAn.giaMax)}`
      : monAn.giaMin
      ? `Từ ${formatPrice(monAn.giaMin)}`
      : "Chưa cập nhật";

  const isOpen = isStoreOpen(monAn.gioMoCua);

  const isOwner = user && monAn.user_id === user.id;

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{monAn.ten}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {monAn.tags.map(tag => (
              <Link key={tag} to={`/?searchTerm=${encodeURIComponent(tag)}`}>
                <Badge className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">{tag}</Badge>
              </Link>
            ))}
          </div>
          <p className="text-muted-foreground mb-6">{monAn.moTa}</p>
          
          <div className="space-y-4 mb-6">
            <h2 className="text-2xl font-bold">Thông tin liên hệ</h2>
            <Card className="p-4">
              <CardContent className="p-0 space-y-2">
                {monAn.diaChi && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-primary" />
                    <div>
                      <p className="font-semibold">{monAn.diaChi}</p>
                      <p className="text-sm text-muted-foreground">{monAn.thanhPho}</p>
                    </div>
                  </div>
                )}
                {monAn.gioMoCua && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-3 flex-shrink-0 text-primary" />
                    <span>{monAn.gioMoCua}</span>
                    {isOpen !== null && (
                      <>
                        <span className="mx-1.5">·</span>
                        <span className={cn(
                          "font-semibold",
                          isOpen ? "text-green-600" : "text-red-600"
                        )}>
                          {isOpen ? "Đang mở" : "Đóng cửa"}
                        </span>
                      </>
                    )}
                  </div>
                )}
                {monAn.soDienThoai && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 flex-shrink-0 text-primary" />
                    <span>{monAn.soDienThoai}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleCopyPhoneNumber(monAn.soDienThoai!)} className="ml-2">
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Sao chép số điện thoại</span>
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  {monAn.googleMapLink && (
                    <a href={monAn.googleMapLink} target="_blank" rel="noopener noreferrer">
                      <Button size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Mở trên Google Maps
                      </Button>
                    </a>
                  )}
                  {monAn.diaChi && (
                    <Button variant="outline" size="sm" onClick={() => handleCopyAddress(monAn.diaChi)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Sao chép địa chỉ
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="flex items-center">
              <span className="font-semibold mr-2 text-primary">Giá:</span>
              <span>{priceRange}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {monAn.facebookLink && (
              <a href={monAn.facebookLink} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
              </a>
            )}
          </div>
          <Separator className="my-6" />
          <div className="flex flex-wrap gap-2">
            <Button variant={isCurrentlyFavorite ? "destructive" : "outline"} onClick={handleToggleFavorite}>
              <Heart className={`h-4 w-4 mr-2 ${isCurrentlyFavorite ? 'fill-current' : ''}`} />
              {isCurrentlyFavorite ? "Bỏ yêu thích" : "Yêu thích"}
            </Button>
            <Button variant={isCurrentlyOnWishlist ? "secondary" : "outline"} onClick={handleToggleWishlist}>
              <Bookmark className={`h-4 w-4 mr-2 ${isCurrentlyOnWishlist ? 'fill-current' : ''}`} />
              {isCurrentlyOnWishlist ? "Bỏ lưu 'Muốn thử'" : "Lưu 'Muốn thử'"}
            </Button>
            <Button variant={hasBeenVisited ? "secondary" : "outline"} onClick={handleToggleVisited}>
              <CheckCircle2 className={`h-4 w-4 mr-2 ${hasBeenVisited ? 'text-green-500' : ''}`} />
              {hasBeenVisited ? "Bỏ đánh dấu 'Ăn rùi'" : "Đánh dấu 'Ăn rùi'"}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Chia sẻ
            </Button>

            {isOwner && (
              <>
                <Button variant="outline" onClick={() => navigate(`/submit-food/${monAn.id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa món ăn
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bạn có chắc chắn muốn xóa món ăn này?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Món ăn sẽ bị xóa vĩnh viễn khỏi danh sách.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteMonAn} disabled={isDeleting}>
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        <UserFeedbackSection monAnId={monAn.id} />

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Hình ảnh</h2>
            <div className="flex items-center gap-1">
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                <List className="h-5 w-5" />
              </Button>
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                <LayoutGrid className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {(monAn.hinhAnh && monAn.hinhAnh.length > 0 && monAn.hinhAnh[0] !== '/placeholder.svg') ? (
            <div className={cn(viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-2 md:grid-cols-3 gap-4')}>
              {monAn.hinhAnh.map((img, index) => (
                <button key={index} className="w-full block rounded-lg overflow-hidden shadow-lg cursor-pointer group" onClick={() => openImageViewer(index)}>
                  <img 
                    src={img} 
                    alt={`${monAn.ten} - ảnh ${index + 1}`} 
                    className={cn(
                      "w-full object-cover transition-transform duration-300 group-hover:scale-105",
                      viewMode === 'list' ? 'h-auto' : 'h-full aspect-square'
                    )}
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Chưa có hình ảnh cho món này.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isViewerOpen > 0} onOpenChange={() => setIsViewerOpen(0)}>
        <DialogContent className="max-w-4xl w-full p-2 sm:p-4">
          <Carousel opts={{ startIndex: isViewerOpen - 1, loop: true }} className="w-full">
            <CarouselContent>
              {monAn.hinhAnh.map((img, index) => (
                <CarouselItem key={index}>
                  <div className="flex items-center justify-center h-[80vh]">
                    <img src={img} alt={`${monAn.ten} - ảnh ${index + 1}`} className="max-w-full max-h-full object-contain" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 sm:left-4" />
            <CarouselNext className="right-2 sm:right-4" />
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DetailPage;