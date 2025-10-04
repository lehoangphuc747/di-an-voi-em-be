export interface LoaiMon {
  id: string;
  ten: string;
  icon?: string;
}

export interface MonAn {
  id: string;
  ten: string;
  loaiIds: string[];
  hinhAnh: string[];
  moTa: string;
  diaChi: string; // Hoàn nguyên về địa chỉ đơn lẻ
  thanhPho: string; // Hoàn nguyên về thành phố đơn lẻ
  googleMapLink?: string; // Hoàn nguyên về liên kết Google Maps đơn lẻ
  gioMoCua?: string; // Hoàn nguyên về giờ mở cửa đơn lẻ
  soDienThoai?: string; // Hoàn nguyên về số điện thoại đơn lẻ
  facebookLink?: string;
  tags: string[];
  giaMin?: number;
  giaMax?: number;
  ngayTao: string; // ISO 8601 date string
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