"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import ZefeLogo from "@/components/svgs/logo";
import UserIcon from "@/components/svgs/user-icon";
import CameraIcon from "@/components/svgs/camera-icon";
import LogoutIcon from "@/components/svgs/logout-icon";
import BottomNavbar from "@/components/bottom-navbar/bottom-navbar";
import AddEvent from "@/components/event/add-event";
import QRCodeScanner from "@/components/qr/qrcode-scanner";
import ProfileBanner from "@/components/profile-banner";
import FancyQRCode from "@/components/FancyQRCode";
import { useGetConnectionStrength, useGetConnectionRecommendations } from '@/hooks/api-hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Sparkles, TrendingUp, Users, UserPlus } from 'lucide-react';
import DirectConnectButton from '@/components/DirectConnectButton';

import { useAuth } from "@/contexts/AuthContext";
import useCreateEvent from "@/hooks/useCreateEvent";
import useGetEvents from "@/hooks/useGetEvent";
import { useQueryClient } from "@tanstack/react-query";

import axios from "@/lib/axios";
import toast from "react-hot-toast";
import {
  generateTelegramMiniAppLink,
  TGenerateTelegramLink,
} from "@/lib/utils";
import useGetUserProfile from "@/hooks/use-get-user-profile";
import CompleteProfileDrawer from "@/components/connected-user/collect-role-project";
import SplashScreen from "@/components/splash-screen";

let hasAppInitialized = false;

