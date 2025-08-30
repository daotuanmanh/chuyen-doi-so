'use client';

import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function ThemeToggle() {
  const { settings, updateSettings, currentTheme } = useSettings();

  const toggleTheme = () => {
    const currentThemeSetting = settings.userPreferences.theme;
    let newTheme = 'light';
    
    if (currentThemeSetting === 'light') {
      newTheme = 'dark';
    } else if (currentThemeSetting === 'dark') {
      newTheme = 'auto';
    } else {
      newTheme = 'light';
    }
    
    updateSettings('userPreferences', 'theme', newTheme);
  };

  const getThemeIcon = () => {
    if (settings.userPreferences.theme === 'auto') {
      return currentTheme === 'dark' ? '🌙' : '☀️';
    }
    return settings.userPreferences.theme === 'dark' ? '🌙' : '☀️';
  };

  const getThemeLabel = () => {
    if (settings.userPreferences.theme === 'auto') {
      return currentTheme === 'dark' ? 'Tối (Tự động)' : 'Sáng (Tự động)';
    }
    return settings.userPreferences.theme === 'dark' ? 'Tối' : 'Sáng';
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200"
      title={`Chuyển đổi theme (Hiện tại: ${getThemeLabel()})`}
    >
      <span className="text-lg">{getThemeIcon()}</span>
      <span className="text-sm font-medium hidden sm:inline">{getThemeLabel()}</span>
    </button>
  );
}
