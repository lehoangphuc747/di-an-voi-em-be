import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          Ăn Gì Đây?
        </Link>
        <nav>
          {/* Các liên kết điều hướng có thể được thêm vào đây */}
        </nav>
      </div>
    </header>
  );
};