"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const profileFormSchema = z.object({
  nickname: z.string().min(1, { message: "Nickname không được để trống." }).max(50, { message: "Nickname quá dài." }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfilePage = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nickname: '',
    },
  });

  useEffect(() => {
    if (!user || isSessionLoading) {
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchProfile = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('id', user.id)
        .single();

      if (!isMounted) return;

      if (profileError && profileError.code !== 'PGRST116') { // Ignore "exact one row" error if profile doesn't exist
        console.error("Error fetching profile:", profileError);
        showError('Lỗi khi tải thông tin hồ sơ.');
      } else if (profileData) {
        form.reset({
          nickname: profileData.nickname || '',
        });
      }

      setLoading(false);
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user, isSessionLoading, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) {
      showError('Bạn cần đăng nhập để cập nhật hồ sơ.');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        nickname: values.nickname,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error("Error updating profile:", error);
      showError('Lỗi khi cập nhật hồ sơ.');
    } else {
      showSuccess('Hồ sơ đã được cập nhật thành công!');
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      showError("Lỗi khi đăng xuất.");
    } else {
      showSuccess("Đã đăng xuất thành công!");
      navigate('/login');
    }
    setLoading(false);
  };

  if (isSessionLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Thông tin tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={user?.email || ''} disabled className="bg-muted" />
                <p className="text-sm text-muted-foreground">Email của bạn không thể thay đổi.</p>
              </div>

              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nickname</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập nickname của bạn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu thay đổi
                </Button>
                <Button type="button" variant="outline" onClick={handleSignOut} disabled={loading}>
                  Đăng xuất
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;