import { NavLink } from "react-router-dom";
import { Home, Settings, Heart, Bookmark, CheckCircle2 } from "lucide-react";
import { useSession } from "@/components/SessionContextProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const Header = () => {
  const { session } = useSession();

  const navLinks = [
    { to: "/", title: "Trang chủ", icon: Home },
    { to: "/favorites", title: "Yêu thích", icon: Heart },
    { to: "/wishlist", title: "Muốn thử", icon: Bookmark },
    { to: "/visited", title: "Ăn rùi", icon: CheckCircle2 },
  ];

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      buttonVariants({ variant: "ghost", size: "icon" }),
      "transition-colors",
      isActive
        ? "bg-secondary text-primary hover:bg-secondary/80"
        : "text-muted-foreground hover:text-primary"
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-center">
        <nav className="flex items-center space-x-2 lg:space-x-4">
          {navLinks.map(({ to, title, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={title}
              className={getNavLinkClass}
            >
              <Icon className="h-5 w-5" />
              <span className="sr-only">{title}</span>
            </NavLink>
          ))}
          {session ? (
            <NavLink
              to="/profile"
              title="Tài khoản"
              className={getNavLinkClass}
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Tài khoản</span>
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground"
              )}
            >
              Đăng nhập
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
};