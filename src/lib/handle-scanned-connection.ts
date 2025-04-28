import { toast } from "react-hot-toast";
import axios, { logToDiscord } from "@/lib/axios"; // Adjust path if needed
import { NavigateFunction } from "react-router-dom";

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

  if (!userId) {
    toast.error("User ID is missing. Cannot continue.");
    return;
  }

  let locallyScannedUserIds: number[] = [];
  try {
    const stored = localStorage.getItem("locallyScannedUserIds");
    if (stored) {
      const parsedStored = JSON.parse(stored);
      if (Array.isArray(parsedStored)) {
        locallyScannedUserIds = parsedStored;
      }
    }
  } catch (error) {
    console.warn("Failed to parse locallyScannedUserIds:", error);
  }

  const parsedUserId = parseInt(userId, 10);

  if (locallyScannedUserIds.includes(parsedUserId)) {
    console.info(`User ID ${parsedUserId} already scanned.`);
    return;
  }

  try {
    if (eventId) {
      const response = await axios.post("/create-a-network/", {
        base_event_id: parseInt(eventId, 10),
        scanned_user_id: parsedUserId,
      });

      const createdNetwork = response?.data?.data;

      if (!createdNetwork) {
        toast.error("Connection failed. Please retry.");
        return;
      }

      // Build the navigation URL
      const searchParams = new URLSearchParams({
        ref: "scanner",
        ...(eventId && { event_id: eventId }),
        ...(telegramUserId && { telegram_user_id: telegramUserId }),
      });

      await navigate(`/connected-user/${userId}?${searchParams.toString()}`);

      // Update localStorage to mark as scanned
      const updatedUserIds = Array.from(
        new Set([...locallyScannedUserIds, parsedUserId])
      );
      localStorage.setItem(
        "locallyScannedUserIds",
        JSON.stringify(updatedUserIds)
      );
    }
  } catch (error: any) {
    console.error("Failed to create network:", error);
    logToDiscord(
      JSON.stringify({
        error: error?.message || "Unknown error",
        stack: error?.stack,
        context: { userId, eventId, telegramUserId },
      })
    );
    toast.error("An unexpected error occurred. Please try again.");
  }
}
