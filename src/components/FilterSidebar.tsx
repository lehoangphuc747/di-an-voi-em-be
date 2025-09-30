import { LoaiMon } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface PriceRange {
  id: string;
  ten: string;
}

type OpeningStatus = 'all' | 'open' | 'closed';

interface FilterSidebarProps {
  cities: string[];
  categories: LoaiMon[];
  selectedCities: string[];
  onCityChange: (city: string) => void;
  selectedCategories: string[];
  onCategoryChange: (categoryId: string) => void;
  priceRanges: PriceRange[];
  selectedPriceRangeId: string;
  onPriceRangeChange: (id: string) => void;
  selectedOpeningStatus: OpeningStatus;
  onOpeningStatusChange: (status: OpeningStatus) => void;
}

export const FilterSidebar = ({
  cities,
  categories,
  selectedCities,
  onCityChange,
  selectedCategories,
  onCategoryChange,
  priceRanges,
  selectedPriceRangeId,
  onPriceRangeChange,
  selectedOpeningStatus,
  onOpeningStatusChange,
}: FilterSidebarProps) => {
  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="status">
          <AccordionTrigger>Trạng thái</AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={selectedOpeningStatus}
              onValueChange={(value) => onOpeningStatusChange(value as OpeningStatus)}
              className="space-y-2 p-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="status-all" />
                <Label htmlFor="status-all" className="font-normal cursor-pointer">
                  Tất cả
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="open" id="status-open" />
                <Label htmlFor="status-open" className="font-normal cursor-pointer">
                  Đang mở
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="closed" id="status-closed" />
                <Label htmlFor="status-closed" className="font-normal cursor-pointer">
                  Đóng cửa
                </Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="cities">
          <AccordionTrigger>Thành phố</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {cities.map((city) => (
                <div key={city} className="flex items-center space-x-2">
                  <Checkbox
                    id={`city-${city}`}
                    checked={selectedCities.includes(city)}
                    onCheckedChange={() => onCityChange(city)}
                  />
                  <Label htmlFor={`city-${city}`} className="font-normal cursor-pointer">
                    {city}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="categories">
          <AccordionTrigger>Loại món</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => onCategoryChange(category.id)}
                  />
                  <Label htmlFor={`cat-${category.id}`} className="font-normal cursor-pointer">
                    {category.ten}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger>Khoảng giá</AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={selectedPriceRangeId}
              onValueChange={onPriceRangeChange}
              className="space-y-2 p-2"
            >
              {priceRanges.map((range) => (
                <div key={range.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={range.id} id={`price-${range.id}`} />
                  <Label htmlFor={`price-${range.id}`} className="font-normal cursor-pointer">
                    {range.ten}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};