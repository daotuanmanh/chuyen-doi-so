import { NextRequest, NextResponse } from 'next/server';
import { ExcelAnalyzer } from '@/utils/excel-analyzer';
import Groq from 'groq-sdk';
import { cleanJsonResponse, safeParse } from '../../../utils/json-cleaner';
import { InsightsSchema, createFallbackInsights } from '../../../utils/insights-schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeType = searchParams.get('timeType'); // 'week', 'month', 'quarter'
    const timeValue = searchParams.get('timeValue'); // '1', 'Q1', '3'
    const branch = searchParams.get('branch'); // 'all', 'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'
    const year = searchParams.get('year') || '2025';

    const analyzer = new ExcelAnalyzer();
    await analyzer.loadSalesData();

    let filteredData = analyzer.getAllData();

    // Lọc theo thời gian
    if (timeType && timeValue) {
      switch (timeType) {
        case 'week':
          // Kiểm tra timeValue có phải là số không
          const weekNumber = parseInt(timeValue);
          if (isNaN(weekNumber)) {
            // Nếu không phải số (ví dụ: "Q1"), sử dụng tuần đầu tiên
            filteredData = filteredData.filter((item: any) => 
              item.week === 1 && item.year === parseInt(year)
            );
          } else {
            filteredData = filteredData.filter((item: any) => 
              item.week === weekNumber && item.year === parseInt(year)
            );
          }
          break;
        case 'quarter':
          filteredData = filteredData.filter((item: any) => 
            item.quarter === timeValue && item.year === parseInt(year)
          );
          break;
        case 'month':
          // Tính tháng từ tuần (xấp xỉ)
          const month = parseInt(timeValue);
          if (isNaN(month)) {
            // Nếu không phải số, sử dụng tháng đầu tiên
            const startWeek = 1;
            const endWeek = 4;
            filteredData = filteredData.filter((item: any) => 
              item.week >= startWeek && item.week <= endWeek && item.year === parseInt(year)
            );
          } else {
            const startWeek = (month - 1) * 4 + 1;
            const endWeek = month * 4;
            filteredData = filteredData.filter((item: any) => 
              item.week >= startWeek && item.week <= endWeek && item.year === parseInt(year)
            );
          }
          break;
      }
    }

    // Lọc theo chi nhánh
    if (branch && branch !== 'all') {
      filteredData = filteredData.filter((item: any) => item.branch === branch);
    }

    // Tính toán thống kê
    const totalRevenue = filteredData.reduce((sum: number, item: any) => sum + item.total_revenue, 0);
    const totalAdCost = filteredData.reduce((sum: number, item: any) => sum + item.ad_cost, 0);
    const avgROI = totalAdCost > 0 ? totalRevenue / totalAdCost : 0;

    // Phân tích theo chi nhánh
    const branchAnalysis: { [key: string]: any } = {};
    const branches = Array.from(new Set(filteredData.map((item: any) => item.branch)));
    
    branches.forEach(branchName => {
      const branchData = filteredData.filter((item: any) => item.branch === branchName);
      const branchRevenue = branchData.reduce((sum: number, item: any) => sum + item.total_revenue, 0);
      const branchAdCost = branchData.reduce((sum: number, item: any) => sum + item.ad_cost, 0);
      const branchROI = branchAdCost > 0 ? branchRevenue / branchAdCost : 0;
      
      // Nếu chỉ chọn 1 chi nhánh, percentage sẽ là 100%
      // Nếu chọn nhiều chi nhánh, tính percentage bình thường
      const percentage = branches.length === 1 ? 100 : (branchRevenue / totalRevenue) * 100;
      
      branchAnalysis[branchName] = {
        revenue: branchRevenue,
        adCost: branchAdCost,
        roi: branchROI,
        percentage: percentage
      };
    });

    // Phân tích theo kênh
    const channelAnalysis: { [key: string]: any } = {};
    const channels = Array.from(new Set(filteredData.map((item: any) => item.channel)));
    
    channels.forEach(channelName => {
      const channelData = filteredData.filter((item: any) => item.channel === channelName);
      const channelRevenue = channelData.reduce((sum: number, item: any) => sum + item.total_revenue, 0);
      const channelAdCost = channelData.reduce((sum: number, item: any) => sum + item.ad_cost, 0);
      const channelROI = channelAdCost > 0 ? channelRevenue / channelAdCost : 0;
      
      // Nếu chỉ chọn 1 kênh, percentage sẽ là 100%
      // Nếu chọn nhiều kênh, tính percentage bình thường
      const percentage = channels.length === 1 ? 100 : (channelRevenue / totalRevenue) * 100;
      
      channelAnalysis[channelName] = {
        revenue: channelRevenue,
        adCost: channelAdCost,
        roi: channelROI,
        percentage: percentage
      };
    });

    // Phân tích theo tuần (nếu có dữ liệu nhiều tuần)
    const weeklyAnalysis: { [key: number]: number } = {};
    const weeks = Array.from(new Set(filteredData.map((item: any) => item.week))).sort((a, b) => a - b);
    
    weeks.forEach(week => {
      const weekData = filteredData.filter((item: any) => item.week === week);
      const weekRevenue = weekData.reduce((sum: number, item: any) => sum + item.total_revenue, 0);
      weeklyAnalysis[week] = weekRevenue;
    });

    // Tạo AI insights
    const aiInsights = await generateAIInsights({
      totalRevenue,
      totalAdCost,
      avgROI,
      branchAnalysis,
      channelAnalysis,
      weeklyAnalysis,
      timeType,
      timeValue,
      branch,
      year
    });

    const response = {
      summary: {
        totalRevenue,
        totalAdCost,
        avgROI,
        totalRevenueFormatted: totalRevenue.toLocaleString('vi-VN'),
        totalAdCostFormatted: totalAdCost.toLocaleString('vi-VN'),
        avgROIFormatted: avgROI.toFixed(2)
      },
      branchAnalysis,
      channelAnalysis,
      weeklyAnalysis,
      aiInsights,
      filters: {
        timeType,
        timeValue,
        branch,
        year
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating dashboard data:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo dữ liệu dashboard' },
      { status: 500 }
    );
  }
}

async function generateGroqInsights(prompt: string): Promise<string> {
  try {
    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY) {
      console.log('Groq API key not found, using fallback analysis');
      return JSON.stringify({
        overview: "Phân tích dữ liệu chi nhánh",
        topPerformer: "Hiệu suất chi nhánh",
        recommendations: ["Cần cấu hình GROQ_API_KEY để sử dụng AI phân tích"],
        risks: ["Không thể phân tích AI do thiếu API key"],
        detailedAnalysis: ["Sử dụng phân tích cơ bản"],
        trends: "Xu hướng cần theo dõi"
      });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Bạn là chuyên gia phân tích kinh doanh cao cấp tại Việt Nam với 15+ năm kinh nghiệm. BẮT BUỘC chỉ sử dụng TIẾNG VIỆT trong toàn bộ phân tích. KHÔNG được dùng tiếng Anh.

YÊU CẦU PHÂN TÍCH:
- Phân tích sâu sắc, chi tiết và chuyên nghiệp
- Đưa ra nhận xét cụ thể với số liệu và dữ liệu thực tế
- Cảnh báo rủi ro dựa trên xu hướng thị trường và dữ liệu lịch sử
- Đề xuất hành động khả thi và có tính thực tiễn cao
- Sử dụng ngôn ngữ kinh doanh chuyên nghiệp

TRẢ VỀ JSON format chính xác:
{
  "overview": "Phân tích tổng quan chi tiết về tình hình kinh doanh, hiệu suất tổng thể, và xu hướng chính của doanh nghiệp trong giai đoạn này. Bao gồm đánh giá về doanh thu, lợi nhuận, ROI và so sánh với kỳ trước.",
  "topPerformer": "Phân tích chi tiết về chi nhánh/kênh bán hàng có hiệu suất tốt nhất, bao gồm lý do thành công, chiến lược hiệu quả, và bài học có thể áp dụng cho các chi nhánh khác.",
  "recommendations": [
    "Đề xuất chiến lược cụ thể với timeline và mục tiêu rõ ràng",
    "Đề xuất tối ưu hóa quy trình và cải thiện hiệu quả",
    "Đề xuất phát triển thị trường và mở rộng kinh doanh",
    "Đề xuất quản lý rủi ro và tài chính"
  ],
  "risks": [
    "Cảnh báo rủi ro thị trường với phân tích nguyên nhân và tác động",
    "Cảnh báo rủi ro tài chính và đề xuất biện pháp phòng ngừa",
    "Cảnh báo rủi ro cạnh tranh và chiến lược đối phó",
    "Cảnh báo rủi ro vận hành và quản lý"
  ],
  "detailedAnalysis": [
    "Phân tích chi tiết hiệu suất từng chi nhánh với số liệu cụ thể",
    "Phân tích xu hướng thị trường và tác động đến doanh nghiệp",
    "Phân tích hiệu quả các kênh bán hàng và marketing",
    "Phân tích cơ hội tăng trưởng và thách thức cần vượt qua"
  ],
  "trends": "Dự báo xu hướng thị trường trong 3-6 tháng tới, bao gồm cơ hội và thách thức, cùng với khuyến nghị chuẩn bị cho doanh nghiệp."
}

QUAN TRỌNG: 
- 100% nội dung phải bằng TIẾNG VIỆT
- Mỗi phần phải có ít nhất 50-100 từ
- Sử dụng ngôn ngữ kinh doanh chuyên nghiệp
- CHỈ trả về JSON hợp lệ, không có text khác
- Tránh lặp lại từ ngữ và cấu trúc câu`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.1,
      max_tokens: 1200, // Tăng token limit
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content || '{}';
    
    // Kiểm tra và làm sạch response
    if (response.includes('Nhó Nhó Nhó') || response.includes('fakihuyong') || response.includes('otecung')) {
      console.log('Detected repetitive text in AI response, using fallback');
      return JSON.stringify({
        overview: "Phân tích dữ liệu chi nhánh với hiệu suất kinh doanh",
        topPerformer: "Chi nhánh có hiệu suất tốt nhất trong hệ thống",
        recommendations: ["Tối ưu hóa chi phí quảng cáo", "Cải thiện hiệu quả kênh bán hàng", "Phát triển chiến lược mới"],
        risks: ["Theo dõi xu hướng thị trường", "Kiểm soát rủi ro tài chính", "Quản lý cạnh tranh"],
        detailedAnalysis: ["Phân tích hiệu quả chi nhánh", "Đánh giá kênh bán hàng", "Xem xét xu hướng tuần", "Tối ưu hóa ROI"],
        trends: "Xu hướng tăng trưởng ổn định với tiềm năng cải thiện"
      });
    }

    return response;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    
    // Handle specific Groq errors
    if (error && typeof error === 'object' && 'error' in error) {
      const groqError = error as any;
      if (groqError.error?.code === 'json_validate_failed') {
        console.log('JSON validation failed, trying without response_format...');
        
        // Try again without response_format as fallback
        try {
          const fallbackCompletion = await new Groq({
            apiKey: process.env.GROQ_API_KEY,
          }).chat.completions.create({
            messages: [
              {
                role: "system",
                content: `Bạn là chuyên gia phân tích kinh doanh cao cấp tại Việt Nam với 15+ năm kinh nghiệm. BẮT BUỘC chỉ sử dụng TIẾNG VIỆT trong toàn bộ phân tích. KHÔNG được dùng tiếng Anh.

YÊU CẦU PHÂN TÍCH:
- Phân tích sâu sắc, chi tiết và chuyên nghiệp
- Đưa ra nhận xét cụ thể với số liệu và dữ liệu thực tế
- Cảnh báo rủi ro dựa trên xu hướng thị trường và dữ liệu lịch sử
- Đề xuất hành động khả thi và có tính thực tiễn cao
- Sử dụng ngôn ngữ kinh doanh chuyên nghiệp

TRẢ VỀ JSON format chính xác:
{
  "overview": "Phân tích tổng quan chi tiết về tình hình kinh doanh, hiệu suất tổng thể, và xu hướng chính của doanh nghiệp trong giai đoạn này. Bao gồm đánh giá về doanh thu, lợi nhuận, ROI và so sánh với kỳ trước.",
  "topPerformer": "Phân tích chi tiết về chi nhánh/kênh bán hàng có hiệu suất tốt nhất, bao gồm lý do thành công, chiến lược hiệu quả, và bài học có thể áp dụng cho các chi nhánh khác.",
  "recommendations": [
    "Đề xuất chiến lược cụ thể với timeline và mục tiêu rõ ràng",
    "Đề xuất tối ưu hóa quy trình và cải thiện hiệu quả",
    "Đề xuất phát triển thị trường và mở rộng kinh doanh",
    "Đề xuất quản lý rủi ro và tài chính"
  ],
  "risks": [
    "Cảnh báo rủi ro thị trường với phân tích nguyên nhân và tác động",
    "Cảnh báo rủi ro tài chính và đề xuất biện pháp phòng ngừa",
    "Cảnh báo rủi ro cạnh tranh và chiến lược đối phó",
    "Cảnh báo rủi ro vận hành và quản lý"
  ],
  "detailedAnalysis": [
    "Phân tích chi tiết hiệu suất từng chi nhánh với số liệu cụ thể",
    "Phân tích xu hướng thị trường và tác động đến doanh nghiệp",
    "Phân tích hiệu quả các kênh bán hàng và marketing",
    "Phân tích cơ hội tăng trưởng và thách thức cần vượt qua"
  ],
  "trends": "Dự báo xu hướng thị trường trong 3-6 tháng tới, bao gồm cơ hội và thách thức, cùng với khuyến nghị chuẩn bị cho doanh nghiệp."
}

QUAN TRỌNG: 
- 100% nội dung phải bằng TIẾNG VIỆT
- Mỗi phần phải có ít nhất 50-100 từ
- Sử dụng ngôn ngữ kinh doanh chuyên nghiệp
- CHỈ trả về JSON hợp lệ, không có text khác
- Tránh lặp lại từ ngữ và cấu trúc câu`
              },
              {
                role: "user",
                content: prompt
              }
            ],
            model: "llama3-8b-8192",
            temperature: 0.1,
            max_tokens: 1500, // Tăng token limit cho fallback
          });
          
          const fallbackResponse = fallbackCompletion.choices[0]?.message?.content || '{}';
          console.log('Fallback response received:', fallbackResponse);
          return fallbackResponse;
        } catch (fallbackError) {
          console.log('Fallback also failed:', fallbackError);
        }
      } else if (groqError.error?.code === 'rate_limit_exceeded') {
        console.log('Rate limit exceeded, using fallback response');
      }
    }
    
    // Return fallback response
    return JSON.stringify({
      overview: "Phân tích dữ liệu chi nhánh với hiệu suất kinh doanh",
      topPerformer: "Chi nhánh có hiệu suất tốt nhất trong hệ thống",
      recommendations: ["Tối ưu hóa chi phí quảng cáo", "Cải thiện hiệu quả kênh bán hàng", "Phát triển chiến lược mới"],
      risks: ["Theo dõi xu hướng thị trường", "Kiểm soát rủi ro tài chính", "Quản lý cạnh tranh"],
      detailedAnalysis: ["Phân tích hiệu quả chi nhánh", "Đánh giá kênh bán hàng", "Xem xét xu hướng tuần", "Tối ưu hóa ROI"],
      trends: "Xu hướng tăng trưởng ổn định với tiềm năng cải thiện"
    });
  }
}

async function generateAIInsights(data: any) {
  const {
    totalRevenue,
    totalAdCost,
    avgROI,
    branchAnalysis,
    channelAnalysis,
    weeklyAnalysis,
    timeType,
    timeValue,
    branch,
    year
  } = data;

  const insights: {
    overview: string;
    topPerformer: string;
    summary: string;
    recommendations: string[];
    trends: string;
    risks: string[];
    detailedAnalysis: string[];
    performanceMetrics: {
      revenueGrowth: string;
      efficiencyScore: string;
      marketShare: string;
      costEffectiveness: string;
    };
  } = {
    overview: '',
    topPerformer: '',
    summary: '',
    recommendations: [],
    trends: '',
    risks: [],
    detailedAnalysis: [],
    performanceMetrics: {
      revenueGrowth: 'Đang phân tích...',
      efficiencyScore: 'Đang phân tích...',
      marketShare: 'Đang phân tích...',
      costEffectiveness: 'Đang phân tích...'
    }
  };

  // === PHÂN TÍCH THÔNG MINH DỰA TRÊN DỮ LIỆU THỰC TẾ ===
  
  // 1. Tính toán các ngưỡng động dựa trên dữ liệu thực tế
  const allROIs = Object.values(branchAnalysis).map((b: any) => b.roi);
  const allRevenues = Object.values(branchAnalysis).map((b: any) => b.revenue);
  const allAdCosts = Object.values(branchAnalysis).map((b: any) => b.adCost);
  
  const avgROIOverall = allROIs.reduce((sum, roi) => sum + roi, 0) / allROIs.length;
  const maxROI = Math.max(...allROIs);
  const minROI = Math.min(...allROIs);
  const roiStdDev = Math.sqrt(allROIs.reduce((sum, roi) => sum + Math.pow(roi - avgROIOverall, 2), 0) / allROIs.length);
  
  const avgRevenue = allRevenues.reduce((sum, rev) => sum + rev, 0) / allRevenues.length;
  const maxRevenue = Math.max(...allRevenues);
  const minRevenue = Math.min(...allRevenues);
  
  // 2. Định nghĩa ngưỡng thông minh
  const highROIThreshold = avgROIOverall + roiStdDev;
  const lowROIThreshold = avgROIOverall - roiStdDev;
  const exceptionalROIThreshold = avgROIOverall + (roiStdDev * 1.5);
  
  const highRevenueThreshold = avgRevenue + (Math.sqrt(allRevenues.reduce((sum, rev) => sum + Math.pow(rev - avgRevenue, 2), 0) / allRevenues.length));
  const lowRevenueThreshold = avgRevenue - (Math.sqrt(allRevenues.reduce((sum, rev) => sum + Math.pow(rev - avgRevenue, 2), 0) / allRevenues.length));

  // 3. Sử dụng Groq AI để tạo insights tự nhiên
  const timeDescription = timeType === 'week' ? `tuần ${timeValue}` : 
                         timeType === 'month' ? `tháng ${timeValue}` : 
                         `quý ${timeValue}`;
  
  if (branch && branch !== 'all') {
    // Khi chọn 1 chi nhánh cụ thể, sử dụng AI để phân tích
    const branchData = branchAnalysis[branch];
    
    // Kiểm tra branchData có tồn tại không
    if (!branchData) {
      console.log(`Branch data not found for: ${branch}`);
      // Sử dụng fallback insights
      const fallbackData = { totalRevenue, avgROI, branch, timeDescription, year };
      const fallbackInsights = createFallbackInsights(fallbackData);
      insights.overview = fallbackInsights.overview;
      insights.topPerformer = fallbackInsights.topPerformer;
      insights.recommendations = fallbackInsights.recommendations;
      insights.risks = fallbackInsights.risks;
      insights.detailedAnalysis = fallbackInsights.detailedAnalysis;
      insights.trends = fallbackInsights.trends;
          } else {
        const branchRevenue = branchData.revenue;
        const branchAdCost = branchData.adCost;
        const branchROI = branchData.roi;
      
                const revenuePerDay = branchRevenue / (timeType === 'week' ? 7 : timeType === 'month' ? 30 : 90);
        const adCostRatio = (branchAdCost / branchRevenue) * 100;
    
    // Phân tích hiệu suất tương đối với tất cả chi nhánh
    const roiRank = allROIs.filter(roi => roi > branchROI).length + 1;
    const revenueRank = allRevenues.filter(rev => rev > branchRevenue).length + 1;
    const totalBranches = allROIs.length;
    
    const performanceLevel = branchROI > exceptionalROIThreshold ? 'Xuất sắc' :
                           branchROI > highROIThreshold ? 'Tốt' :
                           branchROI > avgROIOverall ? 'Trên trung bình' :
                           branchROI > lowROIThreshold ? 'Trung bình' : 'Cần cải thiện';
    
    // Tạo prompt ngắn gọn cho AI
    const aiPrompt = `Phân tích chi nhánh ${branch}:
Doanh thu: ${(branchRevenue/1000000000).toFixed(2)} tỷ VND, ROI: ${branchROI.toFixed(2)} (xếp hạng ${roiRank}/${totalBranches})
Chi phí: ${(branchAdCost/1000000).toFixed(0)} triệu VND, hiệu suất: ${performanceLevel}
ROI trung bình hệ thống: ${avgROIOverall.toFixed(2)}
Kênh: ${Object.entries(channelAnalysis).map(([channel, data]: [string, any]) => 
  `${channel}(${data.percentage.toFixed(1)}%, ROI:${data.roi.toFixed(2)})`
).join(', ')}`;

    try {
      const aiResponse = await generateGroqInsights(aiPrompt);
      
      // Sanitize JSON fallback với helper mới
      let aiInsights;
      try {
        const cleanResponse = cleanJsonResponse(aiResponse);
        aiInsights = safeParse(cleanResponse);
        console.log('AI response parsed successfully:', aiInsights);
      } catch (parseError) {
        console.log('AI response is not valid JSON:', aiResponse);
        console.log('Parse error:', parseError);
        
        // Try one more time with a more aggressive approach
        try {
          let lastAttempt = aiResponse;
          // Find anything that looks like JSON
          const matches = lastAttempt.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
          if (matches && matches.length > 0) {
            // Take the longest match that's under 5000 chars (most likely to be complete and valid)
            const validMatches = matches.filter((match: string) => match.length < 5000);
            if (validMatches.length > 0) {
              const longestMatch = validMatches.reduce((a: string, b: string) => a.length > b.length ? a : b);
              aiInsights = safeParse(longestMatch);
              console.log('AI response parsed on second attempt:', aiInsights);
            } else {
              aiInsights = null;
            }
          } else {
            aiInsights = null;
          }
        } catch (secondError) {
          console.log('Second parse attempt also failed:', secondError);
          aiInsights = null;
        }
      }
      
      // Validate và parse với schema
      if (aiInsights && typeof aiInsights === 'object') {
        try {
          const validatedInsights = InsightsSchema.parse(aiInsights);
          insights.overview = validatedInsights.overview;
          insights.topPerformer = validatedInsights.topPerformer;
          insights.recommendations = validatedInsights.recommendations;
          insights.risks = validatedInsights.risks;
          insights.detailedAnalysis = validatedInsights.detailedAnalysis;
          insights.trends = validatedInsights.trends;
        } catch (validationError) {
          console.log('Schema validation failed, using fallback:', validationError);
          // Fallback to basic analysis if AI fails
          const fallbackData = { totalRevenue, avgROI, branch, timeDescription, year };
          const fallbackInsights = createFallbackInsights(fallbackData);
          insights.overview = fallbackInsights.overview;
          insights.topPerformer = fallbackInsights.topPerformer;
          insights.recommendations = fallbackInsights.recommendations;
          insights.risks = fallbackInsights.risks;
          insights.detailedAnalysis = fallbackInsights.detailedAnalysis;
          insights.trends = fallbackInsights.trends;
        }
      } else {
        // Fallback to basic analysis if AI fails
        const fallbackData = { totalRevenue, avgROI, branch, timeDescription, year };
        const fallbackInsights = createFallbackInsights(fallbackData);
        insights.overview = fallbackInsights.overview;
        insights.topPerformer = fallbackInsights.topPerformer;
        insights.recommendations = fallbackInsights.recommendations;
        insights.risks = fallbackInsights.risks;
        insights.detailedAnalysis = fallbackInsights.detailedAnalysis;
        insights.trends = fallbackInsights.trends;
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Fallback to basic analysis if AI fails
      const fallbackData = { totalRevenue, avgROI, branch, timeDescription, year };
      const fallbackInsights = createFallbackInsights(fallbackData);
      insights.overview = fallbackInsights.overview;
      insights.topPerformer = fallbackInsights.topPerformer;
      insights.recommendations = fallbackInsights.recommendations;
      insights.risks = fallbackInsights.risks;
      insights.detailedAnalysis = fallbackInsights.detailedAnalysis;
      insights.trends = fallbackInsights.trends;
    }
  }
  } else {
    // Sử dụng AI cho phân tích tất cả chi nhánh
    const revenuePerDay = totalRevenue / (timeType === 'week' ? 7 : timeType === 'month' ? 30 : 90);
    const adCostRatio = (totalAdCost / totalRevenue) * 100;
    const branchCount = Object.keys(branchAnalysis).length;
    const channelCount = Object.keys(channelAnalysis).length;
    
    // Phân tích phân bổ
    const revenueDistribution = Object.values(branchAnalysis).map((b: any) => b.percentage);
    const revenueVariance = revenueDistribution.reduce((sum, p) => sum + Math.pow(p - (100/branchCount), 2), 0) / branchCount;
    const distributionType = revenueVariance > 200 ? 'Tập trung cao' : revenueVariance > 100 ? 'Tập trung vừa' : 'Cân bằng';
    
    // Tạo prompt ngắn gọn cho AI phân tích tất cả chi nhánh
    const allBranchesPrompt = `Phân tích hệ thống ${timeDescription} ${year}:
Tổng doanh thu: ${(totalRevenue/1000000000).toFixed(2)} tỷ VND, ROI: ${avgROI.toFixed(2)}
Doanh thu/ngày: ${(revenuePerDay/1000000).toFixed(1)} triệu VND, ${branchCount} chi nhánh, ${channelCount} kênh
Chi nhánh: ${Object.entries(branchAnalysis).map(([branchName, data]: [string, any]) => 
  `${branchName}(${(data.revenue/1000000000).toFixed(2)} tỷ, ${data.percentage.toFixed(1)}%, ROI:${data.roi.toFixed(2)})`
).join(', ')}
Kênh: ${Object.entries(channelAnalysis).map(([channel, data]: [string, any]) => 
  `${channel}(${data.percentage.toFixed(1)}%, ROI:${data.roi.toFixed(2)})`
).join(', ')}`;

    try {
      const aiResponse = await generateGroqInsights(allBranchesPrompt);
      
      // Sanitize JSON fallback với helper mới
      let aiInsights;
      try {
        const cleanResponse = cleanJsonResponse(aiResponse);
        aiInsights = safeParse(cleanResponse);
        console.log('AI response for all branches parsed successfully:', aiInsights);
      } catch (parseError) {
        console.log('AI response for all branches is not valid JSON:', aiResponse);
        console.log('Parse error:', parseError);
        
        // Try one more time with a more aggressive approach
        try {
          let lastAttempt = aiResponse;
          // Find anything that looks like JSON
          const matches = lastAttempt.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
          if (matches && matches.length > 0) {
            // Take the longest match that's under 5000 chars (most likely to be complete and valid)
            const validMatches = matches.filter((match: string) => match.length < 5000);
            if (validMatches.length > 0) {
              const longestMatch = validMatches.reduce((a: string, b: string) => a.length > b.length ? a : b);
              aiInsights = safeParse(longestMatch);
              console.log('AI response for all branches parsed on second attempt:', aiInsights);
            } else {
              aiInsights = null;
            }
          } else {
            aiInsights = null;
          }
        } catch (secondError) {
          console.log('Second parse attempt for all branches also failed:', secondError);
          aiInsights = null;
        }
      }
      
      // Validate và parse với schema
      if (aiInsights && typeof aiInsights === 'object') {
        try {
          const validatedInsights = InsightsSchema.parse(aiInsights);
          insights.overview = validatedInsights.overview;
          insights.topPerformer = validatedInsights.topPerformer;
          insights.recommendations = validatedInsights.recommendations;
          insights.risks = validatedInsights.risks;
          insights.detailedAnalysis = validatedInsights.detailedAnalysis;
          insights.trends = validatedInsights.trends;
        } catch (validationError) {
          console.log('Schema validation failed for all branches, using fallback:', validationError);
          // Fallback to basic analysis if AI fails
          const fallbackData = { totalRevenue, avgROI, branch: 'all', timeDescription, year };
          const fallbackInsights = createFallbackInsights(fallbackData);
          insights.overview = fallbackInsights.overview;
          insights.topPerformer = fallbackInsights.topPerformer;
          insights.recommendations = fallbackInsights.recommendations;
          insights.risks = fallbackInsights.risks;
          insights.detailedAnalysis = fallbackInsights.detailedAnalysis;
          insights.trends = fallbackInsights.trends;
        }
      } else {
        // Fallback to basic analysis if AI fails
        const fallbackData = { totalRevenue, avgROI, branch: 'all', timeDescription, year };
        const fallbackInsights = createFallbackInsights(fallbackData);
        insights.overview = fallbackInsights.overview;
        insights.topPerformer = fallbackInsights.topPerformer;
        insights.recommendations = fallbackInsights.recommendations;
        insights.risks = fallbackInsights.risks;
        insights.detailedAnalysis = fallbackInsights.detailedAnalysis;
        insights.trends = fallbackInsights.trends;
      }
    } catch (error) {
      console.error('Error generating AI insights for all branches:', error);
      // Fallback to basic analysis if AI fails
      const fallbackData = { totalRevenue, avgROI, branch: 'all', timeDescription, year };
      const fallbackInsights = createFallbackInsights(fallbackData);
      insights.overview = fallbackInsights.overview;
      insights.topPerformer = fallbackInsights.topPerformer;
      insights.recommendations = fallbackInsights.recommendations;
      insights.risks = fallbackInsights.risks;
      insights.detailedAnalysis = fallbackInsights.detailedAnalysis;
      insights.trends = fallbackInsights.trends;
    }
    
    // AI sẽ tạo tất cả phân tích chi tiết
  }

  // AI sẽ tạo tất cả phân tích hiệu suất

  // AI sẽ tạo tất cả đề xuất chiến lược

  // AI sẽ tạo tất cả đề xuất về phân bổ và tối ưu hóa

  // AI sẽ tạo tất cả tóm tắt

  // AI sẽ tạo tất cả phân tích xu hướng

  // AI sẽ tạo tất cả cảnh báo rủi ro và đề xuất tích cực

  return insights;
}

