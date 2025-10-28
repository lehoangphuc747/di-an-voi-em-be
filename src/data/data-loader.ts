import { MonAn } from '@/types';

// Sử dụng tính năng import.meta.glob của Vite để tự động nhập tất cả các tệp .json
const modules: Record<string, { default: MonAn }> = import.meta.glob('/src/data/monan/*.json', { eager: true });

// Chuyển đổi các module đã nhập thành một mảng MonAn duy nhất
export const monAnData: MonAn[] = Object.values(modules).map(module => module.default);

// Tìm món ăn theo ID
export const findMonAnById = (id?: string): MonAn | undefined => {
  if (!id) return undefined;
  // Dữ liệu đã được tải sẵn, chỉ cần tìm trong mảng
  return monAnData.find(m => m.id === id);
};