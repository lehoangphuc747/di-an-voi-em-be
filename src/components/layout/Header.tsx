import { Link } from "react-router-dom";
import { UtensilsCrossed, Settings, Heart, Bookmark, CheckCircle2, Plus } from "lucide-react"; // Import new icons
import { useSession } from "@/components/SessionContextProvider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  // Logic handleSignOut sẽ được di chuyển vào ProfilePage
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      showError("Lỗi khi đăng xuất.");
    } else {
      showSuccess("Đã đăng xuất thành công!");
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2 mr-6">
            <UtensilsCrossed className="h-6 w-6" />
            <span className="font-bold">embe</span>
          </Link>
          <nav className="flex items-center space-x-2 lg:space-x-4"> {/* Adjusted spacing for icons */}
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
          </nav>
        </div>
        <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </header>
  );
};