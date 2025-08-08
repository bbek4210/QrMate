"use client";

import React, { useState } from 'react';
import { useGetConnectionStrength, useGetConnectionRecommendations } from '@/hooks/api-hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DirectConnectButton from '@/components/DirectConnectButton';
import { 
  Users, 
  TrendingUp, 
  UserPlus, 
  ChevronDown, 
  ChevronUp,
  Target,
  Sparkles
} from 'lucide-react';

interface AlgorithmInsightsProps {
  className?: string;
}

const AlgorithmInsights: React.FC<AlgorithmInsightsProps> = ({ className = "" }) => {
  const [showStrengthDetails, setShowStrengthDetails] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const { data: strengthData, isLoading: strengthLoading } = useGetConnectionStrength();
  const { data: recommendationsData, isLoading: recommendationsLoading } = useGetConnectionRecommendations();

  const strengthInfo = strengthData?.data;
  const recommendations = recommendationsData?.data?.recommendations || [];

  const getStrengthColor = (category: string) => {
    switch (category) {
      case 'Strong': return 'text-green-500 bg-green-100';
      case 'Good': return 'text-blue-500 bg-blue-100';
      case 'Fair': return 'text-yellow-500 bg-yellow-100';
      case 'Weak': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStrengthIcon = (category: string) => {
    switch (category) {
      case 'Strong': return '🔥';
      case 'Good': return '⭐';
      case 'Fair': return '📈';
      case 'Weak': return '💡';
      default: return '📊';
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Connection Strength Summary */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowStrengthDetails(!showStrengthDetails)}
          className="flex items-center gap-2 text-white hover:bg-white/10 transition-all"
        >
          <Target className="w-4 h-4" />
          <span className="text-sm font-medium">
            {strengthLoading ? '...' : `${strengthInfo?.strong_connections || 0} Strong`}
          </span>
          {showStrengthDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>

        {/* Connection Strength Details Dropdown */}
        {showStrengthDetails && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-[#ED2944]" />
                <h3 className="font-semibold text-gray-900">Connection Strength</h3>
              </div>
              
              {strengthLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ED2944] mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Connections:</span>
                    <span className="font-semibold">{strengthInfo?.total_connections || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Strong Connections:</span>
                    <span className="font-semibold text-green-600">{strengthInfo?.strong_connections || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Score:</span>
                    <span className="font-semibold">{Math.round(strengthInfo?.average_score || 0)}/100</span>
                  </div>
                  
                  {strengthInfo?.connections?.slice(0, 3).map((connection: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={connection.user_photo} />
                        <AvatarFallback className="text-xs">
                          {connection.user_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {connection.user_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {connection.event_name}
                        </p>
                      </div>
                      <Badge className={`text-xs ${getStrengthColor(connection.strength_category)}`}>
                        {getStrengthIcon(connection.strength_category)} {connection.score}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Connection Recommendations Summary */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowRecommendations(!showRecommendations)}
          className="flex items-center gap-2 text-white hover:bg-white/10 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">
            {recommendationsLoading ? '...' : `${recommendations.length} Recommendations`}
          </span>
          {showRecommendations ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>

        {/* Recommendations Details Dropdown */}
        {showRecommendations && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#ED2944]" />
                <h3 className="font-semibold text-gray-900">Recommended Connections</h3>
              </div>
              
              {recommendationsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ED2944] mx-auto"></div>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recommendations.slice(0, 5).map((recommendation: any, index: number) => {
                    // Check if this user is already connected
                    const isAlreadyConnected = strengthInfo?.connections?.some(
                      (connection: any) => connection.user_id === recommendation.user_id
                    );
                    
                    return (
                      <div key={index} className="p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={recommendation.user_photo} />
                            <AvatarFallback className="text-xs">
                              {recommendation.user_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {recommendation.user_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {recommendation.position} • {recommendation.city}
                            </p>
                            <p className="text-xs text-blue-600 truncate">
                              {recommendation.recommendation_reason}
                            </p>
                          </div>
                          <Badge className="text-xs bg-blue-100 text-blue-600">
                            {recommendation.similarity_score}%
                          </Badge>
                        </div>
                        <DirectConnectButton
                          targetUserId={recommendation.user_id}
                          similarityScore={recommendation.similarity_score}
                          targetUserName={recommendation.user_name}
                          isAlreadyConnected={isAlreadyConnected}
                          className="mt-2"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <UserPlus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No recommendations available</p>
                  <p className="text-xs">Complete your profile to get personalized recommendations</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlgorithmInsights;
