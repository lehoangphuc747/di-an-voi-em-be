import { useState, useEffect, useMemo } from 'react';
import { MonAn } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { monAnData as staticMonAnData } from '@/data/loader';
import { showError } from '@/utils/toast';

export const useAllMonAn = () => {
  const [userSubmittedMonAn, setUserSubmittedMonAn] = useState<MonAn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserSubmittedMonAn = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_submitted_mon_an')
        .select('*')
        .eq('is_approved', true);

      if (error) {
        console.error("Error fetching user submitted food items:", error);
        showError('Lỗi khi tải món ăn do người dùng gửi.');
        setUserSubmittedMonAn([]);
      } else {
        const formattedData: MonAn[] = data.map(item => ({
          id: item.id,
          ten: item.ten,
          loaiIds: [item.loai_id],
          hinhAnh: item.hinh_anh && item.hinh_anh.length > 0 ? item.hinh_anh : ['/placeholder.svg'],
          moTa: item.mo_ta || '',
          diaChi: item.dia_chi,
          thanhPho: item.thanh_pho,
          googleMapLink: item.google_map_link || '',
          facebookLink: item.facebook_link || '',
          tags: item.tags || [],
          giaMin: item.gia_min || undefined,
          giaMax: item.gia_max || undefined,
          ngayTao: item.ngay_tao,
          gioMoCua: item.gio_mo_cua || undefined,
          soDienThoai: item.so_dien_thoai || undefined,
        }));
        setUserSubmittedMonAn(formattedData);
      }
      setIsLoading(false);
    };

    fetchUserSubmittedMonAn();
  }, []);

  const allMonAn = useMemo(() => {
    return [...staticMonAnData, ...userSubmittedMonAn];
  }, [userSubmittedMonAn]);

  return { allMonAn, isLoading };
};