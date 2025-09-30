import { useState, useEffect } from 'react';
import { MonAn, LoaiMon } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { useFoodLists } from '@/hooks/use-food-lists';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisitedItemProps {
  monAn: MonAn;
  loaiMon?: LoaiMon[];
}

const StarRating = ({ rating, onRatingChange, disabled = false }: { rating: number | null, onRatingChange: (newRating: number) => void, disabled?: boolean }) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={disabled}
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(null)}
          className="cursor-pointer disabled:cursor-not-allowed"
        >
          <Star className={cn(
            "h-6 w-6 transition-colors",
            (hoverRating || rating || 0) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          )} />
        </button>
      ))}
    </div>
  );
};

export const VisitedItem = ({ monAn, loaiMon }: VisitedItemProps) => {
  const { getVisitedDetails, updateVisited } = useFoodLists();
  const details = getVisitedDetails(monAn.id);

  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (details) {
      setRating(details.rating || null);
      setNotes(details.notes || '');
    }
  }, [details]);

  const handleSave = () => {
    updateVisited(monAn.id, { rating, notes });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setRating(details?.rating || null);
    setNotes(details?.notes || '');
    setIsEditing(false);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <Link to={`/mon/${monAn.id}`} className="block group">
        <CardHeader className="p-0">
          <div className="aspect-video overflow-hidden">
            <img
              src={monAn.hinhAnh[0] || '/placeholder.svg'}
              alt={monAn.ten}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{monAn.ten}</CardTitle>
          <div className="flex flex-wrap gap-1">
            {loaiMon?.map((loai) => (
              <Badge key={loai.id} variant="secondary">{loai.ten}</Badge>
            ))}
          </div>
        </CardContent>
      </Link>
      
      <div className="p-4 pt-0 border-t mt-auto flex-grow flex flex-col">
        <div className="flex-grow">
          <Label className="font-semibold text-sm">Đánh giá của bạn</Label>
          <div className="mt-2 space-y-2">
            <StarRating rating={rating} onRatingChange={setRating} disabled={!isEditing} />
            {isEditing ? (
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú về trải nghiệm của bạn..."
                rows={3}
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[40px]">
                {notes || 'Chưa có ghi chú.'}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4">
          {isEditing ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>Lưu</Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>Hủy</Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              {rating || notes ? 'Sửa đánh giá' : 'Thêm đánh giá'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};