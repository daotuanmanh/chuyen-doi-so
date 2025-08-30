// Hệ thống cảnh báo thông minh cho dữ liệu sales
import { SettingsData } from '@/contexts/SettingsContext';

export interface AlertRule {
  id: string;
  type: 'revenue' | 'roi' | 'growth' | 'decline' | 'custom';
  condition: 'above' | 'below' | 'equals' | 'changes';
  threshold: number;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  data: any;
  acknowledged: boolean;
  dismissed: boolean;
}

export interface SalesData {
  branch: string;
  revenue: number;
  profit: number;
  roi: number;
  growth: number;
  period: string;
}

// Kiểm tra và tạo cảnh báo dựa trên dữ liệu
export function checkAlerts(
  salesData: SalesData[],
  settings: SettingsData
): Alert[] {
  const alerts: Alert[] = [];
  
  if (!settings.alertSettings.alertsEnabled) {
    return alerts; // Không có cảnh báo nếu tắt hệ thống
  }

  // Tính toán tổng quan
  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const avgROI = salesData.reduce((sum, item) => sum + item.roi, 0) / salesData.length;
  const totalProfit = salesData.reduce((sum, item) => sum + item.profit, 0);

  // 1. Cảnh báo doanh thu
  if (settings.alertSettings.enableRevenueAlerts && totalRevenue < settings.alertSettings.revenueThreshold) {
    const shortfall = settings.alertSettings.revenueThreshold - totalRevenue;
    const shortfallPercentage = ((shortfall / settings.alertSettings.revenueThreshold) * 100).toFixed(1);
    
    const severity = parseFloat(shortfallPercentage) > 50 ? 'critical' : parseFloat(shortfallPercentage) > 25 ? 'high' : 'medium';
    
         if (settings.alertSettings.severityLevels?.[severity] ?? true) {
       alerts.push({
         id: `revenue-${Date.now()}`,
         ruleId: 'revenue-threshold',
         type: 'revenue',
         message: `🚨 CẢNH BÁO DOANH THU: Doanh thu hiện tại ${formatCurrency(totalRevenue, settings.userPreferences.currency)} thấp hơn ${shortfallPercentage}% so với mục tiêu ${formatCurrency(settings.alertSettings.revenueThreshold, settings.userPreferences.currency)}. Thiếu hụt ${formatCurrency(shortfall, settings.userPreferences.currency)}. Cần kiểm tra chiến lược bán hàng và tối ưu hóa các kênh marketing.`,
         severity,
         timestamp: new Date(),
         data: { totalRevenue, threshold: settings.alertSettings.revenueThreshold, shortfall, shortfallPercentage },
         acknowledged: false,
         dismissed: false
       });
     }
  }

  // 2. Cảnh báo ROI
  if (settings.alertSettings.enableROIAlerts && avgROI < settings.alertSettings.roiThreshold) {
    const roiGap = settings.alertSettings.roiThreshold - avgROI;
    const roiGapPercentage = ((roiGap / settings.alertSettings.roiThreshold) * 100).toFixed(1);
    
    const severity = parseFloat(roiGapPercentage) > 50 ? 'critical' : parseFloat(roiGapPercentage) > 25 ? 'high' : 'medium';
    
         if (settings.alertSettings.severityLevels?.[severity] ?? true) {
       alerts.push({
         id: `roi-${Date.now()}`,
         ruleId: 'roi-threshold',
         type: 'roi',
         message: `📉 CẢNH BÁO ROI: ROI trung bình ${avgROI.toFixed(2)}% thấp hơn ${roiGapPercentage}% so với mục tiêu ${settings.alertSettings.roiThreshold}%. Khoảng cách ${roiGap.toFixed(2)}%. Cần xem xét lại chi phí quảng cáo, tối ưu hóa chiến lược marketing và cải thiện hiệu quả chuyển đổi khách hàng.`,
         severity,
         timestamp: new Date(),
         data: { avgROI, threshold: settings.alertSettings.roiThreshold, roiGap, roiGapPercentage },
         acknowledged: false,
         dismissed: false
       });
     }
  }

  // 3. Cảnh báo chi nhánh có vấn đề
  if (settings.alertSettings.enableBranchAlerts) {
    const problematicBranches = salesData.filter(item => 
      item.revenue < settings.alertSettings.revenueThreshold * 0.5 || 
      item.roi < settings.alertSettings.roiThreshold * 0.5
    );

    problematicBranches.forEach(branch => {
      const revenueGap = settings.alertSettings.revenueThreshold * 0.5 - branch.revenue;
      const roiGap = settings.alertSettings.roiThreshold * 0.5 - branch.roi;
      
      const severity = revenueGap > settings.alertSettings.revenueThreshold * 0.3 || roiGap > settings.alertSettings.roiThreshold * 0.3 ? 'critical' : 'high';
      
             if (settings.alertSettings.severityLevels?.[severity] ?? true) {
         alerts.push({
           id: `branch-${branch.branch}-${Date.now()}`,
           ruleId: 'branch-performance',
           type: 'branch',
           message: `🏢 CẢNH BÁO CHI NHÁNH ${branch.branch}: Hiệu suất kém nghiêm trọng! Doanh thu ${formatCurrency(branch.revenue, settings.userPreferences.currency)} (thiếu ${formatCurrency(revenueGap, settings.userPreferences.currency)}), ROI ${branch.roi.toFixed(2)}% (thấp hơn ${roiGap.toFixed(2)}%). Cần can thiệp ngay lập tức: kiểm tra quản lý, đào tạo nhân viên, và xem xét lại chiến lược kinh doanh tại chi nhánh này.`,
           severity,
           timestamp: new Date(),
           data: { ...branch, revenueGap, roiGap },
           acknowledged: false,
           dismissed: false
         });
       }
    });
  }

  // 4. Cảnh báo tăng trưởng âm
  if (settings.alertSettings.enableGrowthAlerts) {
    const negativeGrowth = salesData.filter(item => item.growth < settings.alertSettings.growthThreshold);
    if (negativeGrowth.length > 0) {
      const avgNegativeGrowth = negativeGrowth.reduce((sum, item) => sum + item.growth, 0) / negativeGrowth.length;
      const worstBranch = negativeGrowth.reduce((worst, current) => current.growth < worst.growth ? current : worst);
      
      const severity = avgNegativeGrowth < -20 ? 'critical' : avgNegativeGrowth < -10 ? 'high' : 'medium';
      
             if (settings.alertSettings.severityLevels?.[severity] ?? true) {
         alerts.push({
           id: `growth-${Date.now()}`,
           ruleId: 'negative-growth',
           type: 'growth',
           message: `📉 CẢNH BÁO TĂNG TRƯỞNG ÂM: ${negativeGrowth.length} chi nhánh đang suy giảm với mức tăng trưởng trung bình ${avgNegativeGrowth.toFixed(2)}%. Chi nhánh ${worstBranch.branch} có mức giảm nghiêm trọng nhất (${worstBranch.growth.toFixed(2)}%). Cần phân tích nguyên nhân, đánh giá thị trường và triển khai biện pháp khắc phục ngay lập tức.`,
           severity,
           timestamp: new Date(),
           data: { negativeGrowth, avgNegativeGrowth, worstBranch },
           acknowledged: false,
           dismissed: false
         });
       }
    }
  }

  // 5. Cảnh báo lợi nhuận thấp
  if (settings.alertSettings.enableProfitAlerts && totalProfit < settings.alertSettings.profitThreshold) {
    const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);
    const profitGap = settings.alertSettings.profitThreshold - totalProfit;
    
    const severity = profitGap > settings.alertSettings.profitThreshold * 0.5 ? 'critical' : profitGap > settings.alertSettings.profitThreshold * 0.25 ? 'high' : 'medium';
    
         if (settings.alertSettings.severityLevels?.[severity] ?? true) {
       alerts.push({
         id: `profit-${Date.now()}`,
         ruleId: 'low-profit-margin',
         type: 'profit',
         message: `💰 CẢNH BÁO LỢI NHUẬN: Tỷ suất lợi nhuận chỉ ${profitMargin}% (thấp hơn mức chuẩn 10%). Lợi nhuận ${formatCurrency(totalProfit, settings.userPreferences.currency)} trên doanh thu ${formatCurrency(totalRevenue, settings.userPreferences.currency)}. Cần kiểm soát chi phí, tối ưu hóa giá bán và cải thiện hiệu quả vận hành.`,
         severity,
         timestamp: new Date(),
         data: { totalProfit, totalRevenue, profitMargin, profitGap },
         acknowledged: false,
         dismissed: false
       });
     }
  }

  // 6. Cảnh báo chi phí quảng cáo cao (tính từ ROI)
  if (settings.alertSettings.enableAdCostAlerts) {
    const estimatedAdCost = totalRevenue * (avgROI / 100); // Ước tính từ ROI
    const adCostRatio = estimatedAdCost / totalRevenue;
    const adCostPercentage = (adCostRatio * 100);
    
    if (adCostPercentage > settings.alertSettings.adCostThreshold) {
      const severity = adCostPercentage > settings.alertSettings.adCostThreshold * 1.5 ? 'critical' : adCostPercentage > settings.alertSettings.adCostThreshold * 1.2 ? 'high' : 'medium';
      
             if (settings.alertSettings.severityLevels?.[severity] ?? true) {
         alerts.push({
           id: `adcost-${Date.now()}`,
           ruleId: 'high-ad-cost',
           type: 'adcost',
           message: `📺 CẢNH BÁO CHI PHÍ QUẢNG CÁO: Chi phí quảng cáo ước tính ${formatCurrency(estimatedAdCost, settings.userPreferences.currency)} chiếm ${adCostPercentage.toFixed(1)}% doanh thu (cao hơn mức chuẩn ${settings.alertSettings.adCostThreshold}%). Cần đánh giá hiệu quả ROI của các kênh quảng cáo, tối ưu hóa ngân sách và tìm kiếm các kênh marketing hiệu quả hơn.`,
           severity,
           timestamp: new Date(),
           data: { estimatedAdCost, totalRevenue, adCostRatio, adCostPercentage },
           acknowledged: false,
           dismissed: false
         });
       }
    }
  }

  // 7. Cảnh báo biến động lớn giữa các chi nhánh
  const revenues = salesData.map(item => item.revenue);
  const maxRevenue = Math.max(...revenues);
  const minRevenue = Math.min(...revenues);
  const revenueVariation = ((maxRevenue - minRevenue) / maxRevenue) * 100;
  
  if (revenueVariation > 80) { // Biến động trên 80%
    alerts.push({
      id: `variation-${Date.now()}`,
      ruleId: 'high-revenue-variation',
      type: 'variation',
      message: `📊 CẢNH BÁO BIẾN ĐỘNG DOANH THU: Chênh lệch giữa chi nhánh cao nhất và thấp nhất lên tới ${revenueVariation.toFixed(1)}% (${formatCurrency(maxRevenue, settings.userPreferences.currency)} vs ${formatCurrency(minRevenue, settings.userPreferences.currency)}). Cần phân tích nguyên nhân, chia sẻ best practices và hỗ trợ các chi nhánh yếu kém.`,
      severity: 'medium',
      timestamp: new Date(),
      data: { maxRevenue, minRevenue, revenueVariation },
      acknowledged: false,
      dismissed: false
    });
  }

  // 7. Cảnh báo biến động lớn (nếu có dữ liệu lịch sử)
  if (settings.alertSettings.enableVariationAlerts && salesData.length > 1) {
    const revenues = salesData.map(item => item.revenue);
    const meanRevenue = revenues.reduce((sum, rev) => sum + rev, 0) / revenues.length;
    const variance = revenues.reduce((sum, rev) => sum + Math.pow(rev - meanRevenue, 2), 0) / revenues.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = (standardDeviation / meanRevenue) * 100;
    
    if (coefficientOfVariation > 50) { // Biến động trên 50%
      const severity = coefficientOfVariation > 100 ? 'critical' : coefficientOfVariation > 75 ? 'high' : 'medium';
      
             if (settings.alertSettings.severityLevels?.[severity] ?? true) {
         alerts.push({
           id: `variation-${Date.now()}`,
           ruleId: 'high-variation',
           type: 'variation',
           message: `📊 CẢNH BÁO BIẾN ĐỘNG: Hệ số biến động doanh thu ${coefficientOfVariation.toFixed(1)}% (cao hơn mức chuẩn 50%). Điều này cho thấy doanh thu không ổn định, có thể do thị trường biến động hoặc chiến lược kinh doanh chưa hiệu quả. Cần phân tích nguyên nhân và ổn định hoạt động.`,
           severity,
           timestamp: new Date(),
           data: { coefficientOfVariation, meanRevenue, standardDeviation },
           acknowledged: false,
           dismissed: false
         });
       }
    }
  }

  // 8. Cảnh báo hiệu suất tổng thể
  const overallPerformance = (avgROI * 0.4) + ((totalProfit / totalRevenue) * 100 * 0.3) + ((totalRevenue / settings.alertSettings.revenueThreshold) * 100 * 0.3);
  
  if (overallPerformance < 60) { // Hiệu suất tổng thể dưới 60%
    const severity = overallPerformance < 30 ? 'critical' : overallPerformance < 45 ? 'high' : 'medium';
    
         if (settings.alertSettings.severityLevels?.[severity] ?? true) {
       alerts.push({
         id: `performance-${Date.now()}`,
         ruleId: 'overall-performance',
         type: 'performance',
         message: `🎯 CẢNH BÁO HIỆU SUẤT TỔNG THỂ: Chỉ số hiệu suất đạt ${overallPerformance.toFixed(1)}/100 (thấp hơn mức chuẩn 60%). Cần xem xét toàn diện: tối ưu hóa ROI, cải thiện tỷ suất lợi nhuận và tăng doanh thu để đạt mục tiêu kinh doanh.`,
         severity,
         timestamp: new Date(),
         data: { overallPerformance, avgROI, profitMargin: (totalProfit / totalRevenue) * 100, revenueRatio: (totalRevenue / settings.alertSettings.revenueThreshold) * 100 },
         acknowledged: false,
         dismissed: false
       });
     }
  }

  return alerts;
}

// Gửi cảnh báo qua email (giả lập)
export async function sendEmailAlert(alert: Alert, settings: SettingsData): Promise<boolean> {
  if (!settings.alertSettings.emailNotifications) return false;

  try {
    // Giả lập gửi email
    console.log('📧 Gửi email cảnh báo:', {
      to: 'admin@company.com',
      subject: `Cảnh báo: ${alert.type}`,
      message: alert.message,
      severity: alert.severity,
      timestamp: alert.timestamp
    });

    // Trong thực tế sẽ gọi API email service
    // await emailService.send({
    //   to: settings.email,
    //   subject: `[CẢNH BÁO] ${alert.message}`,
    //   body: generateEmailTemplate(alert)
    // });

    return true;
  } catch (error) {
    console.error('Lỗi gửi email cảnh báo:', error);
    return false;
  }
}

// Gửi push notification (giả lập)
export async function sendPushNotification(alert: Alert, settings: SettingsData): Promise<boolean> {
  if (!settings.alertSettings.pushNotifications) return false;

  try {
    // Giả lập push notification
    console.log('🔔 Gửi push notification:', {
      title: `Cảnh báo ${alert.severity.toUpperCase()}`,
      body: alert.message,
      icon: getAlertIcon(alert.severity),
      timestamp: alert.timestamp
    });

    // Trong thực tế sẽ gọi Web Push API
    // if ('serviceWorker' in navigator && 'PushManager' in window) {
    //   const registration = await navigator.serviceWorker.ready;
    //   await registration.showNotification(title, options);
    // }

    return true;
  } catch (error) {
    console.error('Lỗi gửi push notification:', error);
    return false;
  }
}

// Hiển thị cảnh báo trong UI
export function showInAppAlert(alert: Alert): void {
  // Tạo toast notification
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
    alert.severity === 'critical' ? 'bg-red-500 text-white' :
    alert.severity === 'high' ? 'bg-orange-500 text-white' :
    alert.severity === 'medium' ? 'bg-yellow-500 text-black' :
    'bg-blue-500 text-white'
  }`;
  
  toast.innerHTML = `
    <div class="flex items-start">
      <div class="flex-shrink-0">
        ${getAlertIcon(alert.severity)}
      </div>
      <div class="ml-3">
        <p class="text-sm font-medium">${alert.message}</p>
        <p class="text-xs opacity-75 mt-1">${formatDate(alert.timestamp, 'DD/MM/YYYY HH:mm')}</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white opacity-75 hover:opacity-100">
        ✕
      </button>
    </div>
  `;

  document.body.appendChild(toast);
  
  // Tự động ẩn sau 10 giây
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 10000);
}

// Lấy icon cho cảnh báo
function getAlertIcon(severity: string): string {
  switch (severity) {
    case 'critical': return '🚨';
    case 'high': return '⚠️';
    case 'medium': return '📊';
    case 'low': return 'ℹ️';
    default: return '🔔';
  }
}

// Format currency helper
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date helper
function formatDate(date: Date, format: string): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year.toString())
    .replace('HH', hours)
    .replace('mm', minutes);
}

// Tạo báo cáo cảnh báo
export function generateAlertReport(alerts: Alert[]): string {
  if (alerts.length === 0) {
    return '✅ Không có cảnh báo nào';
  }

  const critical = alerts.filter(a => a.severity === 'critical').length;
  const high = alerts.filter(a => a.severity === 'high').length;
  const medium = alerts.filter(a => a.severity === 'medium').length;
  const low = alerts.filter(a => a.severity === 'low').length;

  return `
