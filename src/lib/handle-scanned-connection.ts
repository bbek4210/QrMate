import { toast } from "react-hot-toast";
import axios, { logToDiscord } from "@/lib/axios"; // Adjust the path if necessary
import { NavigateFunction } from "react-router-dom"; // Correct typing for navigate

type ParsedConnectionData = {
  userId: string;
  eventId: string;
  telegramUserId: string;
};

export async function handleScannedConnection(
  parsed: ParsedConnectionData,
  navigate: NavigateFunction
): Promise<void> {
  const { userId, eventId, telegramUserId } = parsed;
  const locallyScannedUserIds: number[] =
    JSON.parse(localStorage.getItem("locallyScannedUserIds") || "") || [];

  if (!userId) {
    toast.error("User ID is missing. Cannot continue.");
    return;
  }

  if (locallyScannedUserIds.includes(parseInt(userId))) {
    return;
  }

  try {
    if (eventId) {
      const { data } = await axios.post("/create-a-network/", {
        base_event_id: parseInt(eventId),
        scanned_user_id: parseInt(userId),
      });

      const createdNetwork = data?.data;
      if (!createdNetwork) {
        toast.error("Connection failed. Please retry.");
        return;
      }

      localStorage.setItem(
        "locallyScannedUserIds",
        JSON.stringify([...locallyScannedUserIds, parseInt(userId)])
      );
      // Build the navigation URL
      const searchParams = new URLSearchParams({
        ref: "scanner",
        ...(eventId && { event_id: eventId.toString() }),
        ...(telegramUserId && { telegram_user_id: telegramUserId.toString() }),
      });

      navigate(`/connected-user/${userId}?${searchParams.toString()}`);
    }
  } catch (error) {
    console.error("Failed to create network:", error);
    logToDiscord(JSON.stringify(error));
    toast.error("An error occurred. Please try again.");
  }
}
