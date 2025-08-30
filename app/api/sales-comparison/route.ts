import { NextRequest, NextResponse } from 'next/server';
import { ExcelAnalyzer } from '@/utils/excel-analyzer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const comparisonType = searchParams.get('comparisonType'); // 'period', 'branch', 'channel'
    const year = searchParams.get('year') || '2025';

    const analyzer = new ExcelAnalyzer();
    await analyzer.loadSalesData();

    let period1Data: any = null;
    let period2Data: any = null;

    // Lấy dữ liệu cho period 1 và period 2 dựa trên loại so sánh
    if (comparisonType === 'period') {
      const period1Type = searchParams.get('period1Type');
      const period1Value = searchParams.get('period1Value');
      const period2Type = searchParams.get('period2Type');
      const period2Value = searchParams.get('period2Value');

      period1Data = await getPeriodData(analyzer, period1Type!, period1Value!, year);
      period2Data = await getPeriodData(analyzer, period2Type!, period2Value!, year);
    } else if (comparisonType === 'branch') {
      const branch1 = searchParams.get('branch1');
      const branch2 = searchParams.get('branch2');
      const periodValue = searchParams.get('period1Value');

      period1Data = await getBranchData(analyzer, branch1!, periodValue!, year);
      period2Data = await getBranchData(analyzer, branch2!, periodValue!, year);
    } else if (comparisonType === 'channel') {
      const channel1 = searchParams.get('channel1');
      const channel2 = searchParams.get('channel2');
      const periodValue = searchParams.get('period1Value');

      period1Data = await getChannelData(analyzer, channel1!, periodValue!, year);
      period2Data = await getChannelData(analyzer, channel2!, periodValue!, year);
    }



    // Tạo comparison insights
    const comparison = generateComparisonInsights(period1Data, period2Data, comparisonType || 'period');

    const response = {
      period1: period1Data,
      period2: period2Data,
      comparison
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating comparison data:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo dữ liệu so sánh' },
      { status: 500 }
    );
  }
}

async function getPeriodData(analyzer: ExcelAnalyzer, timeType: string, timeValue: string, year: string) {
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

  return processData(filteredData);
}

async function getBranchData(analyzer: ExcelAnalyzer, branch: string, periodValue: string, year: string) {
  let filteredData = analyzer.getAllData();

  // Lọc theo quý
  filteredData = filteredData.filter((item: any) => 
    item.quarter === periodValue && item.year === parseInt(year)
  );

  // Lọc theo chi nhánh
  filteredData = filteredData.filter((item: any) => item.branch === branch);

  return processData(filteredData);
}

async function getChannelData(analyzer: ExcelAnalyzer, channel: string, periodValue: string, year: string) {
  let filteredData = analyzer.getAllData();

  // Lọc theo quý
  filteredData = filteredData.filter((item: any) => 
    item.quarter === periodValue && item.year === parseInt(year)
  );

  // Lọc theo kênh
  filteredData = filteredData.filter((item: any) => item.channel === channel);

  return processData(filteredData);
}

