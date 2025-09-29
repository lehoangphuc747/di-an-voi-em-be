import { LoaiMon } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface FilterSidebarProps {
  cities: string[];
  categories: LoaiMon[];
  selectedCities: string[];
  onCityChange: (city: string) => void;
  selectedCategories: string[];
  onCategoryChange: (categoryId: string) => void;
  priceRange: [number, number];
  onPriceChange: (value: [number, number]) => void;
  maxPrice: number;
}

const formatPrice = (price: number) => `${(price / 1000).toFixed(0)}k`;

export const FilterSidebar = ({
  cities,
  categories,
  selectedCities,
  onCityChange,
  selectedCategories,
  onCategoryChange,
  priceRange,
  onPriceChange,
  maxPrice,
}: FilterSidebarProps) => {
  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={['cities', 'categories', 'price']} className="w-full">
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
            <div className="p-2">
              <Slider
                min={0}
                max={maxPrice}
                step={10000}
                value={priceRange}
                onValueChange={onPriceChange}
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};