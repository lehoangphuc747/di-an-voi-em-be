"use client";

import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          Món Ăn Ngon
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/favorites" className="text-gray-600 hover:text-gray-900">Yêu thích</Link>
              <Link to="/wishlist" className="text-gray-600 hover:text-gray-900">Muốn ăn</Link>
              <Link to="/visited" className="text-gray-600 hover:text-gray-900">Đã ăn</Link>
              <Link to="/account" className="text-gray-600 hover:text-gray-900">Tài khoản</Link>
              <Button onClick={handleSignOut} variant="outline" size="sm">Đăng xuất</Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Đăng nhập</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;