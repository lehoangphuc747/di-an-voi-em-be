import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MonAn, LoaiMon } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Clock, Tag, Phone, Facebook, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isStoreOpen } from "@/lib/time-utils";
import { cn } from "@/lib/utils";

const monAnFiles = import.meta.glob('@/data/monan/*.json', { eager: true });
const loaiMonFiles = import.meta.glob('@/data/loaimon/*.json', { eager: true });

const allMonAn: MonAn[] = Object.values(monAnFiles).map((file: any) => file.default || file);
const allLoaiMon: LoaiMon[] = Object.values(loaiMonFiles).map((file: any) => file.default || file);

const MonAnDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [monAn, setMonAn] = useState<MonAn | null>(null);
  const [loaiMon, setLoaiMon] = useState<LoaiMon[]>([]);

  useEffect(() => {
    const foundMonAn = allMonAn.find(m => m.id === id);
    if (foundMonAn) {
      setMonAn(foundMonAn);
      const foundLoaiMon = allLoaiMon.filter(l => foundMonAn.loaiIds.includes(l.id));
      setLoaiMon(foundLoaiMon);
    } else {
      setMonAn(null);
    }
  }, [id]);

  if (!monAn) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Không tìm thấy món ăn</h2>
        <p className="text-muted-foreground">Món ăn bạn đang tìm kiếm không tồn tại.</p>
        <Button asChild className="mt-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Về trang chủ
          </Link>
        </Button>
      </div>
    );
  }

  const isOpen = isStoreOpen(monAn.gioMoCua);

  const renderStatusBadge = () => {
    if (isOpen === null) return null;
    const statusText = isOpen ? "Đang mở" : "Đóng cửa";
    const badgeClass = isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    return (
      <Badge className={cn("text-sm font-semibold", badgeClass)}>
        {statusText}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-4 shadow-md">
            <img src={monAn.hinhAnh[0]} alt={monAn.ten} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {monAn.hinhAnh.slice(1, 4).map((img, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-sm">
                <img src={img} alt={`${monAn.ten} ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {loaiMon.map(l => (
              <Badge key={l.id} variant="secondary">{l.ten}</Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{monAn.ten}</h1>
          <div className="flex items-center gap-2 mt-2">
            {renderStatusBadge()}
          </div>

          <p className="text-lg text-muted-foreground mt-4">{monAn.moTa}</p>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mt-0.5 mr-3 text-muted-foreground flex-shrink-0" />
              <span>{monAn.diaChi}, {monAn.thanhPho}</span>
            </div>
            {monAn.gioMoCua && (
              <div className="flex items-start">
                <Clock className="h-4 w-4 mt-0.5 mr-3 text-muted-foreground flex-shrink-0" />
                <span>{monAn.gioMoCua}</span>
              </div>
            )}
             {monAn.soDienThoai && (
              <div className="flex items-start">
                <Phone className="h-4 w-4 mt-0.5 mr-3 text-muted-foreground flex-shrink-0" />
                <a href={`tel:${monAn.soDienThoai}`} className="hover:underline">{monAn.soDienThoai}</a>
              </div>
            )}
            <div className="flex items-start">
              <Tag className="h-4 w-4 mt-0.5 mr-3 text-muted-foreground flex-shrink-0" />
              <span className="font-semibold text-lg text-primary">
                {monAn.giaMin ? `${monAn.giaMin.toLocaleString()}đ` : 'N/A'}
                {monAn.giaMax && monAn.giaMin ? ` - ${monAn.giaMax.toLocaleString()}đ` : ''}
              </span>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            {monAn.googleMapLink && (
              <Button asChild variant="outline">
                <a href={monAn.googleMapLink} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" /> Google Maps
                </a>
              </Button>
            )}
            {monAn.facebookLink && (
              <Button asChild variant="outline">
                <a href={monAn.facebookLink} target="_blank" rel="noopener noreferrer">
                  <Facebook className="mr-2 h-4 w-4" /> Facebook
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonAnDetail;