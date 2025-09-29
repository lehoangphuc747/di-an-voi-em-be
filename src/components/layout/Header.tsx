import { Link } from "react-router-dom";
import { Heart, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center space-x-2 mr-6">
          <UtensilsCrossed className="h-6 w-6" />
          <span className="font-bold">Food Diary</span>
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <Link to="/favorites" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Yêu thích
          </Link>
          <Link to="/wishlist" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Chờ embe
          </Link>
          <Link to="/visited" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Ăn rùi
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Link to="/favorites">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Yêu thích</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};