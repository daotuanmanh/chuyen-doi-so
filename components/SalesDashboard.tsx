'use client';

import React, { useState, useEffect, useRef } from 'react'; // Import React và các hook cần thiết
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, ComposedChart } from 'recharts'; // Import các thành phần của Recharts
import { useSettings } from '@/contexts/SettingsContext'; // Import context cho cài đặt
import { exportReport } from '@/utils/exportUtils'; // Import hàm xuất báo cáo
import { checkAlerts, sendEmailAlert, sendPushNotification, showInAppAlert, loadAlerts, Alert } from '@/utils/alertSystem'; // Import hệ thống cảnh báo
import { getCurrentTime, formatDate } from '@/utils/dateTimeUtils'; // Import hàm lấy thời gian và format ngày theo múi giờ



// Định nghĩa interface cho dữ liệu dashboard
interface DashboardData {
  summary: {
    totalRevenue: number;
    totalAdCost: number;
    avgROI: number;
    totalRevenueFormatted: string;
    totalAdCostFormatted: string;
    avgROIFormatted: string;
  };
  branchAnalysis: { [key: string]: any };
  channelAnalysis: { [key: string]: any };
  weeklyAnalysis: { [key: string]: number };
  aiInsights: {
    overview: string;
    topPerformer: string;
    summary: string;
    recommendations: string[];
    trends: string;
    risks: string[];
    detailedAnalysis: string[];
    performanceMetrics: {
      revenueGrowth: string;
      efficiencyScore: string;
      marketShare: string;
      costEffectiveness: string;
    };
  };
  filters: {
    timeType: string;
    timeValue: string;
    branch: string;
    year: string;
  };
}

// Định nghĩa màu sắc cho biểu đồ
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

// Component Dashboard
export default function SalesDashboard() {
  const { settings } = useSettings(); // Lấy cài đặt từ context
  const [data, setData] = useState<DashboardData | null>(null); // Dữ liệu dashboard
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const [exporting, setExporting] = useState(false); // Trạng thái xuất báo cáo
  const dashboardRef = useRef<HTMLDivElement>(null); // Ref cho dashboard
  const [filters, setFilters] = useState({ // Cài đặt lọc
    timeType: settings.dashboardSettings.defaultTimeRange,
    timeValue: 'Q1',
    branch: settings.dashboardSettings.defaultBranch,
    year: '2025'
  });
  const [alerts, setAlerts] = useState<Alert[]>([]); // Danh sách cảnh báo
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>>([]); // Toast notifications

  // State để đảm bảo settings đã được load
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  
  // State để hiển thị thời gian real-time theo múi giờ
  const [currentTime, setCurrentTime] = useState<string>('');

  // Hàm helper để format tên múi giờ
  const formatTimezoneName = (timezone: string): string => {
    const timezoneMap: { [key: string]: string } = {
      'Asia/Ho_Chi_Minh': 'Việt Nam (GMT+7)',
      'Etc/GMT-7': 'Việt Nam (GMT+7)',
      'Etc/GMT+7': 'Việt Nam (GMT+7)',
      'Asia/Singapore': 'Singapore (GMT+8)',
      'Asia/Bangkok': 'Thái Lan (GMT+7)',
      'Asia/Manila': 'Philippines (GMT+8)',
      'Asia/Jakarta': 'Indonesia (GMT+7)',
      'Asia/Kuala_Lumpur': 'Malaysia (GMT+8)',
      'Asia/Tokyo': 'Nhật Bản (GMT+9)',
      'Asia/Seoul': 'Hàn Quốc (GMT+9)',
      'Asia/Shanghai': 'Trung Quốc (GMT+8)',
      'Asia/Hong_Kong': 'Hong Kong (GMT+8)',
      'America/New_York': 'New York (GMT-5)',
      'America/Los_Angeles': 'Los Angeles (GMT-8)',
      'Europe/London': 'London (GMT+0)',
      'Europe/Paris': 'Paris (GMT+1)',
      'Europe/Berlin': 'Berlin (GMT+1)',
      'Australia/Sydney': 'Sydney (GMT+10)',
      'Australia/Melbourne': 'Melbourne (GMT+10)',
      'Pacific/Auckland': 'Auckland (GMT+12)',
      'Asia/Dubai': 'Dubai (GMT+4)',
      'Asia/Kolkata': 'Mumbai (GMT+5:30)'
    };
    
    // Xử lý trường hợp Etc/GMT
    if (timezone.includes('Etc/GMT')) {
      const offset = timezone.replace('Etc/GMT', '');
      const sign = offset.startsWith('-') ? '+' : '-'; // Đảo ngược dấu vì Etc/GMT-7 = GMT+7
      const hours = offset.replace('-', '').replace('+', '');
      return `Việt Nam (GMT${sign}${hours})`;
    }
    
    return timezoneMap[timezone] || timezone.replace('Asia/', '').replace('_', ' ');
  };

  // Hàm helper để format tên định dạng ngày
  const formatDateFormatName = (dateFormat: string): string => {
    const formatMap: { [key: string]: string } = {
      'DD/MM/YYYY': 'Ngày/Tháng/Năm',
      'MM/DD/YYYY': 'Tháng/Ngày/Năm',
      'YYYY-MM-DD': 'Năm-Tháng-Ngày',
      'DD-MM-YYYY': 'Ngày-Tháng-Năm',
      'MM-DD-YYYY': 'Tháng-Ngày-Năm',
      'DD/MM/YYYY HH:mm': 'Ngày/Tháng/Năm Giờ:Phút',
      'MM/DD/YYYY HH:mm': 'Tháng/Ngày/Năm Giờ:Phút',
      'DD/MM/YYYY HH:mm:ss': 'Ngày/Tháng/Năm Giờ:Phút:Giây',
      'MM/DD/YYYY HH:mm:ss': 'Tháng/Ngày/Năm Giờ:Phút:Giây',
      'YYYY-MM-DD HH:mm:ss': 'Năm-Tháng-Ngày Giờ:Phút:Giây'
    };
    return formatMap[dateFormat] || dateFormat;
  };

  // Kiểm tra trạng thái cảnh báo khi component mount và khi settings thay đổi
  useEffect(() => {
    // Đảm bảo settings đã được load từ localStorage
    if (settings && typeof settings.alertSettings !== 'undefined') {
      setSettingsLoaded(true);
      
      if (!settings.alertSettings.alertsEnabled) {
        console.log('🔕 Component mount/settings change - Hệ thống cảnh báo đã tắt, xóa tất cả cảnh báo');
        setAlerts([]);
        setToasts(prev => {
          const filteredToasts = prev.filter(toast => 
            !toast.id.includes('alert-toast') && 
            !toast.id.includes('detail-toast') && 
            !toast.id.includes('check-result') &&
            !toast.id.includes('clear-all') &&
            !toast.id.includes('dismiss-alert') &&
            !toast.id.includes('summary-toast')
          );
          return filteredToasts;
        });
      }
    }
  }, [settings.alertSettings.alertsEnabled, settings]); // Chạy khi alertsEnabled thay đổi hoặc settings thay đổi

  // Thêm useEffect để đảm bảo settings đã được load hoàn toàn trước khi xử lý logic cảnh báo
  useEffect(() => {
    // Kiểm tra xem settings đã được load từ localStorage chưa
    const savedSettings = localStorage.getItem('dashboard-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.alertSettings && typeof parsedSettings.alertSettings.alertsEnabled !== 'undefined') {
          console.log('🔧 Settings đã được load từ localStorage:', parsedSettings.alertSettings.alertsEnabled);
          setSettingsLoaded(true);
          
          // Nếu cảnh báo đã tắt trong localStorage, xóa tất cả cảnh báo ngay lập tức
          if (!parsedSettings.alertSettings.alertsEnabled) {
            console.log('🔕 Phát hiện cảnh báo đã tắt trong localStorage, xóa tất cả cảnh báo');
            setAlerts([]);
            setToasts(prev => {
              const filteredToasts = prev.filter(toast => 
                !toast.id.includes('alert-toast') && 
                !toast.id.includes('detail-toast') && 
                !toast.id.includes('check-result') &&
                !toast.id.includes('clear-all') &&
                !toast.id.includes('dismiss-alert') &&
                !toast.id.includes('summary-toast')
              );
              return filteredToasts;
            });
          }
        }
      } catch (error) {
        console.error('🔧 Lỗi khi parse settings từ localStorage:', error);
      }
    } else {
      // Nếu không có settings trong localStorage, sử dụng default (bật cảnh báo)
      console.log('🔧 Không có settings trong localStorage, sử dụng default');
      setSettingsLoaded(true);
    }
  }, []); // Chỉ chạy một lần khi component mount

  // useEffect để cập nhật thời gian real-time theo múi giờ và định dạng ngày
  useEffect(() => {
    const updateTime = () => {
      const timezone = settings?.userPreferences?.timezone || 'Asia/Ho_Chi_Minh';
      const dateFormat = settings?.userPreferences?.dateFormat || 'DD/MM/YYYY HH:mm:ss';
      
      // Sử dụng formatDate để format theo định dạng ngày từ settings
      const now = new Date();
      const formattedTime = formatDate(now, dateFormat, timezone);
      setCurrentTime(formattedTime);
    };

    // Cập nhật ngay lập tức
    updateTime();

    // Cập nhật mỗi giây
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [settings?.userPreferences?.timezone, settings?.userPreferences?.dateFormat]);

  // Hàm lấy dữ liệu từ API
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/sales-dashboard?${params}`);
      const result = await response.json();
      setData(result);
      
             // Debug: Log dữ liệu để kiểm tra
       console.log('📊 Dữ liệu từ API:', result);
       console.log('🔧 Trạng thái cảnh báo:', settings.alertSettings.alertsEnabled);
       console.log('🔧 Toàn bộ settings:', settings);
       console.log('🔧 Alert settings:', settings.alertSettings);
      
                                         // Kiểm tra cảnh báo sau khi có dữ liệu (chỉ khi bật hệ thống và settings đã load)
         if (result && result.branchAnalysis && settingsLoaded && settings.alertSettings.alertsEnabled) {
          const salesData = Object.entries(result.branchAnalysis).map(([branch, data]: [string, any]) => ({
            branch,
            revenue: data.revenue || 0,
            profit: data.profit || 0,
            roi: data.roi || 0,
            growth: data.growth || 0,
            period: filters.timeValue
          }));
          
          // Debug: Log salesData để kiểm tra
          console.log('📈 SalesData cho cảnh báo:', salesData);
          console.log('⚙️ Cài đặt cảnh báo:', settings.alertSettings);
          
          const newAlerts = checkAlerts(salesData, settings);
          
          // Debug: Log cảnh báo được tạo
          console.log('🚨 Cảnh báo được tạo:', newAlerts);
          
          // Cập nhật cảnh báo và hiển thị toast
          setAlerts(newAlerts);
          
          // Hiển thị toast notification cho tất cả cảnh báo mới
          if (newAlerts.length > 0) {
           console.log('🔔 Tạo toast notification cho', newAlerts.length, 'cảnh báo');
           newAlerts.forEach(async (alert) => {
             // Toast notification cho cảnh báo mới
             const toastId = 'alert-toast-' + Date.now() + Math.random();
             const toastMessage = `🚨 ${alert.message}`;
             const toastType: 'success' | 'error' | 'warning' | 'info' = alert.severity === 'critical' ? 'error' : 
                   alert.severity === 'high' ? 'warning' : 'info';
             
             console.log('🔔 Tạo toast:', { id: toastId, message: toastMessage, type: toastType });
             
             setToasts(prev => {
               const newToasts = [...prev, { 
                 id: toastId, 
                 message: toastMessage, 
                 type: toastType
               }];
               console.log('🔔 Cập nhật toasts state:', newToasts);
               return newToasts;
             });
           
           // Tự động xóa toast sau 8 giây
           setTimeout(() => {
             setToasts(prev => prev.filter(t => t.id !== toastId));
           }, 8000);
           
           // Gửi email nếu bật
           if (settings.alertSettings.emailNotifications) {
             await sendEmailAlert(alert, settings);
           }
           
           // Gửi push notification nếu bật
           if (settings.alertSettings.pushNotifications) {
             await sendPushNotification(alert, settings);
           }
           
           // Phát âm thanh nếu bật
           if (settings.alertSettings.alertSound) {
             // Logic phát âm thanh
             console.log('Phát âm thanh cảnh báo:', alert.severity);
           }
           
           // Rung thiết bị nếu bật
           if (settings.alertSettings.alertVibration) {
             // Logic rung
             console.log('Rung thiết bị cho cảnh báo:', alert.severity);
           }
         });
       }
           } else if (result && result.branchAnalysis && settingsLoaded && !settings.alertSettings.alertsEnabled) {
       // Nếu tắt cảnh báo, xóa tất cả cảnh báo hiện tại và toast liên quan
       console.log('🔕 Hệ thống cảnh báo đã tắt, xóa tất cả cảnh báo');
       setAlerts([]);
               // Xóa tất cả toast notification liên quan đến cảnh báo
        setToasts(prev => {
          const filteredToasts = prev.filter(toast => 
            !toast.id.includes('alert-toast') && 
            !toast.id.includes('detail-toast') && 
            !toast.id.includes('check-result') &&
            !toast.id.includes('clear-all') &&
            !toast.id.includes('dismiss-alert') &&
            !toast.id.includes('summary-toast')
          );
          console.log('🔕 Xóa toast trong fetchData, còn lại:', filteredToasts.length);
          return filteredToasts;
        });
     }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý lọc
  useEffect(() => {
    // Chỉ fetch data khi settings đã được load
    if (settingsLoaded) {
      fetchData();
    }
  }, [filters, settingsLoaded]);



  // Debug toasts state
  useEffect(() => {
    console.log('🔔 Toasts state updated:', toasts);
  }, [toasts]);





  // Debug AI insights (chỉ dùng để debug)
  useEffect(() => {
    if (data?.aiInsights) {
      console.log('AI Insights received:', data.aiInsights);
    }
  }, [data?.aiInsights]);

  // Generate fallback insights if AI insights are empty (chỉ dùng để debug)
  const getFallbackInsights = () => {
    if (!data) return null;
    
    const topBranch = Object.entries(data.branchAnalysis || {})
      .sort(([,a]: [string, any], [,b]: [string, any]) => b.revenue - a.revenue)[0];
    
    if (topBranch) {
      const [branchName, branchData] = topBranch;
      return {
        overview: `Tổng doanh thu đạt ${data.summary.totalRevenueFormatted} VND với ROI trung bình ${data.summary.avgROIFormatted}.`,
        topPerformer: `Chi nhánh ${branchName} dẫn đầu với doanh thu ${branchData.revenue.toLocaleString('vi-VN')} VND (${branchData.percentage.toFixed(1)}% tổng doanh thu).`,
        summary: `Hiệu suất tổng thể: ROI ${data.summary.avgROIFormatted} với ${Object.keys(data.branchAnalysis || {}).length} chi nhánh.`
      };
    }
    
    return {
      overview: 'Đang phân tích dữ liệu...',
      topPerformer: 'Đang phân tích hiệu suất...',
      summary: 'Đang phân tích tổng quan...'
    };
  };

  // Hàm xử lý thay đổi cài đặt
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Hàm tạo nội dung nút xuất động theo cài đặt (chỉ dùng để debug)
  const getExportButtonContent = () => {
    const format = settings.exportSettings.defaultFormat;
    
    switch (format) {
      case 'png':
        return {
          icon: '🖼️',
          text: 'Xuất ảnh',
          loadingText: 'Đang xuất ảnh...'
        };
      case 'pdf':
        return {
          icon: '📄',
          text: 'Xuất PDF',
          loadingText: 'Đang xuất PDF...'
        };
      case 'excel':
        return {
          icon: '📊',
          text: 'Xuất Excel',
          loadingText: 'Đang xuất Excel...'
        };
      default:
        return {
          icon: '📸',
          text: 'Xuất báo cáo',
          loadingText: 'Đang xuất...'
        };
    }
  };

  const exportButtonContent = getExportButtonContent(); // Nội dung nút xuất động

  // Hàm xuất báo cáo
  const exportToImage = async () => {
    if (!dashboardRef.current || !data) return;
    
    setExporting(true);
    try {
      await exportReport(
        dashboardRef.current,
        data,
        settings.exportSettings,
        'dashboard'
      );
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Có lỗi khi xuất báo cáo. Vui lòng thử lại!');
    } finally {
      setExporting(false);
    }
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-700 dark:text-gray-200 font-medium">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl text-red-600 dark:text-red-400 font-medium">Lỗi tải dữ liệu</div>
        </div>
      </div>
    );
  }

  // Chuẩn bị dữ liệu cho biểu đồ
  const branchChartData = Object.entries(data.branchAnalysis).map(([name, data]: [string, any]) => ({
    name,
    revenue: data.revenue,
    roi: data.roi,
    percentage: data.percentage
  }));

  const channelChartData = Object.entries(data.channelAnalysis).map(([name, data]: [string, any]) => ({
    name,
    revenue: data.revenue,
    percentage: data.percentage
  }));

  const weeklyChartData = Object.entries(data.weeklyAnalysis).map(([week, revenue]) => ({
    week: `Tuần ${week}`,
    revenue
  }));

  // Dữ liệu cho biểu đồ radar - So sánh hiệu suất chi nhánh
  const radarChartData = Object.entries(data.branchAnalysis).map(([name, data]: [string, any]) => ({
    branch: name,
    doanhThu: Math.round(data.revenue / 1000000), // Chuyển về triệu VND
    roi: data.roi,
    hieuSuat: data.percentage,
    tangTruong: data.growth || 0,
    chiPhi: Math.round((data.revenue * (1 - data.roi/100)) / 1000000) // Chi phí ước tính
  }));

  // Dữ liệu cho biểu đồ area - Xu hướng doanh thu
  const areaChartData = Object.entries(data.weeklyAnalysis).map(([week, revenue]) => ({
    week: `Tuần ${week}`,
    doanhThu: revenue,
    duKien: revenue * 1.1, // Dự kiến tăng 10%
    mucTieu: revenue * 1.2 // Mục tiêu tăng 20%
  }));

  // Dữ liệu cho biểu đồ combo - Doanh thu + ROI
  const comboChartData = Object.entries(data.branchAnalysis).map(([name, data]: [string, any]) => ({
    branch: name,
    doanhThu: data.revenue,
    roi: data.roi,
    profit: data.revenue * (data.roi / 100)
  }));



           // Hiển thị dashboard
    return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`max-w-md p-4 rounded-xl shadow-lg border-l-4 transform transition-all duration-300 ${
                toast.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200' :
                toast.type === 'error' 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200' :
                toast.type === 'warning' 
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-800 dark:text-orange-200' :
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{toast.message}</p>
                </div>
                <button
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        
         <div ref={dashboardRef} className="max-w-7xl mx-auto p-6">
       {/* Header */}
       <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 dark:border-gray-700/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📊 Báo cáo Doanh thu {filters.year}
              </h1>
                             <p className="text-gray-600 dark:text-gray-300 mt-2">Dashboard phân tích hiệu quả kinh doanh với AI</p>
               
                               {/* Alert Status & Check Button */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {/* Alert Status */}
                  <div className={`px-4 py-2 rounded-lg border ${
                    alerts.length > 0 
                      ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200'
                      : 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <span className={alerts.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                        {alerts.length > 0 ? '🔔' : '✅'}
                      </span>
                      <span className="text-sm font-medium">
                        {alerts.length > 0 
                          ? `${alerts.length} cảnh báo cần chú ý`
                          : 'Không có cảnh báo nào'
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Check Alerts Button */}
                  {settings.alertSettings.alertsEnabled ? (
                    <>
                      {/* Hiển thị trạng thái cảnh báo */}
                      <div className="flex flex-wrap items-center gap-2">
                        {alerts.length > 0 ? (
                          <>
                            <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                              <span className="text-red-600 dark:text-red-400 text-lg">🚨</span>
                              <span className="text-red-700 dark:text-red-300 text-sm font-medium">
                                {alerts.length} cảnh báo
                              </span>
                            </div>
                            
                                                         {/* Nút xem chi tiết cảnh báo */}
                             <button
                               onClick={() => {
                                 // Chỉ hiển thị toast nếu hệ thống cảnh báo được bật
                                 if (settings.alertSettings.alertsEnabled) {
                                   // Hiển thị toast cho từng cảnh báo
                                   alerts.forEach((alert, index) => {
                                     const toastId = 'detail-toast-' + Date.now() + index;
                                     const toastType: 'success' | 'error' | 'warning' | 'info' = alert.severity === 'critical' ? 'error' : 
                                           alert.severity === 'high' ? 'warning' : 'info';
                                     
                                     setToasts(prev => [...prev, { 
                                       id: toastId, 
                                       message: `🚨 ${alert.message}`, 
                                       type: toastType
                                     }]);
                                     
                                     // Tự động xóa toast sau 6 giây
                                     setTimeout(() => {
                                       setToasts(prev => prev.filter(t => t.id !== toastId));
                                     }, 6000);
                                   });
                                   
                                   // Toast thông báo tổng quan
                                   const summaryToastId = 'summary-toast-' + Date.now();
                                   setToasts(prev => [...prev, { 
                                     id: summaryToastId, 
                                     message: `📋 Hiển thị chi tiết ${alerts.length} cảnh báo`, 
                                     type: 'info' 
                                   }]);
                                   
                                   setTimeout(() => {
                                     setToasts(prev => prev.filter(t => t.id !== summaryToastId));
                                   }, 3000);
                                 }
                               }}
                               className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
                             >
                               <span>👁️</span>
                               <span>Xem chi tiết</span>
                             </button>
                             
                                                           {/* Nút xóa tất cả cảnh báo */}
                              <button
                                onClick={() => {
                                  setAlerts([]);
                                  
                                  // Toast notification khi xóa tất cả (chỉ khi hệ thống cảnh báo được bật)
                                  if (settings.alertSettings.alertsEnabled) {
                                    const toastId = 'clear-all-' + Date.now();
                                    setToasts(prev => [...prev, { 
                                      id: toastId, 
                                      message: '🗑️ Đã xóa tất cả cảnh báo', 
                                      type: 'info' 
                                    }]);
                                    
                                    // Tự động xóa toast sau 3 giây
                                    setTimeout(() => {
                                      setToasts(prev => prev.filter(t => t.id !== toastId));
                                    }, 3000);
                                  }
                                }}
                                className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
                              >
                                <span>🗑️</span>
                                <span>Xóa tất cả</span>
                              </button>
                          </>
                        ) : (
                          <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                            <span className="text-green-600 dark:text-green-400 text-lg">✅</span>
                            <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                              Không có cảnh báo
                            </span>
                          </div>
                        )}
                        
                                                 {/* Nút kiểm tra lại cảnh báo */}
                         <button
                                                       onClick={() => {
                              if (data && data.branchAnalysis && settings.alertSettings.alertsEnabled) {
                                const salesData = Object.entries(data.branchAnalysis).map(([branch, data]: [string, any]) => ({
                                  branch,
                                  revenue: data.revenue || 0,
                                  profit: data.profit || 0,
                                  roi: data.roi || 0,
                                  growth: data.growth || 0,
                                  period: filters.timeValue
                                }));
                                
                                const newAlerts = checkAlerts(salesData, settings);
                                setAlerts(newAlerts);
                                
                                // Toast notification cho kết quả kiểm tra
                                if (newAlerts.length > 0) {
                                  const toastId = 'check-result-' + Date.now();
                                  setToasts(prev => [...prev, { 
                                    id: toastId, 
                                    message: `🔍 Phát hiện ${newAlerts.length} cảnh báo mới từ dữ liệu thực tế`, 
                                    type: 'warning' 
                                  }]);
                                  
                                  // Tự động xóa toast sau 5 giây
                                  setTimeout(() => {
                                    setToasts(prev => prev.filter(t => t.id !== toastId));
                                  }, 5000);
                                } else {
                                  const toastId = 'check-result-' + Date.now();
                                  setToasts(prev => [...prev, { 
                                    id: toastId, 
                                    message: '✅ Không phát hiện cảnh báo nào từ dữ liệu thực tế', 
                                    type: 'success' 
                                  }]);
                                  
                                  // Tự động xóa toast sau 3 giây
                                  setTimeout(() => {
                                    setToasts(prev => prev.filter(t => t.id !== toastId));
                                  }, 3000);
                                }
                                
                                                                // Gửi cảnh báo theo cài đặt
                                newAlerts.forEach(async (alert) => {
                                  if (settings.alertSettings.emailNotifications) {
                                    await sendEmailAlert(alert, settings);
                                  }
                                  if (settings.alertSettings.pushNotifications) {
                                    await sendPushNotification(alert, settings);
                                  }
                                  if (settings.alertSettings.alertSound) {
                                    console.log('Phát âm thanh cảnh báo');
                                  }
                                  if (settings.alertSettings.alertVibration) {
                                    console.log('Rung thiết bị');
                                  }
                                });
                              } else if (!settings.alertSettings.alertsEnabled) {
                                // Thông báo khi hệ thống cảnh báo đã tắt
                                const toastId = 'alert-disabled-' + Date.now();
                                setToasts(prev => [...prev, { 
                                  id: toastId, 
                                  message: '🔕 Hệ thống cảnh báo đã tắt. Vui lòng bật lại trong cài đặt.', 
                                  type: 'info' 
                                }]);
                                
                                setTimeout(() => {
                                  setToasts(prev => prev.filter(t => t.id !== toastId));
                                }, 4000);
                              }
                           }}
                           className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
                         >
                           <span>🔍</span>
                                                       <span>Kiểm tra lại</span>
                          </button>
                          
                          
                          
                       </div>
                    </>
                                     ) : (
                     <div className="flex items-center space-x-2">
                       <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">
                         <span className="text-lg">🔕</span>
                         <span className="text-sm font-medium">Hệ thống cảnh báo đã tắt</span>
                       </div>
                       
                       
                     </div>
                   )}
                </div>
            </div>
                         <div className="hidden md:block">
               <div className="text-right">
                 <div className="text-sm text-gray-500 dark:text-gray-400">Cập nhật lần cuối</div>
                 <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                   {currentTime || formatDate(new Date(), settings?.userPreferences?.dateFormat || 'DD/MM/YYYY HH:mm:ss', settings?.userPreferences?.timezone || 'Asia/Ho_Chi_Minh')}
                 </div>
                 <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                   Múi giờ: {formatTimezoneName(settings?.userPreferences?.timezone || 'Asia/Ho_Chi_Minh')}
                 </div>
                 <div className="text-xs text-gray-400 dark:text-gray-500">
                   Định dạng: {formatDateFormatName(settings?.userPreferences?.dateFormat || 'DD/MM/YYYY HH:mm:ss')}
                 </div>
                                   <button
                    onClick={exportToImage}
                    disabled={exporting}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {exporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {exportButtonContent.loadingText}
                      </>
                    ) : (
                      <>
                        {exportButtonContent.icon} {exportButtonContent.text}
                      </>
                    )}
                  </button>
               </div>
             </div>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                📅 Loại thời gian
              </label>
              <select
                value={filters.timeType}
                onChange={(e) => handleFilterChange('timeType', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 dark:text-gray-200"
              >
                <option value="week">Tuần</option>
                <option value="month">Tháng</option>
                <option value="quarter">Quý</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                {filters.timeType === 'week' ? '📆 Tuần' : 
                 filters.timeType === 'month' ? '📅 Tháng' : '📊 Quý'}
              </label>
              <select
                value={filters.timeValue}
                onChange={(e) => handleFilterChange('timeValue', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 dark:text-gray-200"
              >
                {filters.timeType === 'week' && Array.from({length: 52}, (_, i) => (
                  <option key={i+1} value={i+1}>Tuần {i+1}</option>
                ))}
                {filters.timeType === 'month' && Array.from({length: 12}, (_, i) => (
                  <option key={i+1} value={i+1}>Tháng {i+1}</option>
                ))}
                {filters.timeType === 'quarter' && ['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                🏢 Chi nhánh
              </label>
              <select
                value={filters.branch}
                onChange={(e) => handleFilterChange('branch', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 dark:text-gray-200"
              >
                <option value="all">Tất cả</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                📅 Năm
              </label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 dark:text-gray-200"
              >
                <option value="2025">2025</option>
              </select>
            </div>
          </div>
        </div>

                 {/* Mobile Export Button */}
         <div className="md:hidden mb-6">
           <button
             onClick={exportToImage}
             disabled={exporting}
             className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
           >
             {exporting ? (
               <>
                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                 Đang xuất ảnh...
               </>
             ) : (
               <>
                 📸 Xuất ảnh
               </>
             )}
           </button>
         </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">💰 Tổng Doanh thu</h3>
                <p className="text-3xl font-bold text-white">{data.summary.totalRevenueFormatted} VND</p>
              </div>
              <div className="text-4xl text-white">💰</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">📈 ROI Trung bình</h3>
                <p className="text-3xl font-bold text-white">{data.summary.avgROIFormatted}</p>
              </div>
              <div className="text-4xl text-white">📈</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">💸 Chi phí Quảng cáo</h3>
                <p className="text-3xl font-bold text-white">{data.summary.totalAdCostFormatted} VND</p>
              </div>
              <div className="text-4xl text-white">💸</div>
            </div>
          </div>
        </div>

                 {/* AI Summary */}
         <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20 dark:border-gray-700/20">
           <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
             <span className="mr-3">🤖</span>
             AI Phân tích Tổng quan
           </h3>
           
           {/* Overview */}
           <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 mb-6">
             <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
               <span className="mr-2">📋</span>
               Tổng quan:
             </h4>
             <p className="text-purple-700 text-lg leading-relaxed">
               {data.aiInsights?.overview || getFallbackInsights()?.overview || 'Đang phân tích dữ liệu...'}
             </p>
           </div>

           {/* Performance Metrics */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
             <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
               <div className="text-blue-800 font-semibold text-sm mb-1">📈 Hiệu suất</div>
               <div className="text-blue-900 font-bold">{data.summary.avgROIFormatted}</div>
             </div>
             <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
               <div className="text-green-800 font-semibold text-sm mb-1">💰 Doanh thu/ngày</div>
               <div className="text-green-900 font-bold">
                 {(() => {
                   const daysInQuarter = filters.timeType === 'quarter' ? 90 : filters.timeType === 'month' ? 30 : 7;
                   const dailyRevenue = data.summary.totalRevenue / daysInQuarter;
                   return dailyRevenue.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' VND';
                 })()}
               </div>
             </div>
             <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
               <div className="text-orange-800 font-semibold text-sm mb-1">🎯 Chi nhánh tốt nhất</div>
               <div className="text-orange-900 font-bold">
                 {(() => {
                   const topBranch = Object.entries(data.branchAnalysis)
                     .sort(([,a]: [string, any], [,b]: [string, any]) => b.revenue - a.revenue)[0];
                   return topBranch ? topBranch[0] : 'N/A';
                 })()}
               </div>
             </div>
             <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
               <div className="text-red-800 font-semibold text-sm mb-1">💸 Chi phí/Doanh thu</div>
               <div className="text-red-900 font-bold">
                 {(() => {
                   const costRatio = (data.summary.totalAdCost / data.summary.totalRevenue * 100).toFixed(1);
                   return costRatio + '%';
                 })()}
               </div>
             </div>
           </div>

           {/* Detailed Analysis */}
           {Array.isArray(data.aiInsights.detailedAnalysis) && data.aiInsights.detailedAnalysis.length > 0 && (
             <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 mb-6">
               <h4 className="font-semibold text-indigo-800 mb-3 flex items-center">
                 <span className="mr-2">📊</span>
                 Phân tích chi tiết:
               </h4>
               <div className="space-y-2">
                 {data.aiInsights.detailedAnalysis.map((analysis, index) => (
                   <div key={index} className="text-indigo-700 text-sm flex items-start">
                     <span className="mr-2 mt-1">•</span>
                     <span>{typeof analysis === 'string' ? analysis : 'Đang phân tích...'}</span>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Top Performer */}
           <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
             <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
               <span className="mr-2">🏆</span>
               Hiệu suất hàng đầu:
             </h4>
             <p className="text-orange-700 text-lg leading-relaxed">
               {typeof data.aiInsights?.topPerformer === 'string' ? data.aiInsights.topPerformer : 
                typeof getFallbackInsights()?.topPerformer === 'string' ? getFallbackInsights()?.topPerformer : 
                'Đang phân tích hiệu suất...'}
             </p>
           </div>
         </div>

                          {/* Charts */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
           {/* Doanh thu theo chi nhánh */}
           <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
             <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
               <span className="mr-3">📊</span>
               Doanh thu theo Chi nhánh
             </h3>
             <ResponsiveContainer width="100%" height={350}>
               <BarChart data={branchChartData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                 <XAxis dataKey="name" stroke="#6b7280" />
                 <YAxis stroke="#6b7280" />
                                   <Tooltip 
                    formatter={(value) => `${Number(value).toLocaleString('vi-VN')} VND`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      color: '#1f2937'
                    }}
                  />
                  <Bar dataKey="revenue" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                 <defs>
                   <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#3B82F6" />
                     <stop offset="100%" stopColor="#1D4ED8" />
                   </linearGradient>
                 </defs>
               </BarChart>
             </ResponsiveContainer>
             
             {/* AI Insights */}
             <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
               <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                 <span className="mr-2">🤖</span>
                 AI Phân tích:
               </h4>
               <p className="text-blue-700 text-sm mb-2">
                 {typeof data.aiInsights?.summary === 'string' ? data.aiInsights.summary : 
                  typeof getFallbackInsights()?.summary === 'string' ? getFallbackInsights()?.summary : 
                  'Đang phân tích tổng quan...'}
               </p>
               <p className="text-blue-700 text-sm">
                 {typeof data.aiInsights?.topPerformer === 'string' ? data.aiInsights.topPerformer : 
                  typeof getFallbackInsights()?.topPerformer === 'string' ? getFallbackInsights()?.topPerformer : 
                  'Đang phân tích hiệu suất...'}
               </p>
             </div>
           </div>

           {/* Phân bổ kênh */}
           <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
             <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
               <span className="mr-3">🎯</span>
               Phân bổ theo Kênh
             </h3>
             <ResponsiveContainer width="100%" height={350}>
               <PieChart>
                 <Pie
                   data={channelChartData}
                   cx="50%"
                   cy="50%"
                   labelLine={false}
                   label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                   outerRadius={120}
                   fill="#8884d8"
                   dataKey="revenue"
                 >
                   {channelChartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                                   <Tooltip 
                    formatter={(value) => `${Number(value).toLocaleString('vi-VN')} VND`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      color: '#1f2937'
                    }}
                  />
                </PieChart>
             </ResponsiveContainer>
           </div>
                   </div>

          {/* New Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Radar Chart - So sánh hiệu suất chi nhánh */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">🎯</span>
                So sánh Hiệu suất Chi nhánh
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarChartData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="branch" stroke="#6b7280" />
                  <PolarRadiusAxis stroke="#6b7280" />
                  <Radar
                    name="Doanh thu (triệu VND)"
                    dataKey="doanhThu"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="ROI (%)"
                    dataKey="roi"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Hiệu suất (%)"
                    dataKey="hieuSuat"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.3}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      color: '#1f2937'
                    }}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Area Chart - Xu hướng doanh thu */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">📈</span>
                Xu hướng Doanh thu & Dự báo
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={areaChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    formatter={(value) => `${Number(value).toLocaleString('vi-VN')} VND`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      color: '#1f2937'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="doanhThu"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.8}
                    name="Doanh thu thực tế"
                  />
                  <Area
                    type="monotone"
                    dataKey="duKien"
                    stackId="2"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="Dự kiến"
                  />
                  <Area
                    type="monotone"
                    dataKey="mucTieu"
                    stackId="3"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.4}
                    name="Mục tiêu"
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

                     {/* Combo Chart */}
           <div className="grid grid-cols-1 gap-8 mb-8">
             {/* Combo Chart - Doanh thu + ROI */}
             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
               <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                 <span className="mr-3">📊</span>
                 Doanh thu & ROI theo Chi nhánh
               </h3>
               <ResponsiveContainer width="100%" height={350}>
                 <ComposedChart data={comboChartData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                   <XAxis dataKey="branch" stroke="#6b7280" />
                   <YAxis yAxisId="left" stroke="#3B82F6" />
                   <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                   <Tooltip
                     formatter={(value, name) => [
                       name === 'doanhThu' || name === 'profit' 
                         ? `${Number(value).toLocaleString('vi-VN')} VND`
                         : `${Number(value).toFixed(2)}%`,
                       name === 'doanhThu' ? 'Doanh thu' : 
                       name === 'roi' ? 'ROI' : 'Lợi nhuận'
                     ]}
                     contentStyle={{
                       backgroundColor: 'rgba(255, 255, 255, 0.95)',
                       border: '1px solid #e5e7eb',
                       borderRadius: '12px',
                       boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                       color: '#1f2937'
                     }}
                   />
                   <Bar yAxisId="left" dataKey="doanhThu" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Doanh thu" />
                   <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#10B981" strokeWidth={3} name="ROI" />
                   <Bar yAxisId="left" dataKey="profit" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Lợi nhuận" />
                   <Legend />
                 </ComposedChart>
               </ResponsiveContainer>
             </div>
           </div>

                           {/* Weekly Trend */}
         {Object.keys(data.weeklyAnalysis).length > 1 && (
           <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20 dark:border-gray-700/20">
             <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
               <span className="mr-3">📈</span>
               Xu hướng theo Tuần
             </h3>
             <ResponsiveContainer width="100%" height={400}>
               <LineChart data={weeklyChartData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                 <XAxis dataKey="week" stroke="#6b7280" />
                 <YAxis stroke="#6b7280" />
                                   <Tooltip 
                    formatter={(value) => `${Number(value).toLocaleString('vi-VN')} VND`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      color: '#1f2937'
                    }}
                  />
                  <Line  
                   type="monotone" 
                   dataKey="revenue" 
                   stroke="url(#lineGradient)" 
                   strokeWidth={3}
                   dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                   activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                 />
                 <defs>
                   <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                     <stop offset="0%" stopColor="#3B82F6" />
                     <stop offset="100%" stopColor="#8B5CF6" />
                   </linearGradient>
                 </defs>
               </LineChart>
             </ResponsiveContainer>
             
             {/* AI Insights */}
             <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
               <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                 <span className="mr-2">🤖</span>
                 AI Phân tích:
               </h4>
               <p className="text-green-700 text-sm">{typeof data.aiInsights.trends === 'string' ? data.aiInsights.trends : 'Đang phân tích xu hướng...'}</p>
             </div>
           </div>
         )}

                 {/* Active Alerts Display */}
                 {alerts.length > 0 && (
                   <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-red-200 dark:border-red-700 mb-8">
                     <h3 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-6 flex items-center">
                       <span className="mr-3">🚨</span>
                       Cảnh báo Đang Hoạt động ({alerts.length})
                     </h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {alerts.slice(0, 6).map((alert, index) => (
                         <div 
                           key={alert.id} 
                           className={`p-4 rounded-xl border-l-4 backdrop-blur-sm ${
                             alert.severity === 'critical' ? 'bg-red-50/80 dark:bg-red-900/30 border-red-500 dark:border-red-400' :
                             alert.severity === 'high' ? 'bg-orange-50/80 dark:bg-orange-900/30 border-orange-500 dark:border-orange-400' :
                             alert.severity === 'medium' ? 'bg-yellow-50/80 dark:bg-yellow-900/30 border-yellow-500 dark:border-yellow-400' :
                             'bg-blue-50/80 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400'
                           }`}
                         >
                           <div className="flex items-start justify-between">
                             <div className="flex-1">
                               <div className="flex items-center space-x-2 mb-2">
                                 <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                                   alert.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-800/80 dark:text-red-200' :
                                   alert.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-800/80 dark:text-orange-200' :
                                   alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/80 dark:text-yellow-200' :
                                   'bg-blue-100 text-blue-800 dark:bg-blue-800/80 dark:text-blue-200'
                                 }`}>
                                   {alert.severity.toUpperCase()}
                                 </span>
                                 <span className="text-xs text-gray-500 dark:text-gray-400">
                                   {formatDate(new Date(alert.timestamp), settings?.userPreferences?.dateFormat || 'DD/MM/YYYY HH:mm', settings?.userPreferences?.timezone || 'Asia/Ho_Chi_Minh')}
                                 </span>
                               </div>
                               <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                                 {alert.message}
                               </p>
                             </div>
                                                           <button
                                onClick={() => {
                                  setAlerts(prev => prev.filter(a => a.id !== alert.id));
                                  
                                  // Toast notification khi xóa cảnh báo (chỉ khi hệ thống cảnh báo được bật)
                                  if (settings.alertSettings.alertsEnabled) {
                                    const toastId = 'dismiss-alert-' + Date.now();
                                    setToasts(prev => [...prev, { 
                                      id: toastId, 
                                      message: '✅ Đã xóa cảnh báo', 
                                      type: 'success' 
                                    }]);
                                    
                                    // Tự động xóa toast sau 2 giây
                                    setTimeout(() => {
                                      setToasts(prev => prev.filter(t => t.id !== toastId));
                                    }, 2000);
                                  }
                                }}
                                className="ml-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              >
                                ✕
                              </button>
                           </div>
                         </div>
                       ))}
                     </div>
                     
                     {alerts.length > 6 && (
                       <div className="mt-4 text-center">
                         <p className="text-sm text-gray-600 dark:text-gray-400">
                           Và {alerts.length - 6} cảnh báo khác...
                         </p>
                       </div>
                     )}
                   </div>
                 )}

                 {/* AI Recommendations & Risks */}
         <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
           <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
             <span className="mr-3">🤖</span>
             AI Đề xuất Chiến lược & Cảnh báo Rủi ro
           </h3>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Recommendations */}
             <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
               <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                 <span className="mr-2">💡</span>
                 Đề xuất Chiến lược:
               </h4>
               {Array.isArray(data.aiInsights.recommendations) && data.aiInsights.recommendations.length > 0 ? (
                 <ul className="text-blue-700 space-y-3">
                   {data.aiInsights.recommendations.map((rec, index) => (
                     <li key={index} className="flex items-start p-3 bg-white/50 rounded-lg border border-blue-100">
                       <span className="mr-3 mt-1 text-blue-500">•</span>
                       <span className="leading-relaxed text-sm">{typeof rec === 'string' ? rec : 'Đang phân tích...'}</span>
                     </li>
                   ))}
                 </ul>
               ) : (
                 <p className="text-blue-600 italic">Không có đề xuất chiến lược nào vào lúc này.</p>
               )}
             </div>

             {/* Risks */}
             <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
               <h4 className="font-semibold text-red-800 mb-4 flex items-center">
                 <span className="mr-2">⚠️</span>
                 Cảnh báo Rủi ro:
               </h4>
               {Array.isArray(data.aiInsights.risks) && data.aiInsights.risks.length > 0 ? (
                 <ul className="text-red-700 space-y-3">
                   {data.aiInsights.risks.map((risk, index) => (
                     <li key={index} className="flex items-start p-3 bg-white/50 rounded-lg border border-red-100">
                       <span className="mr-3 mt-1 text-red-500">•</span>
                       <span className="leading-relaxed text-sm">{typeof risk === 'string' ? risk : 'Đang phân tích...'}</span>
                     </li>
                   ))}
                 </ul>
               ) : (
                 <p className="text-red-600 italic">Không có rủi ro đáng kể nào được phát hiện.</p>
               )}
             </div>
           </div>

           {/* Trends Analysis */}
           {data.aiInsights.trends && typeof data.aiInsights.trends === 'string' && (
             <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
               <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                 <span className="mr-2">📈</span>
                 Phân tích Xu hướng:
               </h4>
               <p className="text-green-700 leading-relaxed">{data.aiInsights.trends}</p>
             </div>
           )}
         </div>
      </div>
      
      
    </div>
  );
}
