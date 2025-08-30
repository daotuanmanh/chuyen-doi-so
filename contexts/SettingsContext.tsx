'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSystemTimezone, isValidTimezone } from '@/utils/dateTimeUtils';

export interface SettingsData {
  userPreferences: {
    theme: string;
    language: string;
    timezone: string;
    currency: string;
    dateFormat: string;
  };
  dashboardSettings: {
    refreshInterval: number;
    defaultTimeRange: string;
    defaultBranch: string;
    showNotifications: boolean;
    autoExport: boolean;
  };
  alertSettings: {
    // Cơ bản
    alertsEnabled: boolean; // Tắt/bật toàn bộ hệ thống cảnh báo
    
    // Ngưỡng cảnh báo
    revenueThreshold: number; // Ngưỡng doanh thu
    roiThreshold: number; // Ngưỡng ROI
    profitThreshold: number; // Ngưỡng lợi nhuận
    growthThreshold: number; // Ngưỡng tăng trưởng
    adCostThreshold: number; // Ngưỡng chi phí quảng cáo (% doanh thu)
    
    // Điều kiện cảnh báo
    enableRevenueAlerts: boolean; // Bật cảnh báo doanh thu
    enableROIAlerts: boolean; // Bật cảnh báo ROI
    enableProfitAlerts: boolean; // Bật cảnh báo lợi nhuận
    enableGrowthAlerts: boolean; // Bật cảnh báo tăng trưởng
    enableAdCostAlerts: boolean; // Bật cảnh báo chi phí quảng cáo
    enableBranchAlerts: boolean; // Bật cảnh báo chi nhánh
    enableVariationAlerts: boolean; // Bật cảnh báo biến động
    
    // Thông báo
    emailNotifications: boolean;
    pushNotifications: boolean;
    inAppNotifications: boolean; // Thông báo trong ứng dụng
    
    // Tần suất
    alertFrequency: string; // realtime, hourly, daily, weekly
    
    // Nâng cao
    autoCheckInterval: number; // Tự động kiểm tra mỗi X phút
    alertHistoryRetention: number; // Lưu lịch sử cảnh báo X ngày
    severityLevels: {
      low: boolean;
      medium: boolean;
      high: boolean;
      critical: boolean;
    };
    
    // Tùy chỉnh
    customAlertMessages: boolean; // Cho phép tùy chỉnh tin nhắn
    alertSound: boolean; // Phát âm thanh khi có cảnh báo
    alertVibration: boolean; // Rung khi có cảnh báo (mobile)
  };
  exportSettings: {
    defaultFormat: string;
    includeCharts: boolean;
    includeInsights: boolean;
    watermark: boolean;
    quality: string;
    autoSave: boolean;
    fileNameTemplate: string;
    compressionLevel: number;
  };
}

interface SettingsContextType {
  settings: SettingsData;
  updateSettings: (category: keyof SettingsData, key: string, value: any) => void;
  saveSettings: () => Promise<void>;
  resetSettings: () => void;
  loading: boolean;
  currentTheme: string;
}

const defaultSettings: SettingsData = {
  userPreferences: {
    theme: 'light',
    language: 'vi',
    timezone: getSystemTimezone(),
    currency: 'VND',
    dateFormat: 'DD/MM/YYYY'
  },
  dashboardSettings: {
    refreshInterval: 30,
    defaultTimeRange: 'quarter',
    defaultBranch: 'all',
    showNotifications: true,
    autoExport: false
  },
  alertSettings: {
    // Cơ bản
    alertsEnabled: true, // Mặc định bật cảnh báo
    
    // Ngưỡng cảnh báo
    revenueThreshold: 1000000, // 1 triệu VND
    roiThreshold: 5.0, // 5%
    profitThreshold: 100000, // 100k VND
    growthThreshold: -10, // -10% (tăng trưởng âm)
    adCostThreshold: 30, // 30% doanh thu
    
    // Điều kiện cảnh báo
    enableRevenueAlerts: true,
    enableROIAlerts: true,
    enableProfitAlerts: true,
    enableGrowthAlerts: true,
    enableAdCostAlerts: true,
    enableBranchAlerts: true,
    enableVariationAlerts: true,
    
    // Thông báo
    emailNotifications: true,
    pushNotifications: false,
    inAppNotifications: true,
    
    // Tần suất
    alertFrequency: 'realtime',
    
    // Nâng cao
    autoCheckInterval: 5, // 5 phút
    alertHistoryRetention: 30, // 30 ngày
    severityLevels: {
      low: true,
      medium: true,
      high: true,
      critical: true,
    },
    
    // Tùy chỉnh
    customAlertMessages: false,
    alertSound: true,
    alertVibration: false,
  },
  exportSettings: {
    defaultFormat: 'png',
    includeCharts: true,
    includeInsights: true,
    watermark: false,
    quality: 'high',
    autoSave: false,
    fileNameTemplate: 'bao-cao-{date}-{time}-{type}',
    compressionLevel: 80
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');

  // Function to apply theme
  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      setCurrentTheme('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      setCurrentTheme('light');
    } else if (theme === 'auto') {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.add('dark');
        setCurrentTheme('dark');
      } else {
        root.classList.remove('dark');
        setCurrentTheme('light');
      }
    }
  };

  // Function to get system theme preference
  const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('dashboard-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        
        // Deep merge để đảm bảo tất cả nested objects được merge đúng cách
        const mergedSettings = {
          ...defaultSettings,
          ...parsedSettings,
          alertSettings: {
            ...defaultSettings.alertSettings,
            ...parsedSettings.alertSettings,
            severityLevels: {
              ...defaultSettings.alertSettings.severityLevels,
              ...(parsedSettings.alertSettings?.severityLevels || {})
            }
          }
        };
        
        setSettings(mergedSettings);
        
        // Apply theme immediately
        applyTheme(mergedSettings.userPreferences.theme);
      } catch (error) {
        console.error('Error loading settings:', error);
        setSettings(defaultSettings);
        applyTheme(defaultSettings.userPreferences.theme);
      }
    } else {
      setSettings(defaultSettings);
      applyTheme(defaultSettings.userPreferences.theme);
    }
  }, []);

  // Listen for system theme changes when auto mode is enabled
  useEffect(() => {
    if (settings.userPreferences.theme === 'auto' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme('auto');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.userPreferences.theme]);

  const updateSettings = (category: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      };

      // Apply theme immediately if theme is changed
      if (category === 'userPreferences' && key === 'theme') {
        applyTheme(value);
      }

      return newSettings;
    });
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('dashboard-settings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('dashboard-settings');
    applyTheme(defaultSettings.userPreferences.theme);
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      saveSettings,
      resetSettings,
      loading,
      currentTheme
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
