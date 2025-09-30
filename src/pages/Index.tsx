"use client";

import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="text-center py-10">
      <h1 className="text-4xl font-bold mb-4">Chào mừng đến với Món Ăn Ngon!</h1>
      {user ? (
        <p className="text-lg">Xin chào, {user.email}! Hãy bắt đầu khám phá.</p>
      ) : (
        <p className="text-lg">Vui lòng đăng nhập để lưu và quản lý các món ăn yêu thích của bạn.</p>
      )}
    </div>
  );
};

export default Index;