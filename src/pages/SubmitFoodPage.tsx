"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { showError, showSuccess } from '@/utils/toast';
import loaiMonData from '@/data/loaimon.json';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  ten: z.string().min(1, { message: "Tên món ăn không được để trống." }).max(100, { message: "Tên món ăn quá dài." }),
  loaiId: z.string().min(1, { message: "Vui lòng chọn loại món ăn." }),
  hinhAnh: z.array(z.string().url({ message: "URL hình ảnh không hợp lệ." })).optional(),
  moTa: z.string().max(500, { message: "Mô tả quá dài." }).optional(),
  diaChi: z.string().min(1, { message: "Địa chỉ không được để trống." }).max(200, { message: "Địa chỉ quá dài." }),
  thanhPho: z.string().min(1, { message: "Thành phố không được để trống." }).max(50, { message: "Tên thành phố quá dài." }),
  googleMapLink: z.string().url({ message: "URL Google Maps không hợp lệ." }).optional().or(z.literal('')),
  facebookLink: z.string().url({ message: "URL Facebook không hợp lệ." }).optional().or(z.literal('')),
  tags: z.array(z.string().min(1, { message: "Tag không được để trống." })).optional(),
  giaMin: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, { message: "Giá tối thiểu phải là số dương." }).optional()
  ),
  giaMax: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, { message: "Giá tối đa phải là số dương." }).optional()
  ),
}).refine(data => {
  if (data.giaMin !== undefined && data.giaMax !== undefined && data.giaMin > data.giaMax) {
    return false;
  }
  return true;
}, {
  message: "Giá tối thiểu không được lớn hơn giá tối đa.",
  path: ["giaMin"],
});

type SubmitFoodFormValues = z.infer<typeof formSchema>;

const SubmitFoodPage = () => {
  const { user } = useSession();
  const navigate = useNavigate();
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [tagInputs, setTagInputs] = useState<string[]>(['']);

  const form = useForm<SubmitFoodFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ten: '',
      loaiId: '',
      hinhAnh: [],
      moTa: '',
      diaChi: '',
      thanhPho: '',
      googleMapLink: '',
      facebookLink: '',
      tags: [],
      giaMin: undefined,
      giaMax: undefined,
    },
  });

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    form.setValue('hinhAnh', newUrls.filter(url => url.trim() !== ''));
  };

  const handleAddImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleRemoveImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    form.setValue('hinhAnh', newUrls.filter(url => url.trim() !== ''));
  };

  const handleTagInputChange = (index: number, value: string) => {
    const newTags = [...tagInputs];
    newTags[index] = value;
    setTagInputs(newTags);
    form.setValue('tags', newTags.filter(tag => tag.trim() !== ''));
  };

  const handleAddTagInput = () => {
    setTagInputs([...tagInputs, '']);
  };

  const handleRemoveTagInput = (index: number) => {
    const newTags = tagInputs.filter((_, i) => i !== index);
    setTagInputs(newTags);
    form.setValue('tags', newTags.filter(tag => tag.trim() !== ''));
  };

  const onSubmit = async (values: SubmitFoodFormValues) => {
    if (!user) {
      showError('Bạn cần đăng nhập để gửi món ăn.');
      return;
    }

    const { giaMin, giaMax, ...rest } = values;

    const payload = {
      user_id: user.id,
      ...rest,
      hinh_anh: values.hinhAnh || [],
      tags: values.tags || [],
      gia_min: giaMin,
      gia_max: giaMax,
    };

    const { error } = await supabase
      .from('user_submitted_mon_an')
      .insert([payload]);

    if (error) {
      console.error("Error submitting food item:", error);
      showError('Lỗi khi gửi món ăn. Vui lòng thử lại.');
    } else {
      showSuccess('Món ăn của bạn đã được gửi thành công và đang chờ duyệt!');
      form.reset();
      setImageUrls(['']);
      setTagInputs(['']);
      navigate('/'); // Redirect to home or a confirmation page
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Thêm món ăn mới</h1>
      <p className="text-muted-foreground mb-8">
        Hãy chia sẻ những món ăn ngon mà bạn biết! Món ăn của bạn sẽ được hiển thị sau khi được duyệt.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="ten"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên món ăn / Quán ăn <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: Bún bò Huế, Quán Cơm Tấm Sài Gòn" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loaiId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại món ăn <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại món ăn" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loaiMonData.map((loai) => (
                      <SelectItem key={loai.id} value={loai.id}>
                        {loai.ten}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Hình ảnh (URL)</FormLabel>
            <div className="space-y-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder="Dán URL hình ảnh vào đây"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  />
                  {imageUrls.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveImageUrl(index)}>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddImageUrl}>
                <PlusCircle className="h-4 w-4 mr-2" /> Thêm hình ảnh
              </Button>
            </div>
            {form.formState.errors.hinhAnh && <p className="text-sm font-medium text-destructive">{form.formState.errors.hinhAnh.message}</p>}
          </FormItem>

          <FormField
            control={form.control}
            name="moTa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Textarea placeholder="Mô tả chi tiết về món ăn hoặc quán ăn..." rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="diaChi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: 123 Đường ABC, Phường XYZ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="thanhPho"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thành phố <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: Đà Lạt, Nha Trang" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="googleMapLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Liên kết Google Maps</FormLabel>
                <FormControl>
                  <Input placeholder="Dán URL Google Maps vào đây" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facebookLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Liên kết Facebook</FormLabel>
                <FormControl>
                  <Input placeholder="Dán URL Facebook vào đây" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Tags</FormLabel>
            <div className="space-y-2">
              {tagInputs.map((tag, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder="Thêm tag (ví dụ: ăn vặt, hải sản)"
                    value={tag}
                    onChange={(e) => handleTagInputChange(index, e.target.value)}
                  />
                  {tagInputs.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveTagInput(index)}>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddTagInput}>
                <PlusCircle className="h-4 w-4 mr-2" /> Thêm tag
              </Button>
            </div>
            {form.formState.errors.tags && <p className="text-sm font-medium text-destructive">{form.formState.errors.tags.message}</p>}
          </FormItem>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="giaMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá tối thiểu (VNĐ)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ví dụ: 20000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="giaMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá tối đa (VNĐ)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ví dụ: 50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
            )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gửi món ăn
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SubmitFoodPage;