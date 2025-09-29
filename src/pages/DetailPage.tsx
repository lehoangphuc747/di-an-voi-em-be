import { useParams, Navigate } from "react-router-dom";
import { MapPin, ExternalLink, Copy, Heart, Bookmark, CheckCircle2, Facebook } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useFoodLists } from "@/hooks/use-food-lists";
import { showError, showSuccess } from "@/utils/toast";
import monAnData from "@/data/monan.json";

const formatPrice = (price: number) => `${(price / 1000).toFixed(0)}k`;

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    addFavorite, removeFavorite, isFavorite,
    toggleWishlist, isWishlist,
    toggleVisited, isVisited
  } = useFoodLists();

  const monAn = monAnData.find(m => m.id === id);

  if (!monAn) {
    return <Navigate to="/404" replace />;
  }

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
      : "Không có thông tin";

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="p-0">
           <Carousel className="w-full rounded-t-lg overflow-hidden">
            <CarouselContent>
              {(monAn.hinhAnh && monAn.hinhAnh.length > 0) ? monAn.hinhAnh.map((img, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-w-16 aspect-h-9">
                    <img src={img} alt={`${monAn.ten} - ảnh ${index + 1}`} className="w-full h-80 object-cover" />
                  </div>
                </CarouselItem>
              )) : (
                 <CarouselItem>
                   <div className="aspect-w-16 aspect-h-9">
                    <img src="/placeholder.svg" alt="Ảnh mặc định" className="w-full h-80 object-cover" />
                   </div>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </CardHeader>
        <CardContent className="p-6">
          <CardTitle className="text-3xl font-bold mb-4">{monAn.ten}</CardTitle>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {monAn.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
          </div>

          <p className="text-muted-foreground mb-6">{monAn.moTa}</p>

          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">{monAn.diaChi}</p>
                <p className="text-sm text-muted-foreground">{monAn.thanhPho}</p>
              </div>
            </div>
             <div className="flex items-center">
              <span className="font-semibold mr-2">Giá:</span>
              <span>{priceRange}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
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
          <div className="border-t my-6"></div>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailPage;