import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { MapPin, ExternalLink, Copy, Heart, Bookmark, CheckCircle2, Facebook, List, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useFoodLists } from "@/hooks/use-food-lists";
import { showError, showSuccess } from "@/utils/toast";
import { findMonAnById } from "@/data/loader";
import { cn } from "@/lib/utils";
import { PublicNotesSection } from "@/components/PublicNotesSection"; // Import PublicNotesSection

const formatPrice = (price: number) => `${(price / 1000).toFixed(0)}k`;

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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
    setSelectedImageIndex(index);
    setIsViewerOpen(true);
  };

  const isCurrentlyFavorite = isFavorite(monAn.id);
  const isCurrentlyOnWishlist = isWishlist(monAn.id);
  const hasBeenVisited = isVisited(monAn.id);

  const handleToggleFavorite = () => {
    if (isCurrentlyFavorite) {
      removeFavorite(monAn.id);
      showSuccess("Đã xóa khỏi danh sách yêu thích");
    } else {
      addFavorite(monAn.id);
      showSuccess("Đã thêm vào danh sách yêu thích");
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlist(monAn.id);
    showSuccess(isCurrentlyOnWishlist ? "Đã xóa khỏi danh sách 'Chờ embe'" : "Đã thêm vào danh sách 'Chờ embe'");
  };

  const handleToggleVisited = () => {
    toggleVisited(monAn.id);
    showSuccess(hasBeenVisited ? "Đã bỏ đánh dấu 'Ăn rùi'" : "Đã đánh dấu 'Ăn rùi'");
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(monAn.diaChi)
      .then(() => showSuccess("Đã sao chép địa chỉ!"))
      .catch(() => showError("Không thể sao chép địa chỉ."));
  };

  const priceRange =
    monAn.giaMin && monAn.giaMax
      ? `${formatPrice(monAn.giaMin)} - ${formatPrice(monAn.giaMax)}`
      : monAn.giaMax
      ? `Dưới ${formatPrice(monAn.giaMax)}`
      : monAn.giaMin
      ? `Từ ${formatPrice(monAn.giaMin)}`
      : "Chưa cập nhật";

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Phần thông tin */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{monAn.ten}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {monAn.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
          </div>
          <p className="text-muted-foreground mb-6">{monAn.moTa}</p>
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-primary" />
              <div>
                <p className="font-semibold">{monAn.diaChi}</p>
                <p className="text-sm text-muted-foreground">{monAn.thanhPho}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-2 text-primary">Giá:</span>
              <span>{priceRange}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            <a href={monAn.googleMapLink} target="_blank" rel="noopener noreferrer">
              <Button>
                <ExternalLink className="h-4 w-4 mr-2" />
                Mở trên Google Maps
              </Button>
            </a>
            {monAn.facebookLink && (
              <a href={monAn.facebookLink} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
              </a>
            )}
            <Button variant="outline" onClick={handleCopyAddress}>
              <Copy className="h-4 w-4 mr-2" />
              Sao chép địa chỉ
            </Button>
          </div>
          <Separator className="my-6" />
          <div className="flex flex-wrap gap-2">
            <Button variant={isCurrentlyFavorite ? "destructive" : "outline"} onClick={handleToggleFavorite}>
              <Heart className={`h-4 w-4 mr-2 ${isCurrentlyFavorite ? 'fill-current' : ''}`} />
              {isCurrentlyFavorite ? "Bỏ yêu thích" : "Yêu thích"}
            </Button>
            <Button variant={isCurrentlyOnWishlist ? "secondary" : "outline"} onClick={handleToggleWishlist}>
              <Bookmark className={`h-4 w-4 mr-2 ${isCurrentlyOnWishlist ? 'fill-current' : ''}`} />
              {isCurrentlyOnWishlist ? "Bỏ lưu 'Chờ embe'" : "Lưu 'Chờ embe'"}
            </Button>
            <Button variant={hasBeenVisited ? "secondary" : "outline"} onClick={handleToggleVisited}>
              <CheckCircle2 className={`h-4 w-4 mr-2 ${hasBeenVisited ? 'text-green-500' : ''}`} />
              {hasBeenVisited ? "Bỏ đánh dấu 'Ăn rùi'" : "Đánh dấu 'Ăn rùi'"}
            </Button>
          </div>
        </div>

        {/* Phần ghi chú công khai */}
        <PublicNotesSection monAnId={monAn.id} />

        {/* Phần hình ảnh */}
        <div className="mt-8"> {/* Thêm margin-top để tạo khoảng cách */}
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

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl w-full p-2 sm:p-4">
          <Carousel opts={{ startIndex: selectedImageIndex, loop: true }} className="w-full">
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