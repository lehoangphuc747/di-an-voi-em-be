import { MonAn, LoaiMon } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { isStoreOpen } from "@/lib/time-utils";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface MonAnCardProps {
  monAn: MonAn;
  loaiMon: LoaiMon[];
}

export const MonAnCard = ({ monAn, loaiMon }: MonAnCardProps) => {
  const isOpen = isStoreOpen(monAn.gioMoCua);

  const renderStatusBadge = () => {
    if (isOpen === null) {
      return null; // Không hiển thị huy hiệu nếu không có thông tin giờ
    }
    
    const statusText = isOpen ? "Đang mở" : "Đóng cửa";
    const badgeClass = isOpen 
      ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100" 
      : "bg-red-100 text-red-800 border-red-200 hover:bg-red-100";

    return (
      <Badge variant="outline" className={cn("absolute top-3 right-3 font-semibold", badgeClass)}>
        {statusText}
      </Badge>
    );
  };

  return (
    <Link to={`/mon-an/${monAn.id}`} className="group block h-full">
      <Card className="h-full flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl border">
        <CardHeader className="p-0 relative">
          <div className="aspect-video overflow-hidden">
            <img
              src={monAn.hinhAnh[0]}
              alt={monAn.ten}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          {renderStatusBadge()}
        </CardHeader>
        <CardContent className="flex-grow p-4 flex flex-col">
          <div className="flex flex-wrap gap-2 mb-2">
            {loaiMon.map(l => (
              <Badge key={l.id} variant="secondary" className="font-normal">{l.ten}</Badge>
            ))}
          </div>
          <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors mt-1">
            {monAn.ten}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1 flex-grow">{monAn.diaChi}</p>
          {monAn.gioMoCua && (
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Clock className="w-3 h-3 mr-1.5" />
              <span>{monAn.gioMoCua}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto">
          <p className="text-lg font-bold text-primary">
            {monAn.giaMin ? `${monAn.giaMin.toLocaleString()}đ` : 'Xem chi tiết'}
            {monAn.giaMax && monAn.giaMin ? ` - ${monAn.giaMax.toLocaleString()}đ` : ''}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
};