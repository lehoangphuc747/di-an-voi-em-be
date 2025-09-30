"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const Login = () => {
  const { session } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  if (session) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="flex justify-center items-center pt-10">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="light"
          localization={{
            variables: {
              sign_in: { email_label: 'Địa chỉ email', password_label: 'Mật khẩu', button_label: 'Đăng nhập', link_text: 'Đã có tài khoản? Đăng nhập' },
              sign_up: { email_label: 'Địa chỉ email', password_label: 'Mật khẩu', button_label: 'Đăng ký', link_text: 'Chưa có tài khoản? Đăng ký' },
              forgotten_password: { email_label: 'Địa chỉ email', button_label: 'Gửi hướng dẫn', link_text: 'Quên mật khẩu?' },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;