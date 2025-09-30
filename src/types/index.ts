export interface LoaiMon {
  id: string;
  ten: string;
  icon?: string;
}

export interface MonAn {
  id: string;
  ten: string;
  loaiIds: string[]; // Thay đổi từ loaiId: string
  hinhAnh: string[];
  moTa: string;
  diaChi: string;
  thanhPho: string;
  googleMapLink: string;
  facebookLink?: string;
  tags: string[];
  giaMin?: number;
  giaMax?: number;
  ngayTao: string; // ISO 8601 date string
  gioMoCua?: string; // Thêm trường giờ mở cửa
  soDienThoai?: string; // Thêm trường số điện thoại
}

export interface YeuThich {
  monAnId: string;
  ghiChu?: string;
}

export interface Profile {
  id: string;
  nickname?: string | null;
  avatar_url?: string | null;
  updated_at?: string;
}