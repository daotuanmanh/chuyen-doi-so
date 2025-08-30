// Utility functions for date/time handling with timezone support

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export interface DateFormatOption {
  value: string;
  label: string;
  example: string;
}

// Danh sách múi giờ phổ biến
export const timezoneOptions: TimezoneOption[] = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Việt Nam (GMT+7)', offset: '+07:00' },
  { value: 'Asia/Bangkok', label: 'Thái Lan (GMT+7)', offset: '+07:00' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)', offset: '+08:00' },
  { value: 'Asia/Tokyo', label: 'Nhật Bản (GMT+9)', offset: '+09:00' },
  { value: 'Asia/Seoul', label: 'Hàn Quốc (GMT+9)', offset: '+09:00' },
  { value: 'Asia/Shanghai', label: 'Trung Quốc (GMT+8)', offset: '+08:00' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (GMT+8)', offset: '+08:00' },
  { value: 'Asia/Kuala_Lumpur', label: 'Malaysia (GMT+8)', offset: '+08:00' },
  { value: 'Asia/Manila', label: 'Philippines (GMT+8)', offset: '+08:00' },
  { value: 'Asia/Jakarta', label: 'Indonesia (GMT+7)', offset: '+07:00' },
  { value: 'Asia/Kolkata', label: 'Ấn Độ (GMT+5:30)', offset: '+05:30' },
  { value: 'Europe/London', label: 'Anh (GMT+0)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Pháp (GMT+1)', offset: '+01:00' },
  { value: 'Europe/Berlin', label: 'Đức (GMT+1)', offset: '+01:00' },
  { value: 'America/New_York', label: 'New York (GMT-5)', offset: '-05:00' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)', offset: '-08:00' },
  { value: 'America/Chicago', label: 'Chicago (GMT-6)', offset: '-06:00' },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+10)', offset: '+10:00' },
  { value: 'Australia/Melbourne', label: 'Melbourne (GMT+10)', offset: '+10:00' },
  { value: 'Pacific/Auckland', label: 'New Zealand (GMT+12)', offset: '+12:00' },
];

// Các định dạng ngày phổ biến
export const dateFormatOptions: DateFormatOption[] = [
  { value: 'DD/MM/YYYY', label: 'Ngày/Tháng/Năm', example: '25/12/2025' },
  { value: 'MM/DD/YYYY', label: 'Tháng/Ngày/Năm', example: '12/25/2025' },
  { value: 'YYYY-MM-DD', label: 'Năm-Tháng-Ngày', example: '2025-12-25' },
  { value: 'DD-MM-YYYY', label: 'Ngày-Tháng-Năm', example: '25-12-2025' },
  { value: 'DD/MM/YY', label: 'Ngày/Tháng/Năm (2 số)', example: '25/12/25' },
  { value: 'MM/DD/YY', label: 'Tháng/Ngày/Năm (2 số)', example: '12/25/25' },
  { value: 'DD MMM YYYY', label: 'Ngày Tháng Năm (viết tắt)', example: '25 Dec 2025' },
  { value: 'DD MMMM YYYY', label: 'Ngày Tháng Năm (đầy đủ)', example: '25 December 2025' },
  { value: 'DD/MM/YYYY HH:mm', label: 'Ngày/Tháng/Năm Giờ:Phút', example: '25/12/2025 14:30' },
  { value: 'DD/MM/YYYY HH:mm:ss', label: 'Ngày/Tháng/Năm Giờ:Phút:Giây', example: '25/12/2025 14:30:45' },
];

// Format date theo timezone và format
export function formatDate(
  date: Date | string | number,
  format: string = 'DD/MM/YYYY',
  timezone: string = 'Asia/Ho_Chi_Minh'
): string {
  try {
    const dateObj = new Date(date);
    
    // Convert to target timezone
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };

    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const parts = formatter.formatToParts(dateObj);
    
    const dateParts: { [key: string]: string } = {};
    parts.forEach(part => {
      dateParts[part.type] = part.value;
    });

    // Custom format mapping
    let result = format;
    
    // Replace format patterns
    result = result.replace(/YYYY/g, dateParts.year || '');
    result = result.replace(/YY/g, (dateParts.year || '').slice(-2));
    result = result.replace(/MM/g, dateParts.month || '');
    result = result.replace(/DD/g, dateParts.day || '');
    result = result.replace(/HH/g, dateParts.hour || '');
    result = result.replace(/mm/g, dateParts.minute || '');
    result = result.replace(/ss/g, dateParts.second || '');
    
    // Month names
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const fullMonthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthIndex = parseInt(dateParts.month || '1') - 1;
    result = result.replace(/MMM/g, monthNames[monthIndex] || '');
    result = result.replace(/MMMM/g, fullMonthNames[monthIndex] || '');
    
    return result;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

// Format currency theo locale và currency
export function formatCurrency(
  amount: number,
  currency: string = 'VND',
  locale: string = 'vi-VN'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount.toLocaleString()} ${currency}`;
  }
}

// Get current time in specific timezone
export function getCurrentTime(timezone: string = 'Asia/Ho_Chi_Minh'): string {
  try {
    const now = new Date();
    return now.toLocaleString('vi-VN', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error getting current time:', error);
    return new Date().toLocaleString('vi-VN');
  }
}

// Get timezone offset string
export function getTimezoneOffset(timezone: string): string {
  try {
    const date = new Date();
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc + (new Date().toLocaleString("en-US", {timeZone: timezone}) as any));
    const offset = (targetTime.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.abs(Math.floor(offset));
    const minutes = Math.abs(Math.floor((offset % 1) * 60));
    
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error getting timezone offset:', error);
    return '+00:00';
  }
}

// Validate timezone
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
}

// Get system timezone
export function getSystemTimezone(): string {
  try {
    const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Nếu múi giờ hệ thống là Etc/GMT-7 hoặc tương tự, sử dụng Asia/Ho_Chi_Minh cho Việt Nam
    if (systemTimezone.includes('Etc/GMT') || systemTimezone.includes('GMT')) {
      return 'Asia/Ho_Chi_Minh';
    }
    
    return systemTimezone;
  } catch (error) {
    return 'Asia/Ho_Chi_Minh';
  }
}

// Parse date string to Date object
export function parseDate(dateString: string, format: string = 'DD/MM/YYYY'): Date | null {
  try {
    // Simple parsing for common formats
    if (format === 'DD/MM/YYYY') {
      const [day, month, year] = dateString.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else if (format === 'MM/DD/YYYY') {
      const [month, day, year] = dateString.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else if (format === 'YYYY-MM-DD') {
      return new Date(dateString);
    }
    
    return new Date(dateString);
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}
