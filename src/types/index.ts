export interface LoaiMon {
  id: string;
  ten: string;
  icon?: string;
}

export interface MonAnBranch {
  diaChi: string;
  thanhPho: string;
  googleMapLink: string;
  gioMoCua?: string;
  soDienThoai?: string;
}

export interface MonAn {
  id: string;
  ten: string;
  loaiIds: string[];
  hinhAnh: string[];
  moTa: string;
  branches: MonAnBranch[]; // Thay thế các trường địa chỉ đơn lẻ bằng mảng chi nhánh
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