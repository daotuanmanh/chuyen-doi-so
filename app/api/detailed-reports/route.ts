import { NextRequest, NextResponse } from 'next/server';
import { ExcelAnalyzer } from '@/utils/excel-analyzer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeType = searchParams.get('timeType');
    const timeValue = searchParams.get('timeValue');
    const branch = searchParams.get('branch');
    const year = searchParams.get('year') || '2025';
    const reportType = searchParams.get('reportType') || 'comprehensive';

    const analyzer = new ExcelAnalyzer();
    await analyzer.loadSalesData();

    let filteredData = analyzer.getAllData();

    // Lọc theo thời gian
    if (timeType && timeValue) {
      switch (timeType) {
        case 'week':
          filteredData = filteredData.filter((item: any) => 
            item.week === parseInt(timeValue) && item.year === parseInt(year)
          );
          break;
        case 'quarter':
          filteredData = filteredData.filter((item: any) => 
            item.quarter === timeValue && item.year === parseInt(year)
          );
          break;
        case 'month':
          const month = parseInt(timeValue);
          const startWeek = (month - 1) * 4 + 1;
          const endWeek = month * 4;
          filteredData = filteredData.filter((item: any) => 
            item.week >= startWeek && item.week <= endWeek && item.year === parseInt(year)
          );
          break;
      }
    }

    // Lọc theo chi nhánh
    if (branch && branch !== 'all') {
      filteredData = filteredData.filter((item: any) => item.branch === branch);
    }

    // Tính toán thống kê
    const totalRevenue = filteredData.reduce((sum: number, item: any) => sum + item.total_revenue, 0);
    const totalAdCost = filteredData.reduce((sum: number, item: any) => sum + item.ad_cost, 0);
    const avgROI = totalAdCost > 0 ? totalRevenue / totalAdCost : 0;

    // Phân tích theo chi nhánh
    const branchAnalysis: { [key: string]: any } = {};
    const branches = Array.from(new Set(filteredData.map((item: any) => item.branch)));
    
    branches.forEach(branchName => {
      const branchData = filteredData.filter((item: any) => item.branch === branchName);
      const branchRevenue = branchData.reduce((sum: number, item: any) => sum + item.total_revenue, 0);
      const branchAdCost = branchData.reduce((sum: number, item: any) => sum + item.ad_cost, 0);
      const branchROI = branchAdCost > 0 ? branchRevenue / branchAdCost : 0;
      
      // Nếu chỉ chọn 1 chi nhánh, percentage sẽ là 100%
      // Nếu chọn nhiều chi nhánh, tính percentage bình thường
      const percentage = branches.length === 1 ? 100 : (branchRevenue / totalRevenue) * 100;
      
      branchAnalysis[branchName] = {
        revenue: branchRevenue,
        adCost: branchAdCost,
        roi: branchROI,
        percentage: percentage
      };
    });

    // Phân tích theo kênh
    const channelAnalysis: { [key: string]: any } = {};
    const channels = Array.from(new Set(filteredData.map((item: any) => item.channel)));
    
    channels.forEach(channelName => {
      const channelData = filteredData.filter((item: any) => item.channel === channelName);
      const channelRevenue = channelData.reduce((sum: number, item: any) => sum + item.total_revenue, 0);
      const channelAdCost = channelData.reduce((sum: number, item: any) => sum + item.ad_cost, 0);
      const channelROI = channelAdCost > 0 ? channelRevenue / channelAdCost : 0;
      
      // Nếu chỉ chọn 1 kênh, percentage sẽ là 100%
      // Nếu chọn nhiều kênh, tính percentage bình thường
      const percentage = channels.length === 1 ? 100 : (channelRevenue / totalRevenue) * 100;
      
      channelAnalysis[channelName] = {
        revenue: channelRevenue,
        adCost: channelAdCost,
        roi: channelROI,
        percentage: percentage
      };
    });

    // Phân tích theo tuần
    const weeklyAnalysis: { [key: number]: number } = {};
    const weeks = Array.from(new Set(filteredData.map((item: any) => item.week))).sort((a, b) => a - b);
    
    weeks.forEach(week => {
      const weekData = filteredData.filter((item: any) => item.week === week);
      const weekRevenue = weekData.reduce((sum: number, item: any) => sum + item.total_revenue, 0);
      weeklyAnalysis[week] = weekRevenue;
    });

    // Tính toán metrics chi tiết
    const daysInPeriod = timeType === 'week' ? 7 : timeType === 'month' ? 30 : 90;
    const revenuePerDay = totalRevenue / daysInPeriod;
    const adCostPerDay = totalAdCost / daysInPeriod;
    
    // Tính ROI trend
    const weeklyROIs = weeks.map(week => {
      const weekData = filteredData.filter((item: any) => item.week === week);
      const weekRevenue = weekData.reduce((sum: number, item: any) => sum + item.total_revenue, 0);
      const weekAdCost = weekData.reduce((sum: number, item: any) => sum + item.ad_cost, 0);
      return weekAdCost > 0 ? weekRevenue / weekAdCost : 0;
    });
    
    const roiTrend = weeklyROIs.length > 1 ? weeklyROIs[weeklyROIs.length - 1] - weeklyROIs[0] : 0;
    
    // Tính growth rate
    const weeklyRevenues = Object.values(weeklyAnalysis);
    const growthRate = weeklyRevenues.length > 1 
      ? ((weeklyRevenues[weeklyRevenues.length - 1] - weeklyRevenues[0]) / weeklyRevenues[0]) * 100 
      : 0;
    
    // Tính efficiency score
    const efficiencyScore = Math.min(100, (avgROI / 10) * 100); // Normalize to 100

    // Tạo AI insights dựa trên loại báo cáo
    const insights = generateDetailedInsights({
      totalRevenue,
      totalAdCost,
      avgROI,
      branchAnalysis,
      channelAnalysis,
      weeklyAnalysis,
      timeType,
      timeValue,
      branch,
      year,
      reportType
    });

    // Điều chỉnh dữ liệu trả về dựa trên loại báo cáo
    let responseData: any = {
      summary: {
        totalRevenue,
        totalAdCost,
        avgROI,
        totalRevenueFormatted: totalRevenue.toLocaleString('vi-VN'),
        totalAdCostFormatted: totalAdCost.toLocaleString('vi-VN'),
        avgROIFormatted: avgROI.toFixed(2)
      },
      detailedMetrics: {
        revenuePerDay,
        adCostPerDay,
        roiTrend,
        growthRate,
        efficiencyScore
      },
      insights
    };

    // Thêm dữ liệu dựa trên loại báo cáo
    if (reportType === 'comprehensive' || reportType === 'operational') {
      responseData.branchAnalysis = branchAnalysis;
      responseData.channelAnalysis = channelAnalysis;
      responseData.weeklyAnalysis = weeklyAnalysis;
    }

    // Luôn tạo financialMetrics cho tất cả các loại báo cáo
    responseData.financialMetrics = {
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalAdCost) / totalRevenue) * 100 : 0,
      costPerAcquisition: totalAdCost / (filteredData.length || 1),
      revenueGrowth: growthRate,
      roiTrend,
      efficiencyScore
    };

    // Luôn tạo operationalMetrics cho tất cả các loại báo cáo
    responseData.operationalMetrics = {
      averageOrderValue: totalRevenue / (filteredData.length || 1),
      conversionRate: 85.5, // Giả định
      customerRetentionRate: 78.2, // Giả định
      operationalEfficiency: efficiencyScore,
      branchPerformance: branchAnalysis,
      channelPerformance: channelAnalysis
    };

    const response = responseData;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating detailed report:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo báo cáo chi tiết' },
      { status: 500 }
    );
  }
}

function generateDetailedInsights(data: any) {
  const {
    totalRevenue,
    totalAdCost,
    avgROI,
    branchAnalysis,
    channelAnalysis,
    weeklyAnalysis,
    timeType,
    timeValue,
    branch,
    year,
    reportType
  } = data;

  const insights: {
    overview: string;
    topPerformer: string;
    recommendations: string[];
    risks: string[];
    trends: string;
  } = {
    overview: '',
    topPerformer: '',
    recommendations: [],
    risks: [],
    trends: ''
  };

  // Tạo overview dựa trên report type
  const timeDescription = timeType === 'week' ? `tuần ${timeValue}` : 
                         timeType === 'month' ? `tháng ${timeValue}` : 
                         `quý ${timeValue}`;

  if (reportType === 'financial') {
    insights.overview = `Báo cáo tài chính cho ${timeDescription} năm ${year}: Tổng doanh thu ${totalRevenue.toLocaleString('vi-VN')} VND, chi phí quảng cáo ${totalAdCost.toLocaleString('vi-VN')} VND, ROI trung bình ${avgROI.toFixed(2)}. Hiệu quả tài chính ${avgROI > 8 ? 'tốt' : avgROI > 5 ? 'khá' : 'cần cải thiện'}.`;
  } else if (reportType === 'operational') {
    insights.overview = `Báo cáo vận hành cho ${timeDescription} năm ${year}: Hoạt động tại ${Object.keys(branchAnalysis).length} chi nhánh qua ${Object.keys(channelAnalysis).length} kênh. Doanh thu trung bình ${(totalRevenue / (timeType === 'week' ? 7 : timeType === 'month' ? 30 : 90)).toLocaleString('vi-VN')} VND/ngày.`;
  } else {
    insights.overview = `Báo cáo toàn diện cho ${timeDescription} năm ${year}: Tổng doanh thu ${totalRevenue.toLocaleString('vi-VN')} VND với ROI ${avgROI.toFixed(2)}. Hoạt động tại ${Object.keys(branchAnalysis).length} chi nhánh qua ${Object.keys(channelAnalysis).length} kênh bán hàng.`;
  }

  // Xác định top performer
  const topBranch = Object.entries(branchAnalysis)
    .sort(([,a]: [string, any], [,b]: [string, any]) => b.revenue - a.revenue)[0];
  
  if (topBranch) {
    const topBranchData = topBranch[1] as any;
    insights.topPerformer = `${topBranch[0]} là chi nhánh dẫn đầu với doanh thu ${topBranchData.revenue.toLocaleString('vi-VN')} VND (${topBranchData.percentage.toFixed(1)}% tổng doanh thu) và ROI ${topBranchData.roi.toFixed(2)}.`;
  }

  // Tạo recommendations dựa trên report type
  if (reportType === 'financial') {
    // Recommendations cho báo cáo tài chính
    if (avgROI < 5) {
      insights.recommendations.push('Cần cải thiện hiệu quả quảng cáo - ROI hiện tại thấp hơn mục tiêu.');
    }
    if (totalAdCost > totalRevenue * 0.2) {
      insights.recommendations.push('Chi phí quảng cáo chiếm tỷ lệ cao - cần tối ưu ngân sách marketing.');
    }
    if (totalRevenue < 1000000000) { // 1 tỷ VND
      insights.recommendations.push('Doanh thu thấp - cần đẩy mạnh chiến lược tăng trưởng.');
    }
  } else if (reportType === 'operational') {
    // Recommendations cho báo cáo vận hành
    const lowROIBranches = Object.entries(branchAnalysis)
      .filter(([,data]: [string, any]) => data.roi < avgROI * 0.8);
    
    if (lowROIBranches.length > 0) {
      insights.recommendations.push(`Cần tối ưu chiến lược tại ${lowROIBranches.map(([name]) => name).join(', ')} - ROI thấp hơn trung bình.`);
    }
    
    const lowRevenueChannels = Object.entries(channelAnalysis)
      .filter(([,data]: [string, any]) => data.percentage < 15);
    
    if (lowRevenueChannels.length > 0) {
      insights.recommendations.push(`Cần cải thiện hiệu suất tại kênh ${lowRevenueChannels.map(([name]) => name).join(', ')}.`);
    }
    
    insights.recommendations.push('Tăng cường đào tạo nhân viên để cải thiện tỷ lệ chuyển đổi.');
  } else {
    // Recommendations cho báo cáo toàn diện
    if (avgROI < 5) {
      insights.recommendations.push('Cần cải thiện hiệu quả quảng cáo - ROI hiện tại thấp hơn mục tiêu.');
    }
    
    const lowROIBranches = Object.entries(branchAnalysis)
      .filter(([,data]: [string, any]) => data.roi < avgROI * 0.8);
    
    if (lowROIBranches.length > 0) {
      insights.recommendations.push(`Cần tối ưu chiến lược tại ${lowROIBranches.map(([name]) => name).join(', ')} - ROI thấp hơn trung bình.`);
    }
    
    insights.recommendations.push('Đa dạng hóa kênh marketing để giảm rủi ro phụ thuộc.');
    insights.recommendations.push('Tăng cường phân tích dữ liệu để ra quyết định chính xác hơn.');
  }

  // Tạo risks dựa trên report type
  if (reportType === 'financial') {
    // Risks cho báo cáo tài chính
    if (avgROI < 3) {
      insights.risks.push('ROI quá thấp - có thể ảnh hưởng đến lợi nhuận.');
    }
    if (totalAdCost > totalRevenue * 0.3) {
      insights.risks.push('Chi phí quảng cáo quá cao - rủi ro lỗ vốn.');
    }
    if (totalRevenue < 500000000) { // 500 triệu VND
      insights.risks.push('Doanh thu thấp - rủi ro không đủ vốn hoạt động.');
    }
  } else if (reportType === 'operational') {
    // Risks cho báo cáo vận hành
    const highAdCostChannels = Object.entries(channelAnalysis)
      .filter(([,data]: [string, any]) => (data.adCost / data.revenue) > 0.3);
    
    if (highAdCostChannels.length > 0) {
      insights.risks.push(`Chi phí quảng cáo cao tại ${highAdCostChannels.map(([name]) => name).join(', ')} - cần xem xét lại.`);
    }
    
    const lowRevenueBranches = Object.entries(branchAnalysis)
      .filter(([,data]: [string, any]) => data.percentage < 20);
    
    if (lowRevenueBranches.length > 0) {
      insights.risks.push(`Hiệu suất thấp tại ${lowRevenueBranches.map(([name]) => name).join(', ')} - rủi ro đóng cửa.`);
    }
    
    insights.risks.push('Rủi ro mất khách hàng do cạnh tranh tăng cao.');
  } else {
    // Risks cho báo cáo toàn diện
    if (avgROI < 3) {
      insights.risks.push('ROI quá thấp - có thể ảnh hưởng đến lợi nhuận.');
    }
    
    const highAdCostChannels = Object.entries(channelAnalysis)
      .filter(([,data]: [string, any]) => (data.adCost / data.revenue) > 0.3);
    
    if (highAdCostChannels.length > 0) {
      insights.risks.push(`Chi phí quảng cáo cao tại ${highAdCostChannels.map(([name]) => name).join(', ')} - cần xem xét lại.`);
    }
    
    if (Object.keys(branchAnalysis).length < 2) {
      insights.risks.push('Phụ thuộc vào ít chi nhánh - rủi ro tập trung.');
    }
    
    insights.risks.push('Rủi ro thay đổi thuật toán quảng cáo ảnh hưởng đến hiệu suất.');
  }

  // Tạo trends
  const weeklyValues = Object.values(weeklyAnalysis) as number[];
  if (weeklyValues.length > 1) {
    const trend = weeklyValues[weeklyValues.length - 1] > weeklyValues[0] ? 'tăng' : 'giảm';
    const changePercent = Math.abs((weeklyValues[weeklyValues.length - 1] - weeklyValues[0]) / weeklyValues[0] * 100);
    insights.trends = `Xu hướng doanh thu ${trend} ${changePercent.toFixed(1)}% trong ${timeDescription}.`;
  } else {
    insights.trends = `Dữ liệu cho ${timeDescription} - cần theo dõi thêm để đánh giá xu hướng.`;
  }

  return insights;
}
