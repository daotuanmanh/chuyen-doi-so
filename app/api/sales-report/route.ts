import { NextRequest, NextResponse } from 'next/server';
import { ExcelAnalyzer } from '../../../utils/excel-analyzer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week');
    const year = searchParams.get('year') || '2025';

    if (!week) {
      return NextResponse.json(
        { error: 'Thiếu tham số week' },
        { status: 400 }
      );
    }

    const analyzer = new ExcelAnalyzer();
    await analyzer.loadSalesData();

    const weeklyReport = analyzer.getWeeklyReport(parseInt(week), parseInt(year));
    
    // Tính toán thêm các chỉ số
    const totalAdCost = Object.values(weeklyReport.branchBreakdown).reduce((sum, revenue) => sum + revenue, 0);
    const avgROI = totalAdCost > 0 ? weeklyReport.totalRevenue / totalAdCost : 0;
    
    // So sánh với tuần trước
    const previousWeek = parseInt(week) - 1;
    let growthRate = 0;
    if (previousWeek > 0) {
      const previousReport = analyzer.getWeeklyReport(previousWeek, parseInt(year));
      if (previousReport.totalRevenue > 0) {
        growthRate = ((weeklyReport.totalRevenue - previousReport.totalRevenue) / previousReport.totalRevenue) * 100;
      }
    }

    const enhancedReport = {
      ...weeklyReport,
      totalAdCost,
      avgROI,
      growthRate,
      summary: {
        totalRevenue: weeklyReport.totalRevenue.toLocaleString('vi-VN'),
        totalAdCost: totalAdCost.toLocaleString('vi-VN'),
        avgROI: avgROI.toFixed(2),
        growthRate: growthRate.toFixed(2) + '%',
        topBranch: Object.entries(weeklyReport.branchBreakdown)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
      }
    };

    return NextResponse.json(enhancedReport);
  } catch (error) {
    console.error('Error generating sales report:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo báo cáo doanh thu' },
      { status: 500 }
    );
  }
}
