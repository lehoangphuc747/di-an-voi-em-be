import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/components/SessionContextProvider';
import { useEffect } from 'react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && session) {
      navigate('/');
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Đang tải...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Đăng nhập vào embe</h2>
        <Auth
          supabaseClient={supabase}
          providers={[]} // Bạn có thể thêm các nhà cung cấp khác như 'google', 'facebook' nếu muốn
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary-foreground))',
                },
              },
            },
          }}
          theme="light" // Có thể thay đổi thành "dark" hoặc "system"
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};

export default LoginPage;