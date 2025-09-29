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

const profileFormSchema = z.object({
  first_name: z.string().min(1, { message: "Tên không được để trống." }).max(50, { message: "Tên quá dài." }).optional().or(z.literal('')),
  last_name: z.string().min(1, { message: "Họ không được để trống." }).max(50, { message: "Họ quá dài." }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfilePage = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [loading, setLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
    },
  });

  useEffect(() => {
    if (!user || isSessionLoading) {
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        showError('Lỗi khi tải thông tin hồ sơ.');
      } else if (data) {
        form.reset({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        });
      }
      setLoading(false);
    };

    fetchProfile();
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
        first_name: values.first_name,
        last_name: values.last_name,
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
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên của bạn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập họ của bạn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;