/**
 * Phân tích chuỗi thời gian như "7:30 AM–10 PM" thành số phút từ đầu ngày.
 * @param timeString Chuỗi thời gian cần phân tích.
 * @returns Một đối tượng chứa phút bắt đầu, phút kết thúc và liệu có qua đêm hay không, hoặc null nếu không hợp lệ.
 */
const parseOpeningHours = (timeString: string): { startMinutes: number; endMinutes: number; spansMidnight: boolean } | null => {
  try {
    const parts = timeString.replace(/ /g, '').split(/–|-/);
    if (parts.length !== 2) return null;

    const parseTime = (timePart: string): number => {
      let hours: number;
      let minutes: number;
      
      const timeMatch = timePart.match(/(\d{1,2}):?(\d{2})?(AM|PM)/i);
      if (!timeMatch) return NaN;

      hours = parseInt(timeMatch[1], 10);
      minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const period = timeMatch[3].toUpperCase();

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      }
      if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return hours * 60 + minutes;
    };

    const startMinutes = parseTime(parts[0]);
    const endMinutes = parseTime(parts[1]);

    if (isNaN(startMinutes) || isNaN(endMinutes)) return null;

    return {
      startMinutes,
      endMinutes,
      spansMidnight: endMinutes < startMinutes,
    };
  } catch (error) {
    console.error(`Error parsing time string: "${timeString}"`, error);
    return null;
  }
};

/**
 * Kiểm tra xem một quán có đang mở cửa dựa trên giờ hoạt động và thời gian hiện tại hay không.
 * @param openingHours Chuỗi giờ hoạt động của quán.
 * @returns `true` nếu đang mở, `false` nếu đóng cửa, `null` nếu không có thông tin.
 */
export const isStoreOpen = (openingHours?: string): boolean | null => {
  if (!openingHours || openingHours.trim() === '') {
    return null; // Không có thông tin
  }

  const hours = parseOpeningHours(openingHours);
  if (!hours) {
    return null; // Định dạng không hợp lệ
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (hours.spansMidnight) {
    // Mở qua đêm (ví dụ: 10 PM - 2 AM)
    return currentMinutes >= hours.startMinutes || currentMinutes < hours.endMinutes;
  } else {
    // Mở trong ngày
    return currentMinutes >= hours.startMinutes && currentMinutes < hours.endMinutes;
  }
};