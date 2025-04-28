"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import ZefeLogo from "@/components/svgs/logo";
import UserIcon from "@/components/svgs/user-icon";
import CameraIcon from "@/components/svgs/camera-icon";
import BottomNavbar from "@/components/bottom-navbar/bottom-navbar";
import AddEvent from "@/components/event/add-event";
import QRCodeScanner from "@/components/qr/qrcode-scanner";
import ProfileBanner from "@/components/profile-banner";
import FancyQRCode from "@/components/FancyQRCode";

import { Badge } from "@/components/ui/badge";
import { useTelegramInitData } from "@/hooks/useTelegramInitData";
import useCreateEvent from "@/hooks/useCreateEvent";
import useGetEvents from "@/hooks/useGetEvent";

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

  const initData = useTelegramInitData();
  const navigate = useNavigate();

  const isInitDataReady =
    !!initData?.zefeUser?.id && !initData?.isLoading && !initData?.isError;
  const zefeUserId = initData?.zefeUser?.id;

  const {
    data: fetchedEvents,

    isLoading: isEventsLoading,
    refetch,
  } = useGetEvents(zefeUserId ?? "");

  const { data, refetch: refetchUserProfile } = useGetUserProfile();

  const userProfile = data?.data;

  useEffect(() => {
    if (!userProfile) return;

    const position = userProfile?.user_profile?.position?.trim?.();
    const project = userProfile?.user_profile?.project_name?.trim?.();

    if (!position || !project) {
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
        console.log({ response });
        const createdNetwork = response?.data?.data;
        if (!createdNetwork) {
          toast.error(
            "Please retry connecting, network was not established correctly."
          );
        }
        let urlToReplace = `/connected-user/${scannedUserId}?ref=scanner`;
        if (baseEventId) {
          urlToReplace += `&event_id=${baseEventId}&telegram_user_id=${telegramUserId}`;
        }

        navigate(urlToReplace);
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
      refetch();
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

  if (initData?.isError) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#232223]">
        <p className="text-lg text-red-500">
          Failed to initialize user. Please restart the app.
        </p>
      </main>
    );
  }

  return (
    <main className="bg-[#232223] min-h-screen pt-[90px]">
      <div className="flex items-center justify-between px-3 py-3">
        <ZefeLogo />
        <Link to="/user">
          <UserIcon />
        </Link>
      </div>

      {isScannerOpen ? (
        <QRCodeScanner
          isScannerOpen={isScannerOpen}
          onScanSuccess={handleScanSuccess}
        />
      ) : (
        <>
          <ProfileBanner />

          <div className="px-3 py-2">
            <p className="text-[#DDCCCC] font-semibold text-[22px]">
              You are at
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2 text-black text-[0.9rem]">
              <AddEvent
                triggerNode={<> + ADD EVENT</>}
                onEventCreated={handleNewEvent}
                refetch={refetch}
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
            <div className="flex flex-col items-center justify-center p-4 ">
              <p className="mb-4 text-lg font-medium text-[#7F7F7F] text-center">
                Your QR code
              </p>

              <FancyQRCode
                value={generateTelegramMiniAppLink({
                  eventId: selectedEvent?.base_event?.id?.toString() ?? "",
                  userId: zefeUserId?.toString() ?? "",
                  telegramUserId: initData?.telegramUser?.id?.toString() ?? "",
                })}
              />

              <p className="px-4 py-2 mt-4 text-base font-medium text-[12px] text-white bg-[#ED2944] rounded-[29px] border border-white">
                You are at {selectedEvent.title}
              </p>
            </div>
          )}
        </>
      )}

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

      {isDrawerOpen && (
        <CompleteProfileDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onComplete={async () => {
            const result = await refetchUserProfile();
            const updatedProfile = result.data?.data?.user_profile;
            if (updatedProfile?.position && updatedProfile?.project_name) {
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
