import { Link } from "react-router-dom";
import { Home, Settings, Heart, Bookmark, CheckCircle2 } from "lucide-react";
import { useSession } from "@/components/SessionContextProvider";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const { session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-center">
        <nav className="flex items-center space-x-2 lg:space-x-4">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary" title="Trang chủ">
            <Button variant="ghost" size="icon">
              <Home className="h-5 w-5" />
              <span className="sr-only">Trang chủ</span>
            </Button>
          </Link>
          <Link to="/favorites" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary" title="Yêu thích">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Yêu thích</span>
            </Button>
          </Link>
          <Link to="/wishlist" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary" title="Chờ embe">
            <Button variant="ghost" size="icon">
              <Bookmark className="h-5 w-5" />
              <span className="sr-only">Chờ embe</span>
            </Button>
          </Link>
          <Link to="/visited" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary" title="Ăn rùi">
            <Button variant="ghost" size="icon">
              <CheckCircle2 className="h-5 w-5" />
              <span className="sr-only">Ăn rùi</span>
            </Button>
          </Link>
          {session ? (
            <Link to="/profile" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary" title="Tài khoản">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Tài khoản</span>
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Đăng nhập
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};