"use client";

import React, { useState, useEffect, useRef } from 'react';
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
import { Loader2, Upload, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserBackupData } from '@/types';
import { useAllMonAn } from '@/hooks/use-all-mon-an'; // Import useAllMonAn hook

const profileFormSchema = z.object({
  nickname: z.string().min(1, { message: "Nickname không được để trống." }).max(50, { message: "Nickname quá dài." }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfilePage = () => {
  const { user, isLoading: isSessionLoading, setUserLists } = useSession();
  const { allMonAn, isLoading: isAllMonAnLoading } = useAllMonAn(); // Use the hook to get all food items
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExportData = async () => {
    if (!user) {
      showError('Bạn cần đăng nhập để xuất dữ liệu.');
      return;
    }
    setIsExporting(true);
    try {
      const userId = user.id;

      const [favoritesRes, wishlistRes, visitedRes, notesRes] = await Promise.all([
        supabase.from('favorites').select('mon_an_id, ghi_chu').eq('user_id', userId),
        supabase.from('wishlist').select('mon_an_id').eq('user_id', userId),
        supabase.from('visited').select('mon_an_id, rating, notes').eq('user_id', userId),
        supabase.from('personal_notes').select('mon_an_id, content').eq('user_id', userId),
      ]);

      if (favoritesRes.error) throw favoritesRes.error;
      if (wishlistRes.error) throw wishlistRes.error;
      if (visitedRes.error) throw visitedRes.error;
      if (notesRes.error) throw notesRes.error;

      const backupData: UserBackupData = {
        favorites: favoritesRes.data,
        wishlist: wishlistRes.data,
        visited: visitedRes.data,
        personal_notes: notesRes.data,
        all_mon_an: allMonAn, // Include all food items in the export
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `embe_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess('Đã xuất dữ liệu thành công!');
    } catch (error: any) {
      console.error("Error exporting data:", error);
      showError(`Lỗi khi xuất dữ liệu: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      showError('Bạn cần đăng nhập để nhập dữ liệu.');
      return;
    }
    const file = event.target.files?.[0];
    if (!file) {
      showError('Vui lòng chọn một tệp để nhập.');
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = e.target?.result as string;
        const backupData: UserBackupData = JSON.parse(result);

        const userId = user.id;

        // Delete existing user-specific data
        await supabase.from('favorites').delete().eq('user_id', userId);
        await supabase.from('wishlist').delete().eq('user_id', userId);
        await supabase.from('visited').delete().eq('user_id', userId);
        await supabase.from('personal_notes').delete().eq('user_id', userId);

        // Insert new user-specific data from backup
        if (backupData.favorites && backupData.favorites.length > 0) {
          const { error } = await supabase.from('favorites').insert(backupData.favorites.map(item => ({ ...item, user_id: userId })));
          if (error) throw error;
        }
        if (backupData.wishlist && backupData.wishlist.length > 0) {
          const { error } = await supabase.from('wishlist').insert(backupData.wishlist.map(item => ({ ...item, user_id: userId })));
          if (error) throw error;
        }
        if (backupData.visited && backupData.visited.length > 0) {
          const { error } = await supabase.from('visited').insert(backupData.visited.map(item => ({ ...item, user_id: userId })));
          if (error) throw error;
        }
        if (backupData.personal_notes && backupData.personal_notes.length > 0) {
          const { error } = await supabase.from('personal_notes').insert(backupData.personal_notes.map(item => ({ ...item, user_id: userId })));
          if (error) throw error;
        }
        
        // Refresh user lists in session context
        const [favoritesRes, wishlistRes, visitedRes] = await Promise.all([
          supabase.from('favorites').select('mon_an_id').eq('user_id', userId),
          supabase.from('wishlist').select('mon_an_id').eq('user_id', userId),
          supabase.from('visited').select('mon_an_id').eq('user_id', userId),
        ]);

        if (favoritesRes.error) throw favoritesRes.error;
        if (wishlistRes.error) throw wishlistRes.error;
        if (visitedRes.error) throw visitedRes.error;

        setUserLists({
          favorites: favoritesRes.data.map(item => item.mon_an_id),
          wishlist: wishlistRes.data.map(item => item.mon_an_id),
          visited: visitedRes.data.map(item => item.mon_an_id),
        });

        showSuccess('Đã nhập dữ liệu thành công!');
      } catch (error: any) {
        console.error("Error importing data:", error);
        showError(`Lỗi khi nhập dữ liệu: ${error.message}`);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Clear file input
        }
      }
    };
    reader.readAsText(file);
  };

  if (isSessionLoading || loading || isAllMonAnLoading) {
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

          <div className="mt-8 space-y-4 border-t pt-6">
            <h2 className="text-xl font-bold">Quản lý dữ liệu</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleExportData} disabled={isExporting || isImporting} className="w-full sm:w-auto">
                {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Download className="mr-2 h-4 w-4" />
                Xuất dữ liệu
              </Button>
              <Input
                type="file"
                accept=".json"
                onChange={handleImportData}
                ref={fileInputRef}
                className="hidden"
                id="import-file-input"
                disabled={isExporting || isImporting}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isExporting || isImporting}
                className="w-full sm:w-auto"
                variant="outline"
              >
                {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Upload className="mr-2 h-4 w-4" />
                Nhập dữ liệu
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Xuất dữ liệu để sao lưu tất cả các món ăn và danh sách cá nhân của bạn.
              Nhập dữ liệu sẽ ghi đè lên các danh sách cá nhân hiện có của bạn, dữ liệu món ăn chính sẽ không bị ảnh hưởng.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;