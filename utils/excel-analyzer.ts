import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export interface SalesData {
  quarter: string;
  year: number;
  week: number;
  week_start_date: number;
  channel: string;
  branch: string;
  total_revenue: number;
  ad_cost: number;
  roi: number;
}

export interface WeeklyReport {
  week: string;
  totalRevenue: number;
  branchBreakdown: { [branch: string]: number };
  dailyRevenue: { [date: string]: number };
  topProducts?: Array<{ product: string; revenue: number }>;
  growthRate?: number;
}

export class ExcelAnalyzer {
  private salesData: SalesData[] = [];

  async loadSalesData(): Promise<void> {
    const excelFiles = [
      'sales_Q1_2025_with_branch.xlsx',
      'sales_Q2_2025_with_branch.xlsx', 
      'sales_Q3_2025_with_branch.xlsx',
      'sales_Q4_2025_with_branch.xlsx'
    ];

    for (const file of excelFiles) {
      try {
        const filePath = path.join(process.cwd(), file);
        
        // Kiểm tra file có tồn tại không
        if (!fs.existsSync(filePath)) {
          console.error(`File not found: ${filePath}`);
          continue;
        }
        
        // Đọc file bằng fs.readFileSync
        const buffer = fs.readFileSync(filePath);
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Transform data to our format
        const transformedData = jsonData.map((row: any) => ({
          quarter: row.quarter,
          year: parseInt(row.year),
          week: parseInt(row.week),
          week_start_date: parseInt(row.week_start_date),
          channel: row.channel,
          branch: row.branch,
          total_revenue: parseFloat(row.total_revenue || 0),
          ad_cost: parseFloat(row.ad_cost || 0),
          roi: parseFloat(row.roi || 0)
        }));

        this.salesData.push(...transformedData);
        console.log(`Loaded ${transformedData.length} records from ${file}`);
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }
  }

  getWeeklyReport(targetWeek: number, targetYear: number = 2025): WeeklyReport {
    const filteredData = this.salesData.filter(item => 
      item.week === targetWeek && item.year === targetYear
    );

    const totalRevenue = filteredData.reduce((sum, item) => sum + item.total_revenue, 0);
    const totalAdCost = filteredData.reduce((sum, item) => sum + item.ad_cost, 0);
    
    const branchBreakdown: { [branch: string]: number } = {};
    const channelBreakdown: { [channel: string]: number } = {};
    const dailyRevenue: { [date: string]: number } = {};

    filteredData.forEach(item => {
      // Branch breakdown
      branchBreakdown[item.branch] = (branchBreakdown[item.branch] || 0) + item.total_revenue;
      
      // Channel breakdown
      channelBreakdown[item.channel] = (channelBreakdown[item.channel] || 0) + item.total_revenue;
      
      // Daily revenue (using week_start_date)
      const dateKey = new Date((item.week_start_date - 25569) * 86400 * 1000).toISOString().split('T')[0];
      dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + item.total_revenue;
    });

    // Top performing branches by ROI
    const branchROI = Object.keys(branchBreakdown).map(branch => {
      const branchData = filteredData.filter(item => item.branch === branch);
      const totalRevenue = branchData.reduce((sum, item) => sum + item.total_revenue, 0);
      const totalAdCost = branchData.reduce((sum, item) => sum + item.ad_cost, 0);
      const avgROI = totalAdCost > 0 ? totalRevenue / totalAdCost : 0;
      return { branch, revenue: totalRevenue, roi: avgROI };
    }).sort((a, b) => b.roi - a.roi);

    return {
      week: `Tuần ${targetWeek}, ${targetYear}`,
      totalRevenue,
      branchBreakdown,
      dailyRevenue,
      topProducts: branchROI.slice(0, 5).map(item => ({ product: item.branch, revenue: item.revenue })),
      growthRate: totalAdCost > 0 ? totalRevenue / totalAdCost : 0
    };
  }

  getDataStructure(): any {
    if (this.salesData.length === 0) {
      return { message: 'No data loaded' };
    }

    const sample = this.salesData[0];
    const uniqueBranches = Array.from(new Set(this.salesData.map(item => item.branch)));
    const weekRange = {
      start: this.salesData.reduce((min, item) => 
        item.week < min.week ? item : min
      ).week,
      end: this.salesData.reduce((max, item) => 
        item.week > max.week ? item : max
      ).week
    };

    return {
      totalRecords: this.salesData.length,
      sampleRecord: sample,
      branches: uniqueBranches,
      weekRange,
      fields: Object.keys(sample)
    };
  }

  getAllData(): SalesData[] {
    return this.salesData;
  }
}
