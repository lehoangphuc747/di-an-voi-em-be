import { MonAn, LoaiMon } from "@/types/index";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useFoodLists } from "@/hooks/use-food-lists";
import { CheckCircle2, Bookmark } from "lucide-react";

interface MonAnCardProps {
  monAn: MonAn;
  loaiMon?: LoaiMon;
}

const formatPrice = (price: number) => {
  return `${(price / 1000).toFixed(0)}k`;
};

export const MonAnCard = ({ monAn, loaiMon }: MonAnCardProps) => {
  const { isVisited, isWishlist } = useFoodLists();
  const hasBeenVisited = isVisited(monAn.id);
  const isOnWishlist = isWishlist(monAn.id);

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
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
        {isOnWishlist && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full p-1 z-10">
            <Bookmark className="h-5 w-5 fill-current" />
          </div>
        )}
        {hasBeenVisited && (
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 z-10">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        )}
        <CardHeader className="p-0">
          <img
            src={monAn.hinhAnh[0] || '/placeholder.svg'}
            alt={monAn.ten}
            className="w-full h-40 object-cover"
          />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-semibold mb-2 truncate">{monAn.ten}</CardTitle>
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