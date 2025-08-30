'use client';

import React from 'react';
import DetailedReports from '@/components/DetailedReports';

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            📋 Báo cáo Chi tiết
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Báo cáo phân tích chi tiết và xuất dữ liệu
          </p>
        </div>

        <DetailedReports />
      </div>
    </div>
  );
}
