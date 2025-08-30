'use client';

import React from 'react';
import SalesDashboard from '@/components/SalesDashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SalesDashboard />
    </div>
  );
}