function processData(filteredData: any[]) {
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
    
    branchAnalysis[branchName] = {
      revenue: branchRevenue,
      adCost: branchAdCost,
      roi: branchROI,
      percentage: (branchRevenue / totalRevenue) * 100
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
    
    channelAnalysis[channelName] = {
      revenue: channelRevenue,
      adCost: channelAdCost,
      roi: channelROI,
      percentage: (channelRevenue / totalRevenue) * 100
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

  return {
    summary: {
      totalRevenue,
      totalAdCost,
      avgROI,
      totalRevenueFormatted: totalRevenue.toLocaleString('vi-VN'),
      totalAdCostFormatted: totalAdCost.toLocaleString('vi-VN'),
      avgROIFormatted: avgROI.toFixed(2)
    },
    branchAnalysis,
    channelAnalysis,
    weeklyAnalysis
  };
}

function generateComparisonInsights(period1Data: any, period2Data: any, comparisonType: string) {
  const revenueGrowth = period1Data.summary.totalRevenue > 0 
    ? ((period2Data.summary.totalRevenue - period1Data.summary.totalRevenue) / period1Data.summary.totalRevenue) * 100 
    : 0;
  
  const roiChange = period2Data.summary.avgROI - period1Data.summary.avgROI;
  
  const adCostChange = period1Data.summary.totalAdCost > 0 
    ? ((period2Data.summary.totalAdCost - period1Data.summary.totalAdCost) / period1Data.summary.totalAdCost) * 100 
    : 0;

  // Xác định top performer
  let topPerformer = '';
  if (comparisonType === 'period') {
    topPerformer = period2Data.summary.totalRevenue > period1Data.summary.totalRevenue 
      ? `Thời kỳ 2 có hiệu suất tốt hơn với doanh thu cao hơn ${Math.abs(revenueGrowth).toFixed(1)}%`
      : `Thời kỳ 1 có hiệu suất tốt hơn với doanh thu cao hơn ${Math.abs(revenueGrowth).toFixed(1)}%`;
  } else if (comparisonType === 'branch') {
    topPerformer = period2Data.summary.totalRevenue > period1Data.summary.totalRevenue 
      ? `Chi nhánh 2 có hiệu suất tốt hơn với doanh thu cao hơn ${Math.abs(revenueGrowth).toFixed(1)}%`
      : `Chi nhánh 1 có hiệu suất tốt hơn với doanh thu cao hơn ${Math.abs(revenueGrowth).toFixed(1)}%`;
  } else if (comparisonType === 'channel') {
    topPerformer = period2Data.summary.totalRevenue > period1Data.summary.totalRevenue 
      ? `Kênh 2 có hiệu suất tốt hơn với doanh thu cao hơn ${Math.abs(revenueGrowth).toFixed(1)}%`
      : `Kênh 1 có hiệu suất tốt hơn với doanh thu cao hơn ${Math.abs(revenueGrowth).toFixed(1)}%`;
  }

  // Tạo insights
  const insights: string[] = [];
  
  if (revenueGrowth > 0) {
    insights.push(`Tăng trưởng doanh thu tích cực: +${revenueGrowth.toFixed(1)}%`);
  } else if (revenueGrowth < 0) {
    insights.push(`Doanh thu giảm: ${revenueGrowth.toFixed(1)}% - cần phân tích nguyên nhân`);
  }

  if (roiChange > 0) {
    insights.push(`Hiệu quả quảng cáo cải thiện: ROI tăng ${roiChange.toFixed(2)} điểm`);
  } else if (roiChange < 0) {
    insights.push(`Hiệu quả quảng cáo giảm: ROI giảm ${Math.abs(roiChange).toFixed(2)} điểm`);
  }

  if (adCostChange > 0) {
    insights.push(`Chi phí quảng cáo tăng: +${adCostChange.toFixed(1)}%`);
  } else if (adCostChange < 0) {
    insights.push(`Chi phí quảng cáo giảm: ${adCostChange.toFixed(1)}% - tiết kiệm chi phí`);
  }

  // So sánh ROI
  const roiDifference = Math.abs(roiChange);
  if (roiDifference > 1) {
    insights.push(`Chênh lệch ROI đáng kể: ${roiDifference.toFixed(2)} điểm`);
  }

  // Phân tích xu hướng
  const period1Weeks = Object.keys(period1Data.weeklyAnalysis).length;
  const period2Weeks = Object.keys(period2Data.weeklyAnalysis).length;
  
  if (period1Weeks > 0 && period2Weeks > 0) {
    const avgRevenue1 = period1Data.summary.totalRevenue / period1Weeks;
    const avgRevenue2 = period2Data.summary.totalRevenue / period2Weeks;
    const weeklyGrowth = avgRevenue1 > 0 ? ((avgRevenue2 - avgRevenue1) / avgRevenue1) * 100 : 0;
    
    if (weeklyGrowth > 0) {
      insights.push(`Doanh thu trung bình/tuần tăng: +${weeklyGrowth.toFixed(1)}%`);
    } else if (weeklyGrowth < 0) {
      insights.push(`Doanh thu trung bình/tuần giảm: ${weeklyGrowth.toFixed(1)}%`);
    }
  }

  return {
    revenueGrowth,
    roiChange,
    adCostChange,
    topPerformer,
    insights
  };
}
