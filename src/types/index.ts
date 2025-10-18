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
  moTa?: string; // Made optional to fix compile errors
}

// Represents a row in the 'favorites' table from the database
export interface YeuThich {
  id: string;
  user_id: string;
  mon_an_id: string;
  created_at: string;
  ghi_chu?: string | null;
}

// Represents a simplified favorite entry for client-side state
export interface FavoriteEntry {
  monAnId: string;
  ghiChu: string;
}

// Represents a simplified visited entry for client-side state
export interface VisitedEntry {
  monAnId: string;
  rating: number | null;
  notes: string;
}

// Represents the state of user's lists (used in SessionContext)
export interface UserLists {
  favorites: string[];
  wishlist: string[];
  visited: string[];
}

// Represents the structure of the user's backup data
export interface UserBackupData {
  favorites: { mon_an_id: string; ghi_chu: string | null }[];
  wishlist: { mon_an_id: string }[];
  visited: { mon_an_id: string; rating: number | null; notes: string | null }[];
  personal_notes: { mon_an_id: string; content: string }[];
}