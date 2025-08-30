'use client';

import React from 'react';
import Settings from '@/components/Settings';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            ⚙️ Cài đặt Hệ thống
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Tùy chỉnh dashboard, cảnh báo và cấu hình xuất báo cáo
          </p>
        </div>
        
        <Settings />
      </div>
    </div>
  );
}
