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
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Profile } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const profileFormSchema = z.object({
  nickname: z.string().min(1, { message: "Nickname không được để trống." }).max(50, { message: "Nickname quá dài." }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfilePage = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
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

    const fetchProfileAndSubmissions = async () => {
      const profilePromise = supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('id', user.id)
        .single();

      const submissionsPromise = supabase
        .from('user_submitted_mon_an')
        .select('*')
        .eq('user_id', user.id)
        .order('ngay_tao', { ascending: false });

      const [{ data: profileData, error: profileError }, { data: submissionsData, error: submissionsError }] = await Promise.all([profilePromise, submissionsPromise]);

      if (!isMounted) return;

      if (profileError && profileError.code !== 'PGRST116') { // Ignore "exact one row" error if profile doesn't exist
        console.error("Error fetching profile:", profileError);
        showError('Lỗi khi tải thông tin hồ sơ.');
      } else if (profileData) {
        form.reset({
          nickname: profileData.nickname || '',
        });
      }

      if (submissionsError) {
        console.error("Error fetching submissions:", submissionsError);
        showError('Lỗi khi tải các món ăn đã gửi.');
      } else if (submissionsData) {
        setSubmissions(submissionsData);
      }

      setLoading(false);
    };

    fetchProfileAndSubmissions();

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

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('user_submitted_mon_an')
      .delete()
      .eq('id', submissionId)
      .eq('user_id', user.id);

    if (error) {
      console.error("Error deleting submission:", error);
      showError('Lỗi khi xóa món ăn.');
    } else {
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      showSuccess('Đã xóa món ăn thành công.');
    }
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

          <div className="mt-8 pt-6 border-t">
            <h3 className="text-xl font-semibold mb-4">Địa điểm của bạn</h3>
            <Link to="/submit-food">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Thêm địa điểm mới
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Các địa điểm bạn đã thêm</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length > 0 ? (
              <div className="space-y-4">
                {submissions.map(submission => (
                  <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">{submission.ten}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/submit-food/${submission.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này không thể hoàn tác. Địa điểm bạn thêm sẽ bị xóa vĩnh viễn.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSubmission(submission.id)}>
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Bạn chưa thêm địa điểm nào.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;