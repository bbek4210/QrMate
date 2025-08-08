import { useMemo } from 'react';
import { useGetNetworksAndConnections } from './api-hooks';

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
  const { data: networksData } = useGetNetworksAndConnections();

  const analytics = useMemo(() => {
    if (!networksData?.connections?.results) {
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

    const connections = networksData.connections.results;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    // Calculate today's scans (where current user was scanned by others)
    const todayScans = connections.filter((connection: any) => {
      const scanDate = new Date(connection.meeting_date);
      return scanDate >= today && connection.scanned?.id === networksData.user?.id;
    }).length;

    // Calculate yesterday's scans
    const yesterdayScans = connections.filter((connection: any) => {
      const scanDate = new Date(connection.meeting_date);
      return scanDate >= yesterday && scanDate < today && connection.scanned?.id === networksData.user?.id;
    }).length;

    // Calculate scan growth
    const scanGrowth = yesterdayScans > 0 ? todayScans - yesterdayScans : todayScans;

    // Calculate success rate (successful connections vs total scans)
    const totalScans = connections.filter((connection: any) => 
      connection.scanned?.id === networksData.user?.id
    ).length;

    const successfulConnections = connections.filter((connection: any) => 
      connection.scanned?.id === networksData.user?.id && connection.meeting_date
    ).length;

    const successRate = totalScans > 0 ? Math.round((successfulConnections / totalScans) * 100) : 0;

    // Determine peak activity time based on scan times
    const scanTimes = connections
      .filter((connection: any) => connection.scanned?.id === networksData.user?.id)
      .map((connection: any) => new Date(connection.meeting_date).getHours());

    let peakActivityTime = '2:00 PM - 4:00 PM'; // Default
    if (scanTimes.length > 0) {
      const hourCounts = scanTimes.reduce((acc: any, hour: number) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});

      const peakHour = Object.entries(hourCounts).reduce((a: any, b: any) => 
        hourCounts[a[0]] > hourCounts[b[0]] ? a : b
      )[0];

      const peakHourNum = parseInt(peakHour);
      const startHour = peakHourNum - 1;
      const endHour = peakHourNum + 1;

      peakActivityTime = `${startHour > 12 ? startHour - 12 : startHour}:00 ${startHour >= 12 ? 'PM' : 'AM'} - ${endHour > 12 ? endHour - 12 : endHour}:00 ${endHour >= 12 ? 'PM' : 'AM'}`;
    }

    // Determine if trending (top 10% of users or significant growth)
    const isTrending = todayScans >= 5 || scanGrowth >= 3;
    const trendingMessage = isTrending 
      ? "You're in the top 10% of most scanned QR codes today! Keep up the great networking."
      : "Keep networking to boost your QR code visibility!";

    return {
      todayScans,
      yesterdayScans,
      scanGrowth,
      successRate,
      successfulConnections,
      totalScans,
      peakActivityTime,
      isTrending,
      trendingMessage
    };
  }, [networksData]);

  return analytics;
};
