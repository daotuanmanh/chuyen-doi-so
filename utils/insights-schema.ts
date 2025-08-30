import { z } from "zod";

export const InsightsSchema = z.object({
  overview: z.string(),
  topPerformer: z.string(),
  recommendations: z.array(z.string()),
  risks: z.array(z.string()),
  detailedAnalysis: z.array(z.string()),
  trends: z.string(),
});

export type Insights = z.infer<typeof InsightsSchema>;

export function createFallbackInsights(data: any): Insights {
  const { totalRevenue, avgROI, branch, timeDescription, year } = data;
  
  return {
    overview: `Phân tích tổng quan hệ thống với doanh thu ${totalRevenue?.toLocaleString('vi-VN') || 'N/A'} VND và ROI ${avgROI?.toFixed(2) || 'N/A'}.`,
    topPerformer: "Chi nhánh có hiệu suất tốt nhất đang dẫn đầu về doanh thu và ROI",
    recommendations: [
      "Tối ưu hóa chi phí quảng cáo",
      "Phát triển chiến lược kênh bán hàng", 
      "Cải thiện hiệu quả vận hành"
    ],
    risks: [
      "Theo dõi xu hướng thị trường",
      "Kiểm soát rủi ro tài chính",
      "Quản lý hiệu suất chi nhánh"
    ],
    detailedAnalysis: [
      "Phân tích hiệu quả chi nhánh",
      "Đánh giá ROI và chi phí",
      "Xem xét xu hướng tuần",
      "Tối ưu hóa phân bổ nguồn lực"
    ],
    trends: "Xu hướng tăng trưởng ổn định với tiềm năng cải thiện"
  };
}
