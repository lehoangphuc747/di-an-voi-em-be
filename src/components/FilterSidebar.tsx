import { LoaiMon } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FilterSidebarProps {
  cities: string[];
  categories: LoaiMon[];
  selectedCities: string[];
  onCityChange: (city: string) => void;
  selectedCategories: string[];
  onCategoryChange: (categoryId: string) => void;
}

export const FilterSidebar = ({
  cities,
  categories,
  selectedCities,
  onCityChange,
  selectedCategories,
  onCategoryChange,
}: FilterSidebarProps) => {
  return (
    <aside className="sticky top-20 h-fit">
      <h2 className="text-xl font-semibold mb-4">Bộ lọc</h2>
      <Accordion type="multiple" defaultValue={['cities', 'categories']} className="w-full">
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
                  <Label htmlFor={`city-${city}`} className="font-normal">
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
                  <Label htmlFor={`cat-${category.id}`} className="font-normal">
                    {category.ten}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
};