"use client";

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Account = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      setLoading(true);
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single();

      if (!ignore) {
        if (error) {
          console.warn(error);
        } else if (data) {
          setNickname(data.nickname || '');
        }
      }
      setLoading(false);
    }

    getProfile();
    return () => {
      ignore = true;
    };
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ nickname, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      alert('Lỗi cập nhật thông tin: ' + error.message);
    } else {
      alert('Cập nhật thông tin thành công!');
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!user) {
    return <p>Đang tải thông tin người dùng...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Tài khoản của bạn</h1>
      <p className="mt-4 mb-6 text-gray-600"><strong>Email:</strong> {user.email}</p>
      
      <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-sm">
        <div>
          <Label htmlFor="nickname">Tên hiển thị</Label>
          <Input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={loading}
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Đang cập nhật...' : 'Cập nhật'}
        </Button>
      </form>

      <Button onClick={handleSignOut} variant="destructive" className="mt-8">
        Đăng xuất
      </Button>
    </div>
  );
};

export default Account;