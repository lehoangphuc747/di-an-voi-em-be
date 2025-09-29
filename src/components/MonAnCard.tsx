import { MonAn, LoaiMon } from "@/types/index";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useFoodLists } from "@/hooks/use-food-lists";
import { CheckCircle2, Bookmark, Heart } from "lucide-react"; // Import Heart icon

interface MonAnCardProps {
  monAn: MonAn;
  loaiMon?: LoaiMon;
}

const formatPrice = (price: number) => {
  return `${(price / 1000).toFixed(0)}k`;
};

export const MonAnCard = ({ monAn, loaiMon }: MonAnCardProps) => {
  const { isVisited, isWishlist, isFavorite } = useFoodLists(); // Get isFavorite
  const hasBeenVisited = isVisited(monAn.id);
  const isOnWishlist = isWishlist(monAn.id);
  const isCurrentlyFavorite = isFavorite(monAn.id); // Check if it's a favorite

  const priceRange =
    monAn.giaMin && monAn.giaMax
      ? `${formatPrice(monAn.giaMin)} - ${formatPrice(monAn.giaMax)}`
      : monAn.giaMax
      ? `Dưới ${formatPrice(monAn.giaMax)}`
      : monAn.giaMin
      ? `Từ ${formatPrice(monAn.giaMin)}`
      : "—";

  return (
    <Link to={`/mon/${monAn.id}`} className="block">
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="p-0">
          <img
            src={monAn.hinhAnh[0] || '/placeholder.svg'}
            alt={monAn.ten}
            className="w-full h-40 object-cover"
          />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <div className="flex justify-between items-start mb-2 gap-2">
            <CardTitle className="text-lg font-semibold">{monAn.ten}</CardTitle>
            <div className="flex items-center space-x-1 flex-shrink-0">
              {isCurrentlyFavorite && ( // Conditionally render Heart icon
                <div className="text-red-500" title="Yêu thích">
                  <Heart className="h-5 w-5 fill-current" />
                </div>
              )}
              {isOnWishlist && (
                <div className="text-blue-500" title="Chờ embe">
                  <Bookmark className="h-5 w-5 fill-current" />
                </div>
              )}
              {hasBeenVisited && (
                <div className="text-green-500" title="Ăn rùi">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{monAn.thanhPho}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm">
          {loaiMon && <Badge variant="outline">{loaiMon.ten}</Badge>}
          <span className="font-medium text-primary">{priceRange}</span>
        </CardFooter>
      </Card>
    </Link>
  );
};