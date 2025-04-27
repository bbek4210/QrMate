import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios, { logToDiscord } from "@/lib/axios"; // Update path if needed
import { parseTelegramStartAppData } from "@/lib/utils"; // Update path
import { toast } from "react-hot-toast"; // Assuming react-hot-toast for notifications

async function handleScannedConnection(navigate: (path: string) => void) {
  const parsed = parseTelegramStartAppData();
  const logMessage = JSON.stringify(parsed)
  logToDiscord(logMessage);

  if (!parsed) return;

  const { userId, eventId, telegramUserId } = parsed;

  if (userId && eventId) {
    try {
      const { data } = await axios.post("/create-a-network/", {
        base_event_id: parseInt(eventId, 10),
        scanned_user_id: parseInt(userId, 10),
      });

      const createdNetwork = data?.data;

      if (!createdNetwork) {
        toast.error("Please retry connecting, network was not established correctly.");
        return;
      }

      let url = `/connected-user/${userId}?ref=scanner`;

      if (eventId) {
        url += `&event_id=${eventId}&telegram_user_id=${telegramUserId}`;
      }

      navigate(url);
    } catch (error) {
      console.error("Failed to create network:", error);
      toast.error("Failed to create connection. Please try again.");
    }
  } else if (userId) {
    navigate(`/connected-user/${userId}?ref=scanner`);
  }
}

export const useHandleScannedConnection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    void handleScannedConnection(navigate); // void to explicitly ignore returned promise
  }, [navigate]);
};
