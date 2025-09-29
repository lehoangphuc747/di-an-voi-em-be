export interface LoaiMon {
  id: string;
  ten: string;
  icon?: string;
}

export interface MonAn {
  id: string;
  ten: string;
  loaiId: string;
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
}

export interface YeuThich {
  monAnId: string;
  ghiChu?: string;
}