import { useState } from 'react';
import { MonAn, LoaiMon } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { useFoodLists } from '@/hooks/use-food-lists';
import { showSuccess } from '@/utils/toast';

interface FavoriteItemProps {
  monAn: MonAn;
  loaiMon?: LoaiMon;
}

const formatPrice = (price: number) => `${(price / 1000).toFixed(0)}k`;

export const FavoriteItem = ({ monAn, loaiMon }: FavoriteItemProps) => {
  const { getFavoriteNote, updateFavoriteNote } = useFoodLists();
  const [note, setNote] = useState(getFavoriteNote(monAn.id) || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveNote = () => {
    updateFavoriteNote(monAn.id, note);
    showSuccess('Đã lưu ghi chú!');
    setIsEditing(false);
  };

  const priceRange =
    monAn.giaMin && monAn.giaMax
      ? `${formatPrice(monAn.giaMin)} - ${formatPrice(monAn.giaMax)}`
      : monAn.giaMax
      ? `Dưới ${formatPrice(monAn.giaMax)}`
      : monAn.giaMin
      ? `Từ ${formatPrice(monAn.giaMin)}`
      : "—";

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <Link to={`/mon/${monAn.id}`} className="block">
        <CardHeader className="p-0">
          <img
            src={monAn.hinhAnh}
            alt={monAn.ten}
            className="w-full h-40 object-cover"
          />
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-semibold mb-2 truncate">{monAn.ten}</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{monAn.thanhPho}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm">
          {loaiMon && <Badge variant="outline">{loaiMon.ten}</Badge>}
          <span className="font-medium text-primary">{priceRange}</span>
        </CardFooter>
      </Link>
      
      <div className="p-4 pt-0 border-t mt-auto">
        <Label htmlFor={`note-${monAn.id}`} className="font-semibold text-sm">Ghi chú</Label>
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              id={`note-${monAn.id}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Thêm ghi chú về món ăn này..."
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveNote}>Lưu</Button>
              <Button size="sm" variant="ghost" onClick={() => {
                setNote(getFavoriteNote(monAn.id) || '');
                setIsEditing(false);
              }}>Hủy</Button>
            </div>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
             <p className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[40px]">
              {note || 'Chưa có ghi chú.'}
            </p>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              {note ? 'Sửa' : 'Thêm ghi chú'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};