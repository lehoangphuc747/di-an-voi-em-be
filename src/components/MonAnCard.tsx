import { MonAn, LoaiMon } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { isStoreOpen } from "@/lib/time-utils";
import { cn } from "@/lib/utils";
import { Clock, Heart, Bookmark, CheckCircle2, MapPin } from "lucide-react";

interface MonAnCardProps {
  monAn: MonAn;
  loaiMon: LoaiMon[];
  isFavorite?: boolean;
  isWishlist?: boolean;
  isVisited?: boolean;
}

export const MonAnCard = ({ monAn, loaiMon, isFavorite, isWishlist, isVisited }: MonAnCardProps) => {
  const isOpen = isStoreOpen(monAn.gioMoCua);

  const priceRange =
    monAn.giaMin && monAn.giaMax
      ? `${(monAn.giaMin / 1000).toFixed(0)}k - ${(monAn.giaMax / 1000).toFixed(0)}k`
      : monAn.giaMax
      ? `Dưới ${(monAn.giaMax / 1000).toFixed(0)}k`
      : monAn.giaMin
      ? `Từ ${(monAn.giaMin / 1000).toFixed(0)}k`
      : "—";

  return (
    <Link to={`/mon/${monAn.id}`} className="group block h-full">
      <Card className="h-full flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl border">
        <CardHeader className="p-0 relative">
          <div className="aspect-video overflow-hidden">
            <img
              src={monAn.hinhAnh[0] || '/placeholder.svg'}
              alt={monAn.ten}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 flex flex-col">
          <div className="flex flex-wrap gap-2 mb-2">
            {loaiMon.map(l => (
              <Badge key={l.id} variant="secondary" className="font-normal">{l.ten}</Badge>
            ))}
          </div>
          <div className="flex justify-between items-start mt-1">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
              {monAn.ten}
            </CardTitle>
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              {isFavorite && (
                <div title="Yêu thích">
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                </div>
              )}
              {isWishlist && (
                <div title="Chờ embe">
                  <Bookmark className="h-4 w-4 text-blue-500 fill-blue-500" />
                </div>
              )}
              {isVisited && (
                <div title="Ăn rùi">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-start text-sm text-muted-foreground mt-1 flex-grow">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{monAn.diaChi}</span>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            {monAn.gioMoCua && (
              <>
                <Clock className="w-3 h-3 mr-1.5 flex-shrink-0" />
                <span>{monAn.gioMoCua}</span>
              </>
            )}
            {isOpen !== null && (
              <>
                {monAn.gioMoCua && <span className="mx-1.5">·</span>}
                <span className={cn(
                  "font-semibold",
                  isOpen ? "text-green-600" : "text-red-600"
                )}>
                  {isOpen ? "Đang mở" : "Đóng cửa"}
                </span>
              </>
            )}
          </div>

        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto">
          <p className="text-base font-semibold text-primary">
            {priceRange}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
};