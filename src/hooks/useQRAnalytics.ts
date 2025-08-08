import { useMemo } from 'react';
import { useGetQRAnalytics } from './api-hooks';

export interface QRAnalytics {
  todayScans: number;
  yesterdayScans: number;
  scanGrowth: number;
  successRate: number;
  successfulConnections: number;
  totalScans: number;
  peakActivityTime: string;
  isTrending: boolean;
  trendingMessage: string;
}

export const useQRAnalytics = (): QRAnalytics => {
  const { data: analyticsData, isLoading, error } = useGetQRAnalytics();

  const analytics = useMemo(() => {
    if (isLoading || error || !analyticsData?.data) {
      return {
        todayScans: 0,
        yesterdayScans: 0,
        scanGrowth: 0,
        successRate: 0,
        successfulConnections: 0,
        totalScans: 0,
        peakActivityTime: '2:00 PM - 4:00 PM',
        isTrending: false,
        trendingMessage: 'Start networking to see your analytics!'
      };
    }

    const data = analyticsData.data;
    
    return {
      todayScans: data.today_scans || 0,
      yesterdayScans: data.yesterday_scans || 0,
      scanGrowth: data.scan_growth || 0,
      successRate: data.success_rate || 0,
      successfulConnections: data.successful_connections || 0,
      totalScans: data.total_scans || 0,
      peakActivityTime: data.peak_activity_time || '2:00 PM - 4:00 PM',
      isTrending: data.is_trending || false,
      trendingMessage: data.trending_message || 'Keep networking to boost your QR code visibility!'
    };
  }, [analyticsData, isLoading, error]);

  return analytics;
};
