'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ComposedChart } from 'recharts';
import { useSettings } from '@/contexts/SettingsContext';
import { exportReport } from '@/utils/exportUtils';

interface ReportData {
  summary: {
    totalRevenue: number;
    totalAdCost: number;
    avgROI: number;
    totalRevenueFormatted: string;
    totalAdCostFormatted: string;
    avgROIFormatted: string;
  };
  branchAnalysis?: { [key: string]: any };
  channelAnalysis?: { [key: string]: any };
  weeklyAnalysis?: { [key: string]: number };
  detailedMetrics: {
    revenuePerDay: number;
    adCostPerDay: number;
    roiTrend: number;
    growthRate: number;
    efficiencyScore: number;
  };
  financialMetrics?: {
    profitMargin: number;
    costPerAcquisition: number;
    revenueGrowth: number;
    roiTrend: number;
    efficiencyScore: number;
  };
  operationalMetrics?: {
    averageOrderValue: number;
    conversionRate: number;
    customerRetentionRate: number;
    operationalEfficiency: number;
    branchPerformance: { [key: string]: any };
    channelPerformance: { [key: string]: any };
  };
  insights: {
    overview: string;
    topPerformer: string;
    recommendations: string[];
    risks: string[];
    trends: string;
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function DetailedReports() {
  const { settings } = useSettings();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('comprehensive');
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState({
    timeType: settings.dashboardSettings.defaultTimeRange,
    timeValue: 'Q1',
    branch: settings.dashboardSettings.defaultBranch,
    year: '2025'
  });

  const [customReport, setCustomReport] = useState({
    includeRevenue: true,
    includeROI: true,
    includeChannels: true,
    includeBranches: true,
    includeTrends: true,
    includeInsights: true,
    reportTitle: 'Báo cáo Chi tiết',
    reportDescription: 'Phân tích toàn diện hiệu suất kinh doanh'
  });

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters,
        reportType
      });
      const response = await fetch(`/api/detailed-reports?${params}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [filters, reportType]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCustomReportChange = (key: string, value: any) => {
    setCustomReport(prev => ({ ...prev, [key]: value }));
  };

  // Hàm tạo nội dung nút xuất động theo cài đặt
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

  const exportButtonContent = getExportButtonContent();

  const exportToReport = async () => {
    if (!reportRef.current || !data) return;
    
    setExporting(true);
    try {
      await exportReport(
        reportRef.current,
        data,
        settings.exportSettings,
        'detailed-report'
      );
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Có lỗi khi xuất báo cáo. Vui lòng thử lại!');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-700 dark:text-gray-200 font-medium">Đang tạo báo cáo chi tiết...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl text-red-600 dark:text-red-400 font-medium">Lỗi tạo báo cáo</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-6" ref={reportRef}>
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 dark:border-gray-700/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                📋 Báo cáo Chi tiết
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Phân tích chuyên sâu và báo cáo tùy chỉnh</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={exportToReport}
                disabled={exporting}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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

          {/* Report Type Selector */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setReportType('comprehensive')}
              className={`p-4 rounded-xl font-semibold transition-all duration-200 ${
                reportType === 'comprehensive'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70'
              }`}
            >
              📊 Toàn diện
            </button>
            <button
              onClick={() => setReportType('financial')}
              className={`p-4 rounded-xl font-semibold transition-all duration-200 ${
                reportType === 'financial'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70'
              }`}
            >
              💰 Tài chính
            </button>
            <button
              onClick={() => setReportType('operational')}
              className={`p-4 rounded-xl font-semibold transition-all duration-200 ${
                reportType === 'operational'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70'
              }`}
            >
              ⚙️ Vận hành
            </button>
            <button
              onClick={() => setReportType('custom')}
              className={`p-4 rounded-xl font-semibold transition-all duration-200 ${
                reportType === 'custom'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'bg-white/500 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70'
              }`}
            >
              🎨 Tùy chỉnh
            </button>
          </div>

          {/* Custom Report Settings */}
          {reportType === 'custom' && (
            <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4">⚙️ Cài đặt Báo cáo Tùy chỉnh</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Tiêu đề báo cáo</label>
                  <input
                    type="text"
                    value={customReport.reportTitle}
                    onChange={(e) => handleCustomReportChange('reportTitle', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Mô tả</label>
                  <input
                    type="text"
                    value={customReport.reportDescription}
                    onChange={(e) => handleCustomReportChange('reportDescription', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Nội dung</label>
                  <div className="space-y-2">
                    {Object.entries({
                      includeRevenue: 'Doanh thu',
                      includeROI: 'ROI & Hiệu quả',
                      includeChannels: 'Phân tích Kênh',
                      includeBranches: 'Phân tích Chi nhánh',
                      includeTrends: 'Xu hướng',
                      includeInsights: 'AI Insights'
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={customReport[key as keyof typeof customReport] as boolean}
                          onChange={(e) => handleCustomReportChange(key, e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Thời gian</label>
              <select
                value={filters.timeType}
                onChange={(e) => handleFilterChange('timeType', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
              >
                <option value="week">Tuần</option>
                <option value="month">Tháng</option>
                <option value="quarter">Quý</option>
              </select>
            </div>
            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Giá trị</label>
                  <select
                    value={filters.timeValue}
                    onChange={(e) => handleFilterChange('timeValue', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
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
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Chi nhánh</label>
                  <select
                    value={filters.branch}
                    onChange={(e) => handleFilterChange('branch', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                  >
                <option value="all">Tất cả</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
            </div>
            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Năm</label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                  >
                <option value="2025">2025</option>
              </select>
            </div>
          </div>
        </div>

                  {/* Report Content */}
        <div className="space-y-8">
          {/* Executive Summary */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/20">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
              <span className="mr-3">📋</span>
              {customReport.reportTitle}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{customReport.reportDescription}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">💰 Tổng Doanh thu</h3>
                <p className="text-3xl font-bold">{data.summary.totalRevenueFormatted} VND</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">📈 ROI Trung bình</h3>
                <p className="text-3xl font-bold">{data.summary.avgROIFormatted}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">💸 Chi phí Quảng cáo</h3>
                <p className="text-3xl font-bold">{data.summary.totalAdCostFormatted} VND</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">📊 Hiệu suất</h3>
                <p className="text-3xl font-bold">{data.detailedMetrics?.efficiencyScore?.toFixed(1) || '0.0'}%</p>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          {(reportType === 'comprehensive' || reportType === 'financial' || customReport.includeRevenue) && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/20">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">📊</span>
                Chỉ số Chi tiết
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">💰 Doanh thu/ngày</h4>
                  <p className="text-2xl font-bold text-blue-900">
                    {data.detailedMetrics?.revenuePerDay?.toLocaleString('vi-VN') || '0'} VND
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">💸 Chi phí/ngày</h4>
                  <p className="text-2xl font-bold text-green-900">
                    {data.detailedMetrics?.adCostPerDay?.toLocaleString('vi-VN') || '0'} VND
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">📈 Tỷ lệ tăng trưởng</h4>
                  <p className="text-2xl font-bold text-orange-900">
                    {data.detailedMetrics?.growthRate > 0 ? '+' : ''}{data.detailedMetrics?.growthRate?.toFixed(1) || '0.0'}%
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">🎯 Xu hướng ROI</h4>
                  <p className="text-2xl font-bold text-purple-900">
                    {data.detailedMetrics?.roiTrend > 0 ? '+' : ''}{data.detailedMetrics?.roiTrend?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Financial Metrics */}
          {data.financialMetrics && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/20">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">💰</span>
                Chỉ số Tài chính
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">📈 Biên lợi nhuận</h4>
                  <p className="text-2xl font-bold text-green-900">
                    {data.financialMetrics?.profitMargin?.toFixed(1) || '0.0'}%
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">💸 Chi phí/khách hàng</h4>
                  <p className="text-2xl font-bold text-blue-900">
                    {data.financialMetrics?.costPerAcquisition?.toLocaleString('vi-VN') || '0'} VND
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">📊 Tăng trưởng doanh thu</h4>
                  <p className="text-2xl font-bold text-orange-900">
                    {data.financialMetrics?.revenueGrowth > 0 ? '+' : ''}{data.financialMetrics?.revenueGrowth?.toFixed(1) || '0.0'}%
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">🎯 Hiệu quả tài chính</h4>
                  <p className="text-2xl font-bold text-purple-900">
                    {data.financialMetrics?.efficiencyScore?.toFixed(1) || '0.0'}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Operational Metrics */}
          {data.operationalMetrics && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/20">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">⚙️</span>
                Chỉ số Vận hành
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">🛒 Giá trị đơn hàng TB</h4>
                  <p className="text-2xl font-bold text-blue-900">
                    {data.operationalMetrics?.averageOrderValue?.toLocaleString('vi-VN') || '0'} VND
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">📈 Tỷ lệ chuyển đổi</h4>
                  <p className="text-2xl font-bold text-green-900">
                    {data.operationalMetrics?.conversionRate?.toFixed(1) || '0.0'}%
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">🔄 Tỷ lệ giữ chân KH</h4>
                  <p className="text-2xl font-bold text-orange-900">
                    {data.operationalMetrics?.customerRetentionRate?.toFixed(1) || '0.0'}%
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">⚡ Hiệu suất vận hành</h4>
                  <p className="text-2xl font-bold text-purple-900">
                    {data.operationalMetrics?.operationalEfficiency?.toFixed(1) || '0.0'}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Branch Analysis */}
          {(reportType === 'comprehensive' || reportType === 'operational' || customReport.includeBranches) && data.branchAnalysis && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/20">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">🏢</span>
                Phân tích Chi nhánh
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={Object.entries(data.branchAnalysis).map(([name, data]: [string, any]) => ({
                  name,
                  revenue: data.revenue,
                  roi: data.roi,
                  adCost: data.adCost
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#3B82F6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      color: '#1f2937'
                    }}
                  />
                  <Bar yAxisId="left" dataKey="revenue" fill="url(#revenueGradient)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }} />
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                  </defs>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Channel Analysis */}
          {(reportType === 'comprehensive' || reportType === 'operational' || customReport.includeChannels) && data.channelAnalysis && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/20">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">🛒</span>
                Phân tích Kênh
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={Object.entries(data.channelAnalysis).map(([name, data]: [string, any]) => ({
                        name,
                        revenue: data.revenue,
                        percentage: data.percentage
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {Object.entries(data.channelAnalysis).map((entry, index) => (
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
                <div className="space-y-4">
                  {Object.entries(data.channelAnalysis).map(([name, data]: [string, any], index) => (
                    <div key={name} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{name}</h4>
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Doanh thu:</span>
                          <p className="font-semibold text-gray-800">{data.revenue?.toLocaleString('vi-VN') || '0'} VND</p>
                        </div>
                        <div>
                          <span className="text-gray-600">ROI:</span>
                          <p className="font-semibold text-gray-800">{data.roi?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trends Analysis */}
          {(reportType === 'comprehensive' || reportType === 'operational' || customReport.includeTrends) && data.weeklyAnalysis && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/20">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">📈</span>
                Phân tích Xu hướng
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={Object.entries(data.weeklyAnalysis).map(([week, revenue]) => ({
                  week: `Tuần ${week}`,
                  revenue,
                  cumulative: 0 // Will be calculated
                })).map((item, index, array) => ({
                  ...item,
                  cumulative: array.slice(0, index + 1).reduce((sum, curr) => sum + curr.revenue, 0)
                }))}>
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
                    dataKey="revenue" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6}
                    name="Doanh thu tuần"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulative" 
                    stackId="2"
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.3}
                    name="Doanh thu tích lũy"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* AI Insights */}
          {(reportType === 'comprehensive' || customReport.includeInsights) && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/20">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">🤖</span>
                AI Phân tích & Đề xuất
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Overview */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <span className="mr-2">📋</span>
                    Tổng quan:
                  </h4>
                  <p className="text-blue-700 leading-relaxed">{data.insights.overview}</p>
                </div>

                {/* Top Performer */}
                <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                    <span className="mr-2">🏆</span>
                    Hiệu suất hàng đầu:
                  </h4>
                  <p className="text-orange-700 leading-relaxed">{data.insights.topPerformer}</p>
                </div>
              </div>

              {/* Recommendations & Risks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                    <span className="mr-2">💡</span>
                    Đề xuất Chiến lược:
                  </h4>
                  <ul className="text-green-700 space-y-2">
                    {data.insights.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-4 flex items-center">
                    <span className="mr-2">⚠️</span>
                    Cảnh báo Rủi ro:
                  </h4>
                  <ul className="text-red-700 space-y-2">
                    {data.insights.risks.map((risk, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span className="text-sm">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Trends */}
              {data.insights.trends && (
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                    <span className="mr-2">📈</span>
                    Phân tích Xu hướng:
                  </h4>
                  <p className="text-purple-700 leading-relaxed">{data.insights.trends}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