export default function Home() {
  const [showSplash, setShowSplash] = useState(!hasAppInitialized);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const { user, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const isInitDataReady = !!user?.id;
  const zefeUserId = user?.id;
  
  const {
    data: fetchedEvents,
    isLoading: isEventsLoading,
    refetch,
  } = useGetEvents(zefeUserId?.toString() ?? "");

  const { data, refetch: refetchUserProfile } = useGetUserProfile();
  const userProfile = data?.data;
  
  // Get algorithm insights data
  const { data: strengthData, isLoading: strengthLoading } = useGetConnectionStrength();
  const { data: recommendationsData, isLoading: recommendationsLoading } = useGetConnectionRecommendations();

  const strengthInfo = strengthData?.data;
  const recommendations = recommendationsData?.data?.recommendations || [];

  useEffect(() => {
    if (!userProfile) return;

    const position = userProfile?.user_profile?.position?.trim?.();
    const project = userProfile?.user_profile?.project_name?.trim?.();
    const city = userProfile?.user_profile?.city?.trim?.();

    if (!position || !project || !city) {
      setIsDrawerOpen(true);
    } else {
      setIsDrawerOpen(false);
    }
  }, [userProfile]);

  const eventList = Array.isArray(fetchedEvents) ? fetchedEvents : [];
  
  const selectedEvent = useMemo(
    () =>
      eventList.find((e) => e?.base_event?.id === Number(selectedEventId)) ||
      eventList[0],
    [eventList, selectedEventId]
  );
  
  useEffect(() => {
    if (!selectedEventId && eventList.length > 0) {
      setSelectedEventId(eventList[0]?.base_event?.id.toString());
    }
  }, [eventList, selectedEventId]);

  const handleScanSuccess = async (parsedText: TGenerateTelegramLink) => {
    setIsScannerOpen(false);

    const {
      userId: scannedUserId,
      eventId: baseEventId,
      telegramUserId,
    } = parsedText;

    try {
      if (baseEventId && scannedUserId) {
        const response = await axios.post("/create-a-network/", {
          base_event_id: parseInt(baseEventId),
          scanned_user_id: parseInt(scannedUserId),
        });
        const createdNetwork = response?.data?.data;
        if (!createdNetwork) {
          toast.error(
            "Please retry connecting, network was not established correctly."
          );
        } else {
          // Successfully created network - refresh events list and networks
          
          // Force refetch events
          await refetch();
          
          // Force refetch networks by invalidating cache
          await queryClient.invalidateQueries({ queryKey: ["networkData"] });
          
          toast.success("Connection established! Event added to your list.");
          
          // Redirect immediately after showing success message
          let urlToReplace = `/connected-user/${scannedUserId}?ref=scanner`;
          if (baseEventId) {
            urlToReplace += `&event_id=${baseEventId}&telegram_user_id=${telegramUserId}`;
          }
          router.push(urlToReplace);
        }
        
        // If network creation failed, still redirect but without delay
        let urlToReplace = `/connected-user/${scannedUserId}?ref=scanner`;
        if (baseEventId) {
          urlToReplace += `&event_id=${baseEventId}&telegram_user_id=${telegramUserId}`;
        }
        router.push(urlToReplace);
      }
    } catch (err) {
      console.error("Failed to create network:", err);
      toast.error("Failed to create connection. Please try again.");
    }
  };

  const { mutateAsync: createEvent } = useCreateEvent();

  const handleNewEvent = async (newEvent: { title: string; city: string }) => {
    if (!zefeUserId) {
      toast("User not identified, please try again!");
      return;
    }

    try {
      await createEvent({ ...newEvent });
      toast.success("Event created successfully!");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error("Failed to create event. Please try again.");
    }
  };

  useEffect(() => {
    if (isInitDataReady && !isEventsLoading) {
      hasAppInitialized = true;
      setShowSplash(false);
    }
  }, [isInitDataReady, isEventsLoading]);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!user) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#232223]">
        <p className="text-lg text-red-500">
          Please log in to continue.
        </p>
      </main>
    );
  }

  return (
    <main className="bg-[#232223] min-h-screen">
             {/* Desktop Header */}
       <div className="hidden lg:block bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border-b border-gray-700 shadow-lg">
         <div className="max-w-7xl mx-auto px-6 py-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-8">
              
               <div className="text-white">
                 <h1 className="text-2xl font-bold gradient-text">QR Mate</h1>
                 <p className="text-gray-400 text-sm">Connect with People</p>
               </div>
             </div>
             <div className="flex items-center space-x-4">
               <Link href="/user" className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors hover-lift p-2 rounded-lg">
                 <Avatar className="w-8 h-8 border-2 border-white/20">
                   <AvatarImage 
                     src={userProfile?.photo_url || "https://github.com/shadcn.png"} 
                   />
                   <AvatarFallback className="bg-gradient-to-br from-[#ED2944] to-[#ff6b7a] text-white text-sm font-bold">
                     {userProfile?.name?.[0]?.toUpperCase() || "U"}
                   </AvatarFallback>
                 </Avatar>
                 <span className="text-sm">Profile</span>
               </Link>
               <button
                 onClick={() => {
                   logout();
                   router.push('/login');
                 }}
                 className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors hover-lift p-2 rounded-lg"
                 title="Logout"
               >
                 <LogoutIcon size={20} />
                 <span className="text-sm">Logout</span>
               </button>
             </div>
           </div>
         </div>
       </div>

      {/* Mobile Header */}
      <div className="lg:hidden pt-4">
        <div className="flex items-center justify-between px-3 py-3">
          <ZefeLogo />
          <div className="flex items-center gap-3">
            <Link href="/user">
              <Avatar className="w-8 h-8 border-2 border-white/20">
                <AvatarImage 
                  src={userProfile?.photo_url || "https://github.com/shadcn.png"} 
                />
                <AvatarFallback className="bg-gradient-to-br from-[#ED2944] to-[#ff6b7a] text-white text-sm font-bold">
                  {userProfile?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="p-1 hover:bg-gray-800 rounded-full transition-colors"
              title="Logout"
            >
              <LogoutIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      {isScannerOpen ? (
        <QRCodeScanner
          isScannerOpen={isScannerOpen}
          onScanSuccess={handleScanSuccess}
        />
      ) : (
        <>
          <ProfileBanner />

          {/* Desktop Layout */}
          <div className="hidden lg:block max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             {/* Left Column - Events and QR Code */}
               <div className="space-y-6">
                 <div className="glass-card card-hover rounded-2xl p-6">
                   <h2 className="text-[#DDCCCC] font-bold text-2xl mb-4">
                     You are at
                   </h2>
                   
                   <div className="flex flex-wrap items-center gap-3 mb-6">
                     <AddEvent
                       triggerNode={
                         <button className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors hover-lift">
                           + ADD EVENT
                         </button>
                       }
                       onEventCreated={handleNewEvent}
                     />

                     {eventList.map((event, index) => (
                       <Badge
                         key={index}
                         variant="red"
                         onClick={() =>
                           setSelectedEventId(event?.base_event?.id.toString())
                         }
                         className={`cursor-pointer text-sm px-4 py-2 hover-lift ${
                           selectedEvent?.base_event?.id === event?.base_event?.id
                             ? "border-[#ffffff] bg-[#E30613]"
                             : "bg-transparent border-[#ffffff] hover:bg-[#E30613] hover:border-[#ffffff]"
                         } transition-all duration-200`}
                       >
                         {event.title}
                       </Badge>
                     ))}
                   </div>

                   {selectedEvent && (
                     <div className="flex flex-col items-center justify-center p-6 bg-[#1a1a1a] rounded-xl border border-gray-700 card-hover">
                       <p className="mb-10 text-xl font-medium text-[#7F7F7F] text-center">
                         Your QR Code
                       </p>

                       <div className="scale-125 mb-10">
                         <FancyQRCode
                           value={generateTelegramMiniAppLink({
                             eventId: selectedEvent?.base_event?.id?.toString() ?? "",
                             userId: zefeUserId?.toString() ?? "",
                             telegramUserId: user?.id?.toString() ?? "",
                           })}
                         />
                       </div>

                       <div className="px-6 py-3 text-lg font-medium text-white animated-button rounded-full border border-white shadow-lg">
                         You are at {selectedEvent.title}
                       </div>
                     </div>
                   )}
                 </div>
               </div>

                             {/* Right Column - Quick Actions and Networking Tips */}
               <div className="space-y-6">
                 {/* Quick Actions */}
                 <div className="glass-card card-hover rounded-2xl p-6">
                   <h3 className="text-[#DDCCCC] font-bold text-xl mb-4">
                     Quick Actions
                   </h3>
                   <div className="space-y-4">
                     <button
                       onClick={() => setIsScannerOpen(true)}
                       className="w-full flex items-center justify-center space-x-3 animated-button text-white py-4 px-6 rounded-xl hover-lift transition-all duration-200 shadow-lg"
                     >
                       <CameraIcon />
                       <span className="font-medium">Scan QR Code</span>
                     </button>
                     
                     <Link href="/networks-and-connections" className="block">
                       <button className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-[#2a2a2a] to-[#1f1f1f] text-white py-4 px-6 rounded-xl border border-gray-600 hover:border-gray-500 hover-lift transition-all duration-200">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                         </svg>
                         <span className="font-medium">View Connections</span>
                       </button>
                     </Link>
                   </div>
                 </div>

                 {/* Algorithm Insights */}
                <div className="glass-card card-hover rounded-2xl p-6">
                  <h3 className="text-[#DDCCCC] font-bold text-xl mb-4">
                    Network Intelligence
                  </h3>
                  <div className="space-y-6">
                    {/* Connection Strength Overview */}
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-4 border border-gray-700 hover-lift">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#ED2944] to-[#c41e3a] rounded-full flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-sm">Connection Strength</h4>
                            <p className="text-gray-400 text-xs">Your strongest connections</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold gradient-text">
                            {strengthLoading ? '...' : strengthInfo?.strong_connections || 0}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {strengthLoading ? 'Loading...' : `${strengthInfo?.total_connections || 0} total`}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[#ED2944] to-[#c41e3a] h-2 rounded-full" 
                          style={{ 
                            width: `${strengthInfo?.total_connections ? Math.round((strengthInfo.strong_connections / strengthInfo.total_connections) * 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Top Connections */}
                    {strengthInfo?.connections?.slice(0, 2).map((connection: any, index: number) => (
                      <div key={index} className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-4 border border-gray-700 hover-lift">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={connection.user_photo} />
                            <AvatarFallback className="text-xs bg-[#ED2944] text-white">
                              {connection.user_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-sm truncate">
                              {connection.user_name}
                            </h4>
                            <p className="text-gray-400 text-xs truncate">
                              {connection.event_name}
                            </p>
                          </div>
                          <Badge className={`text-xs ${
                            connection.strength_category === 'Strong' ? 'bg-green-100 text-green-600' :
                            connection.strength_category === 'Good' ? 'bg-blue-100 text-blue-600' :
                            connection.strength_category === 'Fair' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {connection.strength_category === 'Strong' ? '🔥' :
                             connection.strength_category === 'Good' ? '⭐' :
                             connection.strength_category === 'Fair' ? '📈' : '💡'} {connection.score}
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {/* Recommendations Overview */}
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-4 border border-gray-700 hover-lift">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#ED2944] to-[#c41e3a] rounded-full flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-sm">Smart Recommendations</h4>
                            <p className="text-gray-400 text-xs">People you should connect with</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold gradient-text">
                            {recommendationsLoading ? '...' : recommendations.length}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {recommendationsLoading ? 'Loading...' : 'matches found'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top Recommendations */}
                    {recommendations.slice(0, 2).map((recommendation: any, index: number) => {
                      // Check if this user is already connected
                      const isAlreadyConnected = strengthInfo?.connections?.some(
                        (connection: any) => connection.user_id === recommendation.user_id
                      );
                      
                      return (
                        <div key={index} className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-4 border border-gray-700 hover-lift">
                          <div className="flex items-center space-x-3 mb-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={recommendation.user_photo} />
                              <AvatarFallback className="text-xs bg-[#ED2944] text-white">
                                {recommendation.user_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-semibold text-sm truncate">
                                {recommendation.user_name}
                              </h4>
                              <p className="text-gray-400 text-xs truncate">
                                {recommendation.position} • {recommendation.city}
                              </p>
                              <p className="text-blue-400 text-xs truncate">
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

                    {/* Network Growth */}
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-4 border border-gray-700 hover-lift">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#ED2944] to-[#c41e3a] rounded-full flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-sm">Network Growth</h4>
                            <p className="text-gray-400 text-xs">Your networking progress</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold gradient-text">
                            {strengthLoading ? '...' : Math.round(strengthInfo?.average_score || 0)}
                          </div>
                          <div className="text-gray-400 text-xs">avg score /100</div>
                        </div>
                      </div>
                      <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[#ED2944] to-[#c41e3a] h-2 rounded-full" 
                          style={{ width: `${strengthInfo?.average_score || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button 
                      onClick={() => {
                        // Navigate to networks page to see all connections
                        router.push('/networks-and-connections');
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#2a2a2a] to-[#1f1f1f] text-white py-3 px-4 rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-200 shadow-lg hover-lift"
                    >
                      <Users className="w-4 h-4" />
                      <span className="font-medium text-sm">View All Connections</span>
                    </button>
                  </div>
                </div>
               </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            <div className="px-3 py-2">
              <p className="text-[#DDCCCC] font-semibold text-[22px]">
                You are at
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-2 text-black text-[0.9rem]">
                <AddEvent
                  triggerNode={<> + ADD EVENT</>}
                  onEventCreated={handleNewEvent}
                />

                {eventList.map((event, index) => (
                  <Badge
                    key={index}
                    variant="red"
                    onClick={() =>
                      setSelectedEventId(event?.base_event?.id.toString())
                    }
                    className={`cursor-pointer text-[0.9rem] ${
                      selectedEvent?.base_event?.id === event?.base_event?.id
                        ? "border-[#ffffff] bg-[#E30613]"
                        : "bg-transparent border-[#ffffff]"
                    }`}
                  >
                    {event.title}
                  </Badge>
                ))}
              </div>
            </div>

            {selectedEvent && (
              <div className="flex flex-col items-center justify-center p-4">
                <p className="mb-4 text-lg font-medium text-[#7F7F7F] text-center">
                  Your QR code
                </p>

                <FancyQRCode
                  value={generateTelegramMiniAppLink({
                    eventId: selectedEvent?.base_event?.id?.toString() ?? "",
                    userId: zefeUserId?.toString() ?? "",
                    telegramUserId: user?.id?.toString() ?? "",
                  })}
                />

                <p className="px-4 py-2 mt-4 text-base font-medium text-[12px] text-white bg-[#ED2944] rounded-[29px] border border-white">
                  You are at {selectedEvent.title}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <BottomNavbar
          baseOnClick={() => {
            if (isScannerOpen) {
              setIsScannerOpen(false);
            }
          }}
        />

        {!isScannerOpen && (
          <div
            onClick={() => setIsScannerOpen(true)}
            className="fixed bottom-20 rounded-[37px] left-0 right-0 flex items-center justify-center"
          >
            <CameraIcon />
          </div>
        )}
      </div>

      {isDrawerOpen && (
        <CompleteProfileDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          userData={{
            name: userProfile?.name,
            username: userProfile?.username,
            position: userProfile?.user_profile?.position,
            project_name: userProfile?.user_profile?.project_name,
            city: userProfile?.user_profile?.city,
          }}
          onComplete={async () => {
            const result = await refetchUserProfile();
            const updatedProfile = result.data?.data?.user_profile;
            if (updatedProfile?.position && updatedProfile?.project_name && updatedProfile?.city) {
              setIsDrawerOpen(false);
            } else {
              setIsDrawerOpen(true);
            }
          }}
        />
      )}
    </main>
  );
}
