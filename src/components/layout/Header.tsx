import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";
import { useSession } from "@/components/SessionContextProvider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { session } = useSession();
  const navigate = useNavigate();

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
        </div>
        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <Link to="/profile" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Tài khoản
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Đăng xuất
              </Button>
            </>
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