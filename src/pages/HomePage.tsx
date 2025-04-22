"use client";

import BottomNavbar from "@/components/bottom-navbar/bottom-navbar";
import AddEvent from "@/components/event/add-event";
import QRCodeScanner from "@/components/qr/qrcode-scanner";
import CameraIcon from "@/components/svgs/camera-icon";
import CrossIcon from "@/components/svgs/cross-icon";
import ZefeLogo from "@/components/svgs/logo";
import UserIcon from "@/components/svgs/user-icon";
import { Badge } from "@/components/ui/badge";

import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

import { useTelegramInitData } from "@/hooks/useTelegramInitData";
import useCreateEvent from "@/hooks/useCreateEvent";
import useGetEvents from "@/hooks/useGetEvent";
import { useState, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import TapToCompleteProfile from "@/components/complete-profile";
import {
  generateTelegramMiniAppLink,
  TGenerateTelegramLink,
} from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useLaunchParams } from "@telegram-apps/sdk-react";

export default function Home() {
  const [isProfileVisible, setIsProfileVisible] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const hideProfile = () => {
    setIsProfileVisible(false);
  };

  const initData = useTelegramInitData();

  const lp = useLaunchParams();
  console.log({ lp });

  const zefeUserId = initData?.zefeUser?.["id"];
  console.log({ initData });
  const { data: fetchedEvents, error, refetch } = useGetEvents(zefeUserId);

  const eventList = Array.isArray(fetchedEvents) ? fetchedEvents : [];

  const firstEvent = eventList?.[0];
  const selectedEvent = useMemo(
    () => eventList.find((e) => e.id === Number(selectedEventId)) || firstEvent,
    [eventList, selectedEventId]
  );

  const navigate = useNavigate();

  const handleEventQrSelect = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const scannerRef = useRef<any>(null);
  console.log({ initData });

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
    const userId = initData?.zefeUser?.id;
    if (!userId) {
      toast("User not identified, please try again!");
      return;
    }

    const eventPayload = { title: newEvent.title, city: newEvent.city };

    try {
      const createdEvent = await createEvent(eventPayload);

      toast.success("Event created successfully!");
      console.log("Created Event:", createdEvent);
    } catch (error) {
      toast.error("Failed to create event. Please try again.");
      console.error("Error creating event:", error);
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
          {isProfileVisible && (
            <div className="bg-[#5A41FF] py-4 px-3 flex items-center justify-between">
              <TapToCompleteProfile />
              <CrossIcon onClick={hideProfile} />
            </div>
          )}

          <div className="px-3 py-2">
            <p className="text-[#DDCCCC] font-semibold text-[22px]">
              You are at
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-black text-[15px]">
              <AddEvent
                triggerNode={<> + ADD EVENT</>}
                onEventCreated={handleNewEvent}
                refetch={refetch}
              />
              {eventList.map((event, index) => (
                <Badge
                  key={index}
                  variant="red"
                  onClick={() => handleEventQrSelect(event.id.toString())}
                  className={`cursor-pointer text-[15px] ${
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
            <div className="flex flex-col items-center justify-center p-4">
              <p
                className="mb-4 text-lg font-medium text-[#7F7F7F] text-center"
                style={{ textShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)" }}
              >
                Your QR code
              </p>
              <DownloadableQRCode
                selectedEvent={selectedEvent}
                initData={initData}
              />
              <p className="px-6 py-2 mt-8 text-base font-medium text-[18px] text-white bg-[#ED2944] rounded-[29px] border border-white">
                You are at {selectedEvent.title}
              </p>
            </div>
          )}

          <BottomNavbar />
        </>
      )}

      <Link
        to={"/init-data"}
        className="fixed bottom-32 rounded-[37px] left-0 right-0 flex items-center justify-center"
      >
        <CameraIcon />
      </Link>

      {/* <div
        onClick={() => setIsScannerOpen((prev) => !prev)}
        className="fixed bottom-32 rounded-[37px] left-0 right-0 flex items-center justify-center"
      >
        <CameraIcon />
      </div> */}
    </main>
  );
}

const DownloadableQRCode = ({ selectedEvent, initData }: any) => {
  const qrValue = generateTelegramMiniAppLink({
    eventId: selectedEvent?.id,
    title: selectedEvent?.title,
    userId: initData?.zefeUser?.id,
    telegramUserId: initData?.telegramUser?.id,
  });

  const svgRef = useRef(null);

  const handleDownload = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "telegram-qr-code.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleDownload();
        }}
        style={{ display: "inline-block" }}
      >
        <QRCodeSVG value={qrValue} size={256} ref={svgRef} />
      </a>
    </div>
  );
};
