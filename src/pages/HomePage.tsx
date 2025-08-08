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

import { Badge } from "@/components/ui/badge";
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
import { useQRAnalytics } from "@/hooks/useQRAnalytics";

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
  
  // Get real QR analytics data
  const qrAnalytics = useQRAnalytics();

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
                 <UserIcon />
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
              <UserIcon />
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

                 {/* QR Code Analytics */}
                 <div className="glass-card card-hover rounded-2xl p-6">
                   <h3 className="text-[#DDCCCC] font-bold text-xl mb-4">
                     QR Code Analytics
                   </h3>
                   <div className="space-y-6">
                     {/* Today's Scans */}
                     <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-4 border border-gray-700 hover-lift">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                           <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#ED2944] to-[#c41e3a] rounded-full flex items-center justify-center">
                             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                             </svg>
                           </div>
                           <div>
                             <h4 className="text-white font-semibold text-sm">Today's Scans</h4>
                             <p className="text-gray-400 text-xs">QR Code views</p>
                           </div>
                         </div>
                         <div className="text-right">
                           <div className="text-2xl font-bold gradient-text">{qrAnalytics.todayScans}</div>
                           <div className={`text-xs flex items-center ${qrAnalytics.scanGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                             {qrAnalytics.scanGrowth >= 0 ? (
                               <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                               </svg>
                             ) : (
                               <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                               </svg>
                             )}
                             {qrAnalytics.scanGrowth >= 0 ? '+' : ''}{qrAnalytics.scanGrowth} from yesterday
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Most Active Time */}
                     <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-4 border border-gray-700 hover-lift">
                       <div className="flex items-start space-x-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-[#ED2944] to-[#c41e3a] rounded-full flex items-center justify-center">
                           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                         </div>
                                                    <div className="flex-1">
                             <h4 className="text-white font-semibold text-sm mb-1">Peak Activity Time</h4>
                             <p className="text-gray-300 text-sm leading-relaxed">
                               <span className="text-[#ED2944] font-semibold">{qrAnalytics.peakActivityTime}</span> is when your QR gets scanned most often
                             </p>
                             <div className="mt-2 flex space-x-1">
                               {['8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'].map((time, index) => (
                                 <div key={time} className={`flex-1 h-2 rounded-full ${index === 3 ? 'bg-[#ED2944]' : 'bg-gray-600'}`}></div>
                               ))}
                             </div>
                           </div>
                       </div>
                     </div>

                     {/* Connection Success Rate */}
                     <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-4 border border-gray-700 hover-lift">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                           <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#ED2944] to-[#c41e3a] rounded-full flex items-center justify-center">
                             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                           </div>
                           <div>
                             <h4 className="text-white font-semibold text-sm">Success Rate</h4>
                             <p className="text-gray-400 text-xs">Connections made</p>
                           </div>
                         </div>
                         <div className="text-right">
                           <div className="text-2xl font-bold gradient-text">{qrAnalytics.successRate}%</div>
                           <div className="text-gray-400 text-xs">{qrAnalytics.successfulConnections} of {qrAnalytics.totalScans} scans</div>
                         </div>
                       </div>
                       <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                         <div className="bg-gradient-to-r from-[#ED2944] to-[#c41e3a] h-2 rounded-full" style={{ width: `${qrAnalytics.successRate}%` }}></div>
                       </div>
                     </div>

                     {/* Trending Notification */}
                     <div className={`bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-4 border hover-lift relative overflow-hidden ${qrAnalytics.isTrending ? 'border-[#ED2944]' : 'border-gray-700'}`}>
                       <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#ED2944] to-[#c41e3a] opacity-10 rounded-full -translate-y-8 translate-x-8"></div>
                       <div className="relative z-10">
                         <div className="flex items-start space-x-3">
                           <div className={`flex-shrink-0 w-8 h-8 bg-gradient-to-r from-[#ED2944] to-[#c41e3a] rounded-full flex items-center justify-center ${qrAnalytics.isTrending ? 'animate-pulse' : ''}`}>
                             <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                               <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                             </svg>
                           </div>
                           <div className="flex-1">
                             <h4 className="text-white font-semibold text-sm mb-1 flex items-center">
                               <span className={`mr-2 ${qrAnalytics.isTrending ? 'text-[#ED2944]' : 'text-gray-400'}`}>
                                 {qrAnalytics.isTrending ? '🔥 Trending!' : '📊 Analytics'}
                               </span>
                               {qrAnalytics.isTrending ? 'Your QR is hot today' : 'Your networking stats'}
                             </h4>
                             <p className="text-gray-300 text-sm leading-relaxed">
                               {qrAnalytics.trendingMessage}
                             </p>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* View Detailed Analytics Button */}
                     <button 
                       onClick={() => {
                         // TODO: Navigate to detailed analytics page
                         toast.success('Detailed analytics coming soon!');
                       }}
                       className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#2a2a2a] to-[#1f1f1f] text-white py-3 px-4 rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-200 shadow-lg hover-lift"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                       </svg>
                       <span className="font-medium text-sm">View Detailed Analytics</span>
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
