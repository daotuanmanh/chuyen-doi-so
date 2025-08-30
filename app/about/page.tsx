'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('about');

  const tabs = [
    { id: 'about', name: 'Giới thiệu', icon: '📖' },
    { id: 'privacy', name: 'Chính sách Bảo mật', icon: '🔒' },
    { id: 'terms', name: 'Điều khoản Sử dụng', icon: '📋' },
    { id: 'data', name: 'Chính sách Dữ liệu', icon: '📊' },
    { id: 'alerts', name: 'Chính sách Cảnh báo', icon: '🚨' },
    { id: 'support', name: 'Hỗ trợ & Liên hệ', icon: '💬' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            📖 Giới thiệu & Chính sách
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Thông tin về hệ thống và các chính sách sử dụng
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 mb-8 border border-white/20 dark:border-gray-700/20">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/20">
          {/* About Content */}
          {activeTab === 'about' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">📊</span>
                Về Hệ thống Dashboard
              </h2>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Hệ thống phân tích doanh thu thông minh với AI, giúp doanh nghiệp theo dõi hiệu quả kinh doanh và đưa ra quyết định chiến lược
              </p>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                {/* Tính năng chính */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                    <span className="mr-3">🚀</span>
                    Tính năng chính
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">📈</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Dashboard Tương tác</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          Biểu đồ trực quan với nhiều loại chart: Bar, Line, Pie, Radar, Area. Hỗ trợ responsive và tương tác real-time.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">🤖</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">AI Phân tích</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          Phân tích dữ liệu thông minh, đưa ra insights, đề xuất chiến lược và cảnh báo rủi ro tự động.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">🚨</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Hệ thống Cảnh báo</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          Cảnh báo thông minh dựa trên ngưỡng ROI, doanh thu, tăng trưởng. Hỗ trợ email, push notification.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">📊</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Báo cáo Tĩnh</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          Xuất báo cáo dạng ảnh, PDF, Excel với matplotlib. Tùy chỉnh format và layout theo nhu cầu.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">⚙️</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Cài đặt Linh hoạt</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          Tùy chỉnh dashboard, cảnh báo, export format. Lưu trữ cài đặt trong localStorage.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Công nghệ sử dụng */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                    <span className="mr-3">🛠️</span>
                    Công nghệ
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">⚛️</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Frontend</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          Next.js 14, React 18, TypeScript, TailwindCSS. Hỗ trợ SSR và tối ưu performance.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">📊</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Biểu đồ</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          Recharts cho biểu đồ tương tác, Matplotlib cho báo cáo tĩnh. Hỗ trợ nhiều loại chart.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">🎨</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">UI/UX</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          Thiết kế responsive, dark mode, gradient effects. Toast notifications và loading states.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">🔧</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Backend</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          API Routes của Next.js, xử lý dữ liệu thông minh, tích hợp AI analytics.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">💾</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Lưu trữ</h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          LocalStorage cho cài đặt người dùng, Context API cho state management.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Giải thích các thuật ngữ */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                  <span className="mr-3">📚</span>
                  Giải thích Thuật ngữ
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-3">💰 ROI (Return on Investment)</h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Tỷ lệ hoàn vốn đầu tư, tính bằng phần trăm. Cho biết hiệu quả của việc đầu tư quảng cáo. 
                        ROI = (Lợi nhuận - Chi phí) / Chi phí × 100%
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-3">📈 Tăng trưởng (Growth)</h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Tỷ lệ tăng trưởng doanh thu so với kỳ trước. Thể hiện xu hướng phát triển của chi nhánh hoặc kênh.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-3">🎯 Hiệu suất (Performance)</h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Tỷ lệ phần trăm đóng góp vào tổng doanh thu. Cho thấy tầm quan trọng của từng chi nhánh/kênh.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold text-orange-600 dark:text-orange-400 mb-3">💸 Chi phí Quảng cáo</h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Tổng chi phí đầu tư vào quảng cáo, marketing. Bao gồm chi phí chạy ads, content, tools.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-3">🚨 Cảnh báo (Alerts)</h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Hệ thống thông báo tự động khi các chỉ số vượt ngưỡng. Phân loại theo mức độ: Critical, High, Medium, Low.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-3">🤖 AI Insights</h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Phân tích thông minh từ AI, đưa ra insights, đề xuất chiến lược và dự báo xu hướng.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Policy */}
          {activeTab === 'privacy' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">🔒</span>
                Chính sách Bảo mật
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">1. Thông tin thu thập</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Hệ thống chỉ lưu trữ cài đặt người dùng trong localStorage của trình duyệt. 
                    Không thu thập thông tin cá nhân, không sử dụng cookies tracking.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">2. Bảo mật dữ liệu</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Dữ liệu được lưu trữ cục bộ trên thiết bị của bạn. Không có server lưu trữ dữ liệu cá nhân.
                    Mọi thông tin đều được mã hóa và bảo vệ theo tiêu chuẩn bảo mật.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">3. Quyền truy cập</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Bạn có quyền xóa toàn bộ dữ liệu bằng cách clear localStorage. 
                    Hệ thống không yêu cầu đăng nhập hay cung cấp thông tin cá nhân.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Terms of Service */}
          {activeTab === 'terms' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">📋</span>
                Điều khoản Sử dụng
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">1. Mục đích sử dụng</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Hệ thống được thiết kế để phân tích dữ liệu doanh thu và hỗ trợ ra quyết định kinh doanh.
                    Chỉ sử dụng cho mục đích hợp pháp và không vi phạm quyền sở hữu trí tuệ.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">2. Trách nhiệm người dùng</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Người dùng chịu trách nhiệm về tính chính xác của dữ liệu nhập vào hệ thống.
                    Không sử dụng hệ thống để phân tích dữ liệu bất hợp pháp hoặc vi phạm quyền riêng tư.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">3. Giới hạn trách nhiệm</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Hệ thống cung cấp công cụ phân tích, không đảm bảo kết quả chính xác 100%.
                    Người dùng nên tham khảo thêm các nguồn thông tin khác để ra quyết định.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">4. Cập nhật điều khoản</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Chúng tôi có quyền cập nhật điều khoản sử dụng. Thay đổi sẽ được thông báo trên trang web.
                    Việc tiếp tục sử dụng sau khi cập nhật đồng nghĩa với việc chấp nhận điều khoản mới.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Data Policy */}
          {activeTab === 'data' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">📊</span>
                Chính sách Dữ liệu
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">1. Loại dữ liệu xử lý</h3>
                  <ul className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-2">
                    <li>• Dữ liệu doanh thu và chi phí quảng cáo</li>
                    <li>• Chỉ số ROI, tăng trưởng, hiệu suất</li>
                    <li>• Cài đặt người dùng (dashboard, cảnh báo, export)</li>
                    <li>• Dữ liệu phân tích theo chi nhánh và kênh</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">2. Xử lý dữ liệu</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Dữ liệu được xử lý cục bộ trên trình duyệt. AI phân tích được thực hiện real-time.
                    Không có dữ liệu nào được gửi đến server bên ngoài.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">3. Lưu trữ dữ liệu</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Dữ liệu được lưu trong localStorage của trình duyệt. Tự động xóa khi clear browser data.
                    Không có backup tự động, người dùng cần tự sao lưu nếu cần.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">4. Xuất dữ liệu</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Hỗ trợ xuất báo cáo dạng ảnh, PDF, Excel. Dữ liệu xuất chỉ chứa thông tin phân tích,
                    không bao gồm thông tin cá nhân hay dữ liệu nhạy cảm.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Alert Policy */}
          {activeTab === 'alerts' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">🚨</span>
                Chính sách Cảnh báo
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">1. Loại cảnh báo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Critical</h4>
                                             <p className="text-red-700 dark:text-red-300 text-sm">ROI &lt; 50%, tăng trưởng âm &gt; 20%</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">High</h4>
                                             <p className="text-orange-700 dark:text-orange-300 text-sm">ROI &lt; 100%, tăng trưởng âm &gt; 10%</p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Medium</h4>
                                             <p className="text-yellow-700 dark:text-yellow-300 text-sm">ROI &lt; 150%, hiệu suất &lt; 15%</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Low</h4>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">Cảnh báo thông tin, không khẩn cấp</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">2. Tùy chỉnh cảnh báo</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Người dùng có thể tùy chỉnh ngưỡng cảnh báo trong cài đặt. Hỗ trợ bật/tắt từng loại cảnh báo.
                    Có thể tùy chỉnh thời gian hiển thị toast notification.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">3. Thông báo</h3>
                  <ul className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-2">
                    <li>• Toast notification trên giao diện</li>
                    <li>• Email notification (nếu bật)</li>
                    <li>• Push notification (nếu bật)</li>
                    <li>• Âm thanh và rung (nếu bật)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">4. Quản lý cảnh báo</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Có thể xem chi tiết, xóa từng cảnh báo hoặc xóa tất cả. Cảnh báo tự động xóa khi tắt hệ thống.
                    Lịch sử cảnh báo không được lưu trữ lâu dài.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Support & Contact */}
          {activeTab === 'support' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <span className="mr-3">💬</span>
                Hỗ trợ & Liên hệ
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">1. Hướng dẫn sử dụng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📊 Dashboard</h4>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">Sử dụng filters để lọc dữ liệu theo thời gian, chi nhánh</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">⚙️ Cài đặt</h4>
                      <p className="text-green-700 dark:text-green-300 text-sm">Tùy chỉnh dashboard, cảnh báo, export format</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🚨 Cảnh báo</h4>
                      <p className="text-purple-700 dark:text-purple-300 text-sm">Bật/tắt hệ thống cảnh báo và tùy chỉnh ngưỡng</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">📸 Xuất báo cáo</h4>
                      <p className="text-orange-700 dark:text-orange-300 text-sm">Xuất dashboard dạng ảnh, PDF, Excel</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">2. Xử lý sự cố</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">Dữ liệu không hiển thị</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Kiểm tra kết nối internet, refresh trang</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">Cảnh báo không hoạt động</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Kiểm tra cài đặt cảnh báo trong Settings</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">Xuất báo cáo lỗi</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Thử lại sau vài giây, kiểm tra quyền trình duyệt</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">3. Thông tin liên hệ</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Đây là hệ thống demo, không có hỗ trợ kỹ thuật chính thức. 
                    Để báo cáo lỗi hoặc đề xuất tính năng, vui lòng liên hệ qua GitHub repository.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">4. Cập nhật hệ thống</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Hệ thống được cập nhật thường xuyên với các tính năng mới và cải tiến.
                    Khuyến nghị sử dụng trình duyệt hiện đại để có trải nghiệm tốt nhất.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="text-center mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
            >
              <span className="mr-2">📊</span>
              Khám phá Dashboard
            </Link>
            
            <Link 
              href="/settings"
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
            >
              <span className="mr-2">⚙️</span>
              Cài đặt
            </Link>
          </div>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Hệ thống được phát triển với mục tiêu hỗ trợ doanh nghiệp tối ưu hóa hiệu quả kinh doanh
          </p>
        </div>
      </div>
    </div>
  );
}
