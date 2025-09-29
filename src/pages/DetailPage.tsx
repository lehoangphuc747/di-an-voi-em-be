import { useParams, Navigate } from "react-router-dom";
import { MapPin, ExternalLink, Copy, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFavorites } from "@/hooks/use-favorites";
import { showError, showSuccess } from "@/utils/toast";
import monAnData from "@/data/monan.json";

const formatPrice = (price: number) => `${(price / 1000).toFixed(0)}k`;

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const monAn = monAnData.find(m => m.id === id);

  if (!monAn) {
    return <Navigate to="/404" replace />;
  }

  const isCurrentlyFavorite = isFavorite(monAn.id);

  const handleToggleFavorite = () => {
    if (isCurrentlyFavorite) {
      removeFavorite(monAn.id);
      showSuccess("Đã xóa khỏi danh sách yêu thích");
    } else {
      addFavorite(monAn.id);
      showSuccess("Đã thêm vào danh sách yêu thích");
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(monAn.diaChi)
      .then(() => showSuccess("Đã sao chép địa chỉ!"))
      .catch(() => showError("Không thể sao chép địa chỉ."));
  };

  const priceRange =
    monAn.giaMin && monAn.giaMax
      ? `${formatPrice(monAn.giaMin)} - ${formatPrice(monAn.giaMax)}`
      : monAn.giaMin
      ? `Từ ${formatPrice(monAn.giaMin)}`
      : "Không có thông tin";

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="p-0">
          <img src={monAn.hinhAnh} alt={monAn.ten} className="w-full h-64 object-cover rounded-t-lg" />
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
            <Button variant="outline" onClick={handleCopyAddress}>
              <Copy className="h-4 w-4 mr-2" />
              Sao chép địa chỉ
            </Button>
            <Button variant={isCurrentlyFavorite ? "destructive" : "outline"} onClick={handleToggleFavorite}>
              <Heart className={`h-4 w-4 mr-2 ${isCurrentlyFavorite ? 'fill-current' : ''}`} />
              {isCurrentlyFavorite ? "Bỏ yêu thích" : "Yêu thích"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailPage;