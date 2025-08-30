import html2canvas from 'html2canvas';
import { SettingsData } from '@/contexts/SettingsContext';

export interface ExportOptions {
  format: 'png' | 'pdf' | 'excel';
  quality: 'low' | 'medium' | 'high';
  includeCharts: boolean;
  includeInsights: boolean;
  watermark: boolean;
  fileNameTemplate: string;
  compressionLevel: number;
}

export const generateFileName = (template: string, type: string = 'dashboard'): string => {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  
  return template
    .replace('{date}', date)
    .replace('{time}', time)
    .replace('{type}', type);
};

export const exportToPNG = async (
  element: HTMLElement,
  settings: SettingsData['exportSettings'],
  type: string = 'dashboard'
): Promise<void> => {
  try {
    // Cải thiện options cho html2canvas
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    // Tạo tên file
    const fileName = generateFileName(settings.fileNameTemplate, type);
    
    // Tạo link download với compression
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL('image/png', settings.compressionLevel / 100);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    throw new Error('Không thể xuất ảnh PNG. Vui lòng thử lại!');
  }
};

export const exportToPDF = async (
  element: HTMLElement,
  settings: SettingsData['exportSettings'],
  type: string = 'dashboard'
): Promise<void> => {
  try {
    // Import jsPDF với fallback
    let jsPDF;
    try {
      jsPDF = (await import('jspdf')).default;
    } catch (importError) {
      console.error('Failed to import jsPDF:', importError);
      throw new Error('Không thể tải thư viện PDF. Vui lòng kiểm tra kết nối internet!');
    }
    
    // Tạo canvas từ element với quality settings
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png', settings.compressionLevel / 100);
    
    // Tạo PDF với orientation tự động
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width
    const pageHeight = 295; // A4 height
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Thêm trang đầu
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Thêm các trang tiếp theo nếu cần
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Thêm watermark nếu được bật
    if (settings.watermark) {
      pdf.setTextColor(200, 200, 200);
      pdf.setFontSize(10);
      pdf.text('Dashboard AI Analytics', 10, 10);
      pdf.text(new Date().toLocaleDateString('vi-VN'), 10, 15);
    }

    // Tạo tên file và tải xuống
    const fileName = generateFileName(settings.fileNameTemplate, type);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Không thể xuất PDF. Vui lòng thử lại!');
  }
};

export const exportToExcel = async (
  data: any,
  settings: SettingsData['exportSettings'],
  type: string = 'dashboard'
): Promise<void> => {
  try {
    // Import XLSX với fallback
    let XLSX;
    try {
      XLSX = await import('xlsx');
    } catch (importError) {
      console.error('Failed to import XLSX:', importError);
      throw new Error('Không thể tải thư viện Excel. Vui lòng kiểm tra kết nối internet!');
    }
    
    // Chuẩn bị dữ liệu cho Excel
    const workbook = XLSX.utils.book_new();
    
    // Chuẩn bị dữ liệu cho worksheet chính
    let mainData: any[] = [];
    
    if (type === 'dashboard') {
      // Dữ liệu dashboard
      mainData = [
        { 'Chỉ số': 'Tổng doanh thu', 'Giá trị': data.summary?.totalRevenueFormatted || 'N/A' },
        { 'Chỉ số': 'Tổng chi phí quảng cáo', 'Giá trị': data.summary?.totalAdCostFormatted || 'N/A' },
        { 'Chỉ số': 'ROI trung bình', 'Giá trị': data.summary?.avgROIFormatted || 'N/A' },
      ];
      
      // Thêm dữ liệu phân tích chi nhánh
      if (data.branchAnalysis) {
        Object.entries(data.branchAnalysis).forEach(([branch, branchData]: [string, any]) => {
          mainData.push({
            'Chi nhánh': branch,
            'Doanh thu': branchData.revenue,
            'ROI': branchData.roi,
            'Tỷ lệ': `${branchData.percentage}%`
          });
        });
      }
    } else if (type === 'detailed-report') {
      // Dữ liệu báo cáo chi tiết
      if (Array.isArray(data)) {
        mainData = data;
      } else if (data.reportData) {
        mainData = data.reportData;
      } else {
        mainData = [data];
      }
    } else {
      // Fallback
      mainData = Array.isArray(data) ? data : [data];
    }
    
    // Tạo worksheet từ dữ liệu
    const worksheet = XLSX.utils.json_to_sheet(mainData);
    
    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo');
    
    // Thêm metadata nếu có insights
    if (settings.includeInsights && data.insights) {
      const insightsData = [
        { 'Loại': 'Tổng quan', 'Nội dung': data.insights.overview || 'N/A' },
        { 'Loại': 'Top Performer', 'Nội dung': data.insights.topPerformer || 'N/A' },
        { 'Loại': 'Tóm tắt', 'Nội dung': data.insights.summary || 'N/A' },
        { 'Loại': 'Xu hướng', 'Nội dung': data.insights.trends || 'N/A' },
      ];
      
      // Thêm recommendations
      if (data.insights.recommendations && Array.isArray(data.insights.recommendations)) {
        data.insights.recommendations.forEach((rec: string, index: number) => {
          insightsData.push({
            'Loại': `Đề xuất ${index + 1}`,
            'Nội dung': rec
          });
        });
      }
      
      // Thêm risks
      if (data.insights.risks && Array.isArray(data.insights.risks)) {
        data.insights.risks.forEach((risk: string, index: number) => {
          insightsData.push({
            'Loại': `Rủi ro ${index + 1}`,
            'Nội dung': risk
          });
        });
      }
      
      const insightsWorksheet = XLSX.utils.json_to_sheet(insightsData);
      XLSX.utils.book_append_sheet(workbook, insightsWorksheet, 'AI Insights');
    }
    
    // Tạo tên file và tải xuống
    const fileName = generateFileName(settings.fileNameTemplate, type);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Không thể xuất Excel. Vui lòng thử lại!');
  }
};

export const exportReport = async (
  element: HTMLElement,
  data: any,
  settings: SettingsData['exportSettings'],
  type: string = 'dashboard'
): Promise<void> => {
  try {
    console.log('Exporting with settings:', settings);
    console.log('Export type:', type);
    
    switch (settings.defaultFormat) {
      case 'png':
        await exportToPNG(element, settings, type);
        break;
      case 'pdf':
        await exportToPDF(element, settings, type);
        break;
      case 'excel':
        await exportToExcel(data, settings, type);
        break;
      default:
        await exportToPNG(element, settings, type);
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    throw error;
  }
};
