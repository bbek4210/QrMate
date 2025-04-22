import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/lib/axios"; // update path if different
import { parseTelegramStartAppData } from "@/lib/utils"; // update path

export const useHandleScannedConnection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const parsed = parseTelegramStartAppData();

    if (parsed?.userId && parsed?.eventId) {
      const { userId: scannedUserId, eventId: baseEventId, telegramUserId } = parsed;

      const url = `/connected-user/${scannedUserId}?ref=scanner&event_id=${baseEventId}&telegram_user_id=${telegramUserId}`;

      axios
        .post("/create-a-network/", {
          base_event_id: baseEventId,
          scanned_user_id: scannedUserId,
        })
        .then(() => {
          navigate(url);
        })
        .catch((err) => {
          console.error("Failed to create network:", err);
          alert("Could not create connection. Please try again.");
        });
    } else if (parsed?.userId) {
      navigate(`/connected-user/${parsed.userId}?ref=scanner`);
    }
  }, []);
};
