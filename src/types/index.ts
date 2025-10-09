// Corresponds to a food item from the JSON data or user_submitted_mon_an table
export interface MonAn {
  id: string;
  ten: string;
  loaiIds: string[];
  hinhAnh: string[];
  moTa: string;
  diaChi: string;
  thanhPho: string;
  googleMapLink?: string;
  facebookLink?: string;
  tags: string[];
  giaMin?: number;
  giaMax?: number;
  ngayTao: string;
  gioMoCua?: string;
  soDienThoai?: string;
  user_id?: string; // For user-submitted items
}

// Corresponds to a food category from loaimon.json
export interface LoaiMon {
  id: string;
  ten: string;
  moTa: string;
}

// Represents a row in the 'favorites' table
export interface YeuThich {
  id: string;
  user_id: string;
  mon_an_id: string;
  created_at: string;
}

// Represents the state of user's lists
export interface UserLists {
  favorites: string[];
  wishlist: string[];
  visited: string[];
}