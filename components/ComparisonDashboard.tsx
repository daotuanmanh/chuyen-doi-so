'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface ComparisonData {
  period1: {
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
  };
  period2: {
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
  };
  comparison: {
    revenueGrowth: number;
    roiChange: number;
    adCostChange: number;
    topPerformer: string;
    insights: string[];
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function ComparisonDashboard() {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparisonType, setComparisonType] = useState('period'); // 'period', 'branch', 'channel'
  
  const [filters, setFilters] = useState({
    // Period comparison
    period1Type: 'quarter',
    period1Value: 'Q1',
    period2Type: 'quarter', 
    period2Value: 'Q2',
    
    // Branch comparison
    branch1: 'Hà Nội',
    branch2: 'Hồ Chí Minh',
    
    // Channel comparison
    channel1: 'Shopee',
    channel2: 'Lazada',
    
    year: '2025'
  });

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters,
        comparisonType
      });
      const response = await fetch(`/api/sales-comparison?${params}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonData();
  }, [filters, comparisonType]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) return '📈';
    if (value < 0) return '📉';
    return '➡️';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-700 dark:text-gray-200 font-medium">Đang tải dữ liệu so sánh...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl text-red-600 dark:text-red-400 font-medium">Lỗi tải dữ liệu so sánh</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 dark:border-gray-700/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                📊 So sánh Hiệu suất
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Phân tích so sánh chi tiết giữa các thời kỳ, chi nhánh và kênh</p>
            </div>
          </div>

          {/* Comparison Type Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setComparisonType('period')}
              className={`p-4 rounded-xl font-semibold transition-all duration-200 ${
                comparisonType === 'period'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-600/50'
              }`}
            >
              📅 So sánh Thời kỳ
            </button>
            <button
              onClick={() => setComparisonType('branch')}
              className={`p-4 rounded-xl font-semibold transition-all duration-200 ${
                comparisonType === 'branch'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-600/50'
              }`}
            >
              🏢 So sánh Chi nhánh
            </button>
            <button
              onClick={() => setComparisonType('channel')}
              className={`p-4 rounded-xl font-semibold transition-all duration-200 ${
                comparisonType === 'channel'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-600/50'
              }`}
            >
              🛒 So sánh Kênh
            </button>
          </div>

          {/* Dynamic Filters */}
          {comparisonType === 'period' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Thời kỳ 1</label>
                <select
                  value={filters.period1Type}
                  onChange={(e) => handleFilterChange('period1Type', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-gray-200"
                >
                  <option value="week">Tuần</option>
                  <option value="month">Tháng</option>
                  <option value="quarter">Quý</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Giá trị 1</label>
                <select
                  value={filters.period1Value}
                  onChange={(e) => handleFilterChange('period1Value', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-gray-200"
                >
                  {filters.period1Type === 'week' && Array.from({length: 52}, (_, i) => (
                    <option key={i+1} value={i+1}>Tuần {i+1}</option>
                  ))}
                  {filters.period1Type === 'month' && Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1}>Tháng {i+1}</option>
                  ))}
                  {filters.period1Type === 'quarter' && ['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Thời kỳ 2</label>
                <select
                  value={filters.period2Type}
                  onChange={(e) => handleFilterChange('period2Type', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-gray-200"
                >
                  <option value="week">Tuần</option>
                  <option value="month">Tháng</option>
                  <option value="quarter">Quý</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Giá trị 2</label>
                <select
                  value={filters.period2Value}
                  onChange={(e) => handleFilterChange('period2Value', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-gray-200"
                >
                  {filters.period2Type === 'week' && Array.from({length: 52}, (_, i) => (
                    <option key={i+1} value={i+1}>Tuần {i+1}</option>
                  ))}
                  {filters.period2Type === 'month' && Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1}>Tháng {i+1}</option>
                  ))}
                  {filters.period2Type === 'quarter' && ['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Năm</label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-gray-200"
                >
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>
          )}

          {comparisonType === 'branch' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Chi nhánh 1</label>
                <select
                  value={filters.branch1}
                  onChange={(e) => handleFilterChange('branch1', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 dark:text-gray-200"
                >
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Chi nhánh 2</label>
                <select
                  value={filters.branch2}
                  onChange={(e) => handleFilterChange('branch2', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 dark:text-gray-200"
                >
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Thời kỳ</label>
                <select
                  value={filters.period1Value}
                  onChange={(e) => handleFilterChange('period1Value', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 dark:text-gray-200"
                >
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                </select>
              </div>
            </div>
          )}

          {comparisonType === 'channel' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Kênh 1</label>
                <select
                  value={filters.channel1}
                  onChange={(e) => handleFilterChange('channel1', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 dark:text-gray-200"
                >
                  <option value="Shopee">Shopee</option>
                  <option value="Lazada">Lazada</option>
                  <option value="Tiki">Tiki</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Kênh 2</label>
                <select
                  value={filters.channel2}
                  onChange={(e) => handleFilterChange('channel2', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 dark:text-gray-200"
                >
                  <option value="Lazada">Lazada</option>
                  <option value="Shopee">Shopee</option>
                  <option value="Tiki">Tiki</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Thời kỳ</label>
                <select
                  value={filters.period1Value}
                  onChange={(e) => handleFilterChange('period1Value', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 dark:text-gray-200"
                >
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Growth Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">💰 Tăng trưởng Doanh thu</h3>
              <span className="text-2xl">{getGrowthIcon(data.comparison.revenueGrowth)}</span>
            </div>
            <p className={`text-3xl font-bold ${getGrowthColor(data.comparison.revenueGrowth)}`}>
              {data.comparison.revenueGrowth > 0 ? '+' : ''}{data.comparison.revenueGrowth.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {data.comparison.revenueGrowth > 0 ? 'Tăng trưởng tích cực' : data.comparison.revenueGrowth < 0 ? 'Giảm sút' : 'Không thay đổi'}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">📈 Thay đổi ROI</h3>
              <span className="text-2xl">{getGrowthIcon(data.comparison.roiChange)}</span>
            </div>
            <p className={`text-3xl font-bold ${getGrowthColor(data.comparison.roiChange)}`}>
              {data.comparison.roiChange > 0 ? '+' : ''}{data.comparison.roiChange.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {data.comparison.roiChange > 0 ? 'Hiệu quả cải thiện' : data.comparison.roiChange < 0 ? 'Hiệu quả giảm' : 'Hiệu quả ổn định'}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">💸 Thay đổi Chi phí</h3>
              <span className="text-2xl">{getGrowthIcon(-data.comparison.adCostChange)}</span>
            </div>
            <p className={`text-3xl font-bold ${getGrowthColor(-data.comparison.adCostChange)}`}>
              {data.comparison.adCostChange > 0 ? '+' : ''}{data.comparison.adCostChange.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {data.comparison.adCostChange < 0 ? 'Chi phí giảm' : data.comparison.adCostChange > 0 ? 'Chi phí tăng' : 'Chi phí ổn định'}
            </p>
          </div>
        </div>

        {/* Comparison Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Comparison */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
              <span className="mr-3">📊</span>
              So sánh Doanh thu
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={[
                {
                  name: comparisonType === 'period' ? `${filters.period1Value}` : comparisonType === 'branch' ? filters.branch1 : filters.channel1,
                  revenue: data.period1.summary.totalRevenue,
                  type: 'Period 1'
                },
                {
                  name: comparisonType === 'period' ? `${filters.period2Value}` : comparisonType === 'branch' ? filters.branch2 : filters.channel2,
                  revenue: data.period2.summary.totalRevenue,
                  type: 'Period 2'
                }
              ]}>
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
                  <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ROI Comparison */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
              <span className="mr-3">📈</span>
              So sánh ROI
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={[
                {
                  name: comparisonType === 'period' ? `${filters.period1Value}` : comparisonType === 'branch' ? filters.branch1 : filters.channel1,
                  roi: data.period1.summary.avgROI,
                  type: 'Period 1'
                },
                {
                  name: comparisonType === 'period' ? `${filters.period2Value}` : comparisonType === 'branch' ? filters.branch2 : filters.channel2,
                  roi: data.period2.summary.avgROI,
                  type: 'Period 2'
                }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => `${Number(value).toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    color: '#1f2937'
                  }}
                />
                <Bar dataKey="roi" fill="url(#roiGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>



        {/* Trend Comparison */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20 dark:border-gray-700/20">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
            <span className="mr-3">📈</span>
            So sánh Xu hướng
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={(() => {
              // Kết hợp tất cả tuần từ cả hai period
              const allWeeks = new Set([
                ...Object.keys(data.period1.weeklyAnalysis),
                ...Object.keys(data.period2.weeklyAnalysis)
              ]);
              
              return Array.from(allWeeks).sort((a, b) => parseInt(a) - parseInt(b)).map(week => ({
                week: `Tuần ${week}`,
                period1: data.period1.weeklyAnalysis[week] || 0,
                period2: data.period2.weeklyAnalysis[week] || 0
              }));
            })()}>
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
                dataKey="period1" 
                stackId="1"
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.6}
                name={comparisonType === 'period' ? `${filters.period1Value}` : comparisonType === 'branch' ? filters.branch1 : filters.channel1}
              />
              <Area 
                type="monotone" 
                dataKey="period2" 
                stackId="2"
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
                name={comparisonType === 'period' ? `${filters.period2Value}` : comparisonType === 'branch' ? filters.branch2 : filters.channel2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
            <span className="mr-3">🤖</span>
            AI Phân tích So sánh
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Performer */}
            <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                <span className="mr-2">🏆</span>
                Hiệu suất hàng đầu:
              </h4>
              <p className="text-orange-700 leading-relaxed">{data.comparison.topPerformer}</p>
            </div>

            {/* Key Insights */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <span className="mr-2">💡</span>
                Insights chính:
              </h4>
              <div className="space-y-2">
                {data.comparison.insights.map((insight, index) => (
                  <div key={index} className="text-blue-700 text-sm flex items-start">
                    <span className="mr-2 mt-1">•</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