📊 Báo cáo cảnh báo (${alerts.length} cảnh báo):
🚨 Critical: ${critical}
⚠️ High: ${high}
📊 Medium: ${medium}
ℹ️ Low: ${low}

${alerts.map(alert => `• ${alert.message}`).join('\n')}
  `.trim();
}

// Lưu cảnh báo vào localStorage
export function saveAlerts(alerts: Alert[]): void {
  try {
    localStorage.setItem('dashboard-alerts', JSON.stringify(alerts));
  } catch (error) {
    console.error('Lỗi lưu cảnh báo:', error);
  }
}

// Đọc cảnh báo từ localStorage
export function loadAlerts(): Alert[] {
  try {
    const saved = localStorage.getItem('dashboard-alerts');
    if (saved) {
      const alerts = JSON.parse(saved);
      return alerts.map((alert: any) => ({
        ...alert,
        timestamp: new Date(alert.timestamp)
      }));
    }
  } catch (error) {
    console.error('Lỗi đọc cảnh báo:', error);
  }
  return [];
}

// Xóa cảnh báo đã xử lý
export function dismissAlert(alertId: string): void {
  const alerts = loadAlerts();
  const updatedAlerts = alerts.map(alert => 
    alert.id === alertId ? { ...alert, dismissed: true } : alert
  );
  saveAlerts(updatedAlerts);
}

// Đánh dấu cảnh báo đã xem
export function acknowledgeAlert(alertId: string): void {
  const alerts = loadAlerts();
  const updatedAlerts = alerts.map(alert => 
    alert.id === alertId ? { ...alert, acknowledged: true } : alert
  );
  saveAlerts(updatedAlerts);
}
