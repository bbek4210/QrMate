"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import ZefeLogo from "@/components/svgs/logo";
import UserIcon from "@/components/svgs/user-icon";
import CameraIcon from "@/components/svgs/camera-icon";

import BottomNavbar from "@/components/bottom-navbar/bottom-navbar";
import AddEvent from "@/components/event/add-event";
import QRCodeScanner from "@/components/qr/qrcode-scanner";

import { Badge } from "@/components/ui/badge";
import { useTelegramInitData } from "@/hooks/useTelegramInitData";
import useCreateEvent from "@/hooks/useCreateEvent";
import useGetEvents from "@/hooks/useGetEvent";

import toast from "react-hot-toast";
import {
  generateTelegramMiniAppLink,
  TGenerateTelegramLink,
  parseTelegramStartAppData,
} from "@/lib/utils";
import ProfileBanner from "@/components/profile-banner";
import FancyQRCode from "@/components/FancyQRCode";

export default function Home() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const initData = useTelegramInitData();
  const navigate = useNavigate();

  const zefeUserId = initData?.zefeUser?.id;
  const { data: fetchedEvents, error, refetch } = useGetEvents(zefeUserId);

  const eventList = Array.isArray(fetchedEvents) ? fetchedEvents : [];
  const firstEvent = eventList?.[0];

  const selectedEvent = useMemo(
    () => eventList.find((e) => e.id === Number(selectedEventId)) || firstEvent,
    [eventList, selectedEventId]
  );

  useEffect(() => {
    const parsed = parseTelegramStartAppData();
    if (parsed?.userId) {
      let url = `/connected-user/${parsed.userId}`;
      if (parsed?.eventId) {
        url += `?event_id=${parsed.eventId}&telegram_user_id=${parsed.telegramUserId}`;
      }
      navigate(url);
    }
  }, []);
  const scannerRef = useRef<unknown>(null);

  useEffect(() => {
    if (zefeUserId) {
      refetch();
    }
  }, [zefeUserId]);

  const handleScanSuccess = (parsedText: TGenerateTelegramLink) => {
    setIsScannerOpen(false);
    let urlToReplace = `/connected-user/${parsedText?.userId}`;
    if (parsedText?.eventId) {
      urlToReplace = `${urlToReplace}?event_id=${parsedText?.eventId}&telegram_user_id=${parsedText?.telegramUserId}`;
    }
    navigate(urlToReplace);
  };

  const { mutateAsync: createEvent } = useCreateEvent();

  const handleNewEvent = async (newEvent: { title: string; city: string }) => {
    if (!zefeUserId) {
      toast("User not identified, please try again!");
      return;
    }

    const eventPayload = { title: newEvent.title, city: newEvent.city };
    try {
      await createEvent(eventPayload);
      toast.success("Event created successfully!");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to create event. Please try again.");
    }
  };

  if (error) return <p>Error loading events: {error.message}</p>;

  return (
    <main className="bg-[#232223] h-screen">
      <div className="flex items-center justify-between px-3 py-3">
        <ZefeLogo />
        <Link to="/user">
          <UserIcon />
        </Link>
      </div>

      {isScannerOpen ? (
        <QRCodeScanner
          ref={scannerRef}
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
                  onClick={() => setSelectedEventId(event.id.toString())}
                  className={`cursor-pointer text-[0.9rem] ${
                    selectedEvent?.id === event.id
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
                  eventId: selectedEvent?.id?.toString() ?? "",
                  title: selectedEvent?.title ?? "",
                  userId: initData?.zefeUser?.id?.toString() ?? "",
                  telegramUserId: initData?.telegramUser?.id?.toString() ?? "",
                })}
              />

              <p className="px-6 py-2 mt-8 text-base font-medium text-[1.1rem] text-white bg-[#ED2944] rounded-[29px] border border-white">
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
          onClick={() => setIsScannerOpen((pre) => !pre)}
          className="fixed bottom-20 rounded-[37px] left-0 right-0 flex items-center justify-center"
        >
          <CameraIcon />
        </div>
      )}
    </main>
  );
}

// const DownloadableQRCode = ({ selectedEvent, initData }: any) => {
//   const qrValue = generateTelegramMiniAppLink({
//     eventId: selectedEvent?.id,
//     title: selectedEvent?.title,
//     userId: initData?.zefeUser?.id,
//     telegramUserId: initData?.telegramUser?.id,
//   });
