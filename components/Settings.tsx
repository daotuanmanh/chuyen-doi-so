'use client';

import React, { useState } from 'react';
import { useSettings, SettingsData } from '@/contexts/SettingsContext';
import { timezoneOptions, dateFormatOptions, getCurrentTime, formatDate } from '@/utils/dateTimeUtils';

export default function Settings() {
  const { settings, updateSettings, saveSettings, resetSettings, loading, currentTheme } = useSettings();
  const [activeTab, setActiveTab] = useState('preferences');
  const [saved, setSaved] = useState(false);

  const handleSettingChange = (category: keyof SettingsData, key: string, value: any) => {
    updateSettings(category, key, value);
  };

  const handleSaveSettings = async () => {
    try {
      await saveSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Bạn có chắc muốn đặt lại tất cả cài đặt về mặc định?')) {
      resetSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 dark:border-gray-700/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
                ⚙️ Cài đặt Hệ thống
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Tùy chỉnh trải nghiệm và cấu hình dashboard</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleResetSettings}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-200"
              >
                🔄 Đặt lại
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    💾 Lưu cài đặt
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Success Message */}
          {saved && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700">
              <div className="flex items-center text-green-800 dark:text-green-300">
                <span className="mr-2">✅</span>
                <span className="font-semibold">Cài đặt đã được lưu thành công!</span>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab('preferences')}
              className={`p-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'preferences'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-600/50'
              }`}
            >
              👤 Tùy chọn
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`p-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-600/50'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`p-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'alerts'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-600/50'
              }`}
            >
              🔔 Cảnh báo
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`p-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'export'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-600/50'
              }`}
            >
              📤 Xuất báo cáo
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/20">
          {/* User Preferences */}
          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">👤</span>
                Tùy chọn Người dùng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">🎨 Giao diện</label>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Hiện tại:</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        currentTheme === 'dark' 
                          ? 'bg-gray-800 text-white' 
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {currentTheme === 'dark' ? '🌙 Tối' : '☀️ Sáng'}
                      </span>
                    </div>
                    <select
                      value={settings.userPreferences.theme}
                      onChange={(e) => handleSettingChange('userPreferences', 'theme', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                    >
                      <option value="light">☀️ Sáng</option>
                      <option value="dark">🌙 Tối</option>
                      <option value="auto">🔄 Tự động (Theo hệ thống)</option>
                    </select>
                    {settings.userPreferences.theme === 'auto' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Hệ thống sẽ tự động chuyển đổi theo cài đặt của thiết bị
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">🌍 Ngôn ngữ</label>
                    <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                      Tiếng Việt
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Hiện tại chỉ hỗ trợ tiếng Việt</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">⏰ Múi giờ</label>
                    <div className="mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Thời gian hiện tại: </span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {getCurrentTime(settings.userPreferences.timezone)}
                      </span>
                    </div>
                    <select
                      value={settings.userPreferences.timezone}
                      onChange={(e) => handleSettingChange('userPreferences', 'timezone', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                    >
                      {timezoneOptions.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">📅 Định dạng ngày</label>
                    <div className="mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Ví dụ: </span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {formatDate(new Date(), settings.userPreferences.dateFormat, settings.userPreferences.timezone)}
                      </span>
                    </div>
                    <select
                      value={settings.userPreferences.dateFormat}
                      onChange={(e) => handleSettingChange('userPreferences', 'dateFormat', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                    >
                      {dateFormatOptions.map((format) => (
                        <option key={format.value} value={format.value}>
                          {format.label} ({format.example})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">💰 Đơn vị tiền tệ</label>
                    <select
                      value={settings.userPreferences.currency}
                      onChange={(e) => handleSettingChange('userPreferences', 'currency', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                    >
                      <option value="VND">VND (Việt Nam Đồng)</option>
                      <option value="USD">USD (Đô la Mỹ)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="GBP">GBP (Bảng Anh)</option>
                      <option value="JPY">JPY (Yên Nhật)</option>
                      <option value="KRW">KRW (Won Hàn Quốc)</option>
                      <option value="CNY">CNY (Nhân dân tệ)</option>
                      <option value="SGD">SGD (Đô la Singapore)</option>
                      <option value="THB">THB (Baht Thái)</option>
                      <option value="MYR">MYR (Ringgit Malaysia)</option>
                      <option value="IDR">IDR (Rupiah Indonesia)</option>
                      <option value="PHP">PHP (Peso Philippines)</option>
                      <option value="INR">INR (Rupee Ấn Độ)</option>
                      <option value="AUD">AUD (Đô la Úc)</option>
                      <option value="CAD">CAD (Đô la Canada)</option>
                      <option value="CHF">CHF (Franc Thụy Sĩ)</option>
                    </select>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 Gợi ý</h4>
                    <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                      <li>• Múi giờ sẽ ảnh hưởng đến thời gian hiển thị</li>
                      <li>• Định dạng ngày sẽ áp dụng cho tất cả báo cáo</li>
                      <li>• Tiền tệ sẽ được sử dụng cho tất cả số liệu</li>
                      <li>• Cài đặt sẽ được lưu tự động</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Settings */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">📊</span>
                Cài đặt Dashboard
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">🔄 Tần suất cập nhật (giây)</label>
                    <input
                      type="number"
                      min="10"
                      max="300"
                      value={settings.dashboardSettings.refreshInterval}
                      onChange={(e) => handleSettingChange('dashboardSettings', 'refreshInterval', parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white"
                      placeholder="30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">📅 Khoảng thời gian mặc định</label>
                    <select
                      value={settings.dashboardSettings.defaultTimeRange}
                      onChange={(e) => handleSettingChange('dashboardSettings', 'defaultTimeRange', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white"
                    >
                      <option value="week">Tuần</option>
                      <option value="month">Tháng</option>
                      <option value="quarter">Quý</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">🏢 Chi nhánh mặc định</label>
                    <select
                      value={settings.dashboardSettings.defaultBranch}
                      onChange={(e) => handleSettingChange('dashboardSettings', 'defaultBranch', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white"
                    >
                      <option value="all">Tất cả</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">🔔 Thông báo</label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.dashboardSettings.showNotifications}
                          onChange={(e) => handleSettingChange('dashboardSettings', 'showNotifications', e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Hiển thị thông báo</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.dashboardSettings.autoExport}
                          onChange={(e) => handleSettingChange('dashboardSettings', 'autoExport', e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Tự động xuất báo cáo</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

                     {/* Alert Settings */}
           {activeTab === 'alerts' && (
             <div>
               <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                 <span className="mr-3">🔔</span>
                 Cài đặt Cảnh báo
               </h2>
               
               {/* Hệ thống cảnh báo cơ bản */}
               <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-700">
                 <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-4 flex items-center">
                   <span className="mr-2">🚨</span>
                   Hệ thống cảnh báo
                 </h3>
                 <div className="space-y-3">
                   <label className="flex items-center space-x-3">
                     <input
                       type="checkbox"
                       checked={settings.alertSettings.alertsEnabled}
                       onChange={(e) => handleSettingChange('alertSettings', 'alertsEnabled', e.target.checked)}
                       className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                     />
                     <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Bật hệ thống cảnh báo</span>
                   </label>
                 </div>
               </div>

               {settings.alertSettings.alertsEnabled && (
                 <div className="space-y-8">
                   {/* Ngưỡng cảnh báo */}
                   <div>
                     <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                       <span className="mr-2">📊</span>
                       Ngưỡng cảnh báo
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       <div className="space-y-2">
                         <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">💰 Doanh thu (VND)</label>
                         <input
                           type="number"
                           min="0"
                           step="1000000"
                           value={settings.alertSettings.revenueThreshold}
                           onChange={(e) => handleSettingChange('alertSettings', 'revenueThreshold', parseInt(e.target.value))}
                           className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:text-white"
                           placeholder="1000000"
                         />
                       </div>

                       <div className="space-y-2">
                         <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">📈 ROI (%)</label>
                         <input
                           type="number"
                           min="0"
                           step="0.1"
                           value={settings.alertSettings.roiThreshold}
                           onChange={(e) => handleSettingChange('alertSettings', 'roiThreshold', parseFloat(e.target.value))}
                           className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:text-white"
                           placeholder="5.0"
                         />
                       </div>

                       <div className="space-y-2">
                         <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">💵 Lợi nhuận (VND)</label>
                         <input
                           type="number"
                           min="0"
                           step="100000"
                           value={settings.alertSettings.profitThreshold}
                           onChange={(e) => handleSettingChange('alertSettings', 'profitThreshold', parseInt(e.target.value))}
                           className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:text-white"
                           placeholder="100000"
                         />
                       </div>

                       <div className="space-y-2">
                         <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">📉 Tăng trưởng (%)</label>
                         <input
                           type="number"
                           step="1"
                           value={settings.alertSettings.growthThreshold}
                           onChange={(e) => handleSettingChange('alertSettings', 'growthThreshold', parseFloat(e.target.value))}
                           className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:text-white"
                           placeholder="-10"
                         />
                         <p className="text-xs text-gray-500 dark:text-gray-400">Giá trị âm = cảnh báo khi giảm</p>
                       </div>

                       <div className="space-y-2">
                         <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">📺 Chi phí QC (%)</label>
                         <input
                           type="number"
                           min="0"
                           max="100"
                           step="1"
                           value={settings.alertSettings.adCostThreshold}
                           onChange={(e) => handleSettingChange('alertSettings', 'adCostThreshold', parseFloat(e.target.value))}
                           className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:text-white"
                           placeholder="30"
                         />
                         <p className="text-xs text-gray-500 dark:text-gray-400">% trên doanh thu</p>
                       </div>
                     </div>
                   </div>

                   {/* Loại cảnh báo */}
                   <div>
                     <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                       <span className="mr-2">🎯</span>
                       Loại cảnh báo
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       <label className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                         <input
                           type="checkbox"
                           checked={settings.alertSettings.enableRevenueAlerts}
                           onChange={(e) => handleSettingChange('alertSettings', 'enableRevenueAlerts', e.target.checked)}
                           className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                         />
                         <span className="text-sm text-gray-700 dark:text-gray-300">💰 Doanh thu</span>
                       </label>

                       <label className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                         <input
                           type="checkbox"
                           checked={settings.alertSettings.enableROIAlerts}
                           onChange={(e) => handleSettingChange('alertSettings', 'enableROIAlerts', e.target.checked)}
                           className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                         />
                         <span className="text-sm text-gray-700 dark:text-gray-300">📈 ROI</span>
                       </label>

                       <label className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                         <input
                           type="checkbox"
                           checked={settings.alertSettings.enableProfitAlerts}
                           onChange={(e) => handleSettingChange('alertSettings', 'enableProfitAlerts', e.target.checked)}
                           className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                         />
                         <span className="text-sm text-gray-700 dark:text-gray-300">💵 Lợi nhuận</span>
                       </label>

                       <label className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                         <input
                           type="checkbox"
                           checked={settings.alertSettings.enableGrowthAlerts}
                           onChange={(e) => handleSettingChange('alertSettings', 'enableGrowthAlerts', e.target.checked)}
                           className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                         />
                         <span className="text-sm text-gray-700 dark:text-gray-300">📉 Tăng trưởng</span>
                       </label>

                       <label className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                         <input
                           type="checkbox"
                           checked={settings.alertSettings.enableAdCostAlerts}
                           onChange={(e) => handleSettingChange('alertSettings', 'enableAdCostAlerts', e.target.checked)}
                           className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                         />
                         <span className="text-sm text-gray-700 dark:text-gray-300">📺 Chi phí QC</span>
                       </label>

                       <label className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                         <input
                           type="checkbox"
                           checked={settings.alertSettings.enableBranchAlerts}
                           onChange={(e) => handleSettingChange('alertSettings', 'enableBranchAlerts', e.target.checked)}
                           className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                         />
                         <span className="text-sm text-gray-700 dark:text-gray-300">🏢 Chi nhánh</span>
                       </label>

                       <label className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                         <input
                           type="checkbox"
                           checked={settings.alertSettings.enableVariationAlerts}
                           onChange={(e) => handleSettingChange('alertSettings', 'enableVariationAlerts', e.target.checked)}
                           className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                         />
                         <span className="text-sm text-gray-700 dark:text-gray-300">📊 Biến động</span>
                       </label>
                     </div>
                   </div>

                   {/* Mức độ nghiêm trọng */}
                   <div>
                     <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                       <span className="mr-2">⚠️</span>
                       Mức độ nghiêm trọng
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <label className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                           <input
                             type="checkbox"
                             checked={settings.alertSettings.severityLevels?.low ?? true}
                             onChange={(e) => handleSettingChange('alertSettings', 'severityLevels', { 
                               ...settings.alertSettings.severityLevels, 
                               low: e.target.checked 
                             })}
                             className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                           />
                           <span className="text-sm text-green-700 dark:text-green-300">🟢 Thấp</span>
                         </label>

                                                <label className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                           <input
                             type="checkbox"
                             checked={settings.alertSettings.severityLevels?.medium ?? true}
                             onChange={(e) => handleSettingChange('alertSettings', 'severityLevels', { 
                               ...settings.alertSettings.severityLevels, 
                               medium: e.target.checked 
                             })}
                             className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                           />
                           <span className="text-sm text-yellow-700 dark:text-yellow-300">🟡 Trung bình</span>
                         </label>

                                                <label className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                           <input
                             type="checkbox"
                             checked={settings.alertSettings.severityLevels?.high ?? true}
                             onChange={(e) => handleSettingChange('alertSettings', 'severityLevels', { 
                               ...settings.alertSettings.severityLevels, 
                               high: e.target.checked 
                             })}
                             className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                           />
                           <span className="text-sm text-orange-700 dark:text-orange-300">🟠 Cao</span>
                         </label>

                                                <label className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                           <input
                             type="checkbox"
                             checked={settings.alertSettings.severityLevels?.critical ?? true}
                             onChange={(e) => handleSettingChange('alertSettings', 'severityLevels', { 
                               ...settings.alertSettings.severityLevels, 
                               critical: e.target.checked 
                             })}
                             className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                           />
                           <span className="text-sm text-red-700 dark:text-red-300">🔴 Nghiêm trọng</span>
                         </label>
                     </div>
                   </div>

                   {/* Thông báo */}
                   <div>
                     <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                       <span className="mr-2">📧</span>
                       Thông báo
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       <label className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                         <input
                           type="checkbox"
                           checked={settings.alertSettings.emailNotifications}
                           onChange={(e) => handleSettingChange('alertSettings', 'emailNotifications', e.target.checked)}
                           className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                         />
                         <span className="text-sm text-gray-700 dark:text-gray-300">📧 Email</span>
                       </label>

                       <label className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                         <input
                           type="checkbox"
                           checked={settings.alertSettings.pushNotifications}
                           onChange={(e) => handleSettingChange('alertSettings', 'pushNotifications', e.target.checked)}
                           className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                         />
                         <span className="text-sm text-gray-700 dark:text-gray-300">📱 Push</span>
                       </label>

                       <label className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                         <input
                           type="checkbox"
                           checked={settings.alertSettings.inAppNotifications}
                           onChange={(e) => handleSettingChange('alertSettings', 'inAppNotifications', e.target.checked)}
                           className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                         />
                         <span className="text-sm text-gray-700 dark:text-gray-300">💬 Trong app</span>
                       </label>

                       <label className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                         <input
                           type="checkbox"
                           checked={settings.alertSettings.alertSound}
                           onChange={(e) => handleSettingChange('alertSettings', 'alertSound', e.target.checked)}
                           className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                         />
                         <span className="text-sm text-gray-700 dark:text-gray-300">🔊 Âm thanh</span>
                       </label>

                       <label className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                         <input
                           type="checkbox"
                           checked={settings.alertSettings.alertVibration}
                           onChange={(e) => handleSettingChange('alertSettings', 'alertVibration', e.target.checked)}
                           className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                         />
                         <span className="text-sm text-gray-700 dark:text-gray-300">📳 Rung</span>
                       </label>
                     </div>
                   </div>

                   {/* Tần suất và nâng cao */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                       <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                         <span className="mr-2">⏰</span>
                         Tần suất
                       </h3>
                       <div className="space-y-4">
                         <div className="space-y-2">
                           <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Tần suất cảnh báo</label>
                           <select
                             value={settings.alertSettings.alertFrequency}
                             onChange={(e) => handleSettingChange('alertSettings', 'alertFrequency', e.target.value)}
                             className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:text-white"
                           >
                             <option value="realtime">Thời gian thực</option>
                             <option value="hourly">Hàng giờ</option>
                             <option value="daily">Hàng ngày</option>
                             <option value="weekly">Hàng tuần</option>
                           </select>
                         </div>

                         <div className="space-y-2">
                           <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Tự động kiểm tra (phút)</label>
                           <input
                             type="number"
                             min="1"
                             max="60"
                             value={settings.alertSettings.autoCheckInterval}
                             onChange={(e) => handleSettingChange('alertSettings', 'autoCheckInterval', parseInt(e.target.value))}
                             className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:text-white"
                           />
                         </div>

                         <div className="space-y-2">
                           <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Lưu lịch sử (ngày)</label>
                           <input
                             type="number"
                             min="1"
                             max="365"
                             value={settings.alertSettings.alertHistoryRetention}
                             onChange={(e) => handleSettingChange('alertSettings', 'alertHistoryRetention', parseInt(e.target.value))}
                             className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:text-white"
                           />
                         </div>
                       </div>
                     </div>

                     <div>
                       <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                         <span className="mr-2">⚙️</span>
                         Tùy chỉnh
                       </h3>
                       <div className="space-y-4">
                         <label className="flex items-center space-x-3">
                           <input
                             type="checkbox"
                             checked={settings.alertSettings.customAlertMessages}
                             onChange={(e) => handleSettingChange('alertSettings', 'customAlertMessages', e.target.checked)}
                             className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                           />
                           <span className="text-sm text-gray-700 dark:text-gray-300">Tùy chỉnh tin nhắn cảnh báo</span>
                         </label>

                         <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                           <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 Gợi ý</h4>
                           <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                             <li>• Ngưỡng doanh thu: Cảnh báo khi dưới mức</li>
                             <li>• ROI: Cảnh báo khi thấp hơn mục tiêu</li>
                             <li>• Tăng trưởng: Giá trị âm = cảnh báo giảm</li>
                             <li>• Chi phí QC: % trên doanh thu</li>
                             <li>• Tự động kiểm tra: 5-15 phút là phù hợp</li>
                           </ul>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               )}
             </div>
           )}

          {/* Export Settings */}
          {activeTab === 'export' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">📤</span>
                Cài đặt Xuất báo cáo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">📄 Định dạng mặc định</label>
                    <select
                      value={settings.exportSettings.defaultFormat}
                      onChange={(e) => handleSettingChange('exportSettings', 'defaultFormat', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
                    >
                      <option value="png">PNG (Hình ảnh)</option>
                      <option value="pdf">PDF (Tài liệu)</option>
                      <option value="excel">Excel (Bảng tính)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">🎨 Chất lượng</label>
                    <select
                      value={settings.exportSettings.quality}
                      onChange={(e) => handleSettingChange('exportSettings', 'quality', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
                    >
                      <option value="low">Thấp (Nhanh)</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao (Chậm)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">📁 Mẫu tên file</label>
                    <input
                      type="text"
                      value={settings.exportSettings.fileNameTemplate}
                      onChange={(e) => handleSettingChange('exportSettings', 'fileNameTemplate', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
                      placeholder="bao-cao-{date}-{time}-{type}"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sử dụng: {'{date}'}, {'{time}'}, {'{type}'} để tùy chỉnh</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">🗜️ Mức độ nén (%)</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={settings.exportSettings.compressionLevel}
                      onChange={(e) => handleSettingChange('exportSettings', 'compressionLevel', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Nhỏ (10%)</span>
                      <span>{settings.exportSettings.compressionLevel}%</span>
                      <span>Lớn (100%)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">📊 Nội dung xuất</label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.exportSettings.includeCharts}
                          onChange={(e) => handleSettingChange('exportSettings', 'includeCharts', e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Bao gồm biểu đồ</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.exportSettings.includeInsights}
                          onChange={(e) => handleSettingChange('exportSettings', 'includeInsights', e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Bao gồm AI insights</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.exportSettings.watermark}
                          onChange={(e) => handleSettingChange('exportSettings', 'watermark', e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Thêm watermark</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.exportSettings.autoSave}
                          onChange={(e) => handleSettingChange('exportSettings', 'autoSave', e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Tự động lưu</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">💡 Gợi ý</h4>
                    <ul className="text-purple-700 dark:text-purple-300 text-sm space-y-1">
                      <li>• PNG: Tốt cho chia sẻ nhanh</li>
                      <li>• PDF: Tốt cho báo cáo chính thức</li>
                      <li>• Excel: Tốt cho phân tích dữ liệu</li>
                      <li>• Chất lượng cao = File lớn hơn</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
