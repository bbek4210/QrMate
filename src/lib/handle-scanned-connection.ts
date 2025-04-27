import { toast } from "react-hot-toast";
import axios, { logToDiscord } from "@/lib/axios"; // Adjust the path if necessary
import { NavigateFunction } from "react-router-dom"; // Correct typing for navigate

type ParsedConnectionData = {
  userId: number;
  eventId: number;
  telegramUserId: number;
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

  try {
    if (eventId) {
      const { data } = await axios.post("/create-a-network/", {
        base_event_id: eventId,
        scanned_user_id: userId,
      });

      const createdNetwork = data?.data;
      if (!createdNetwork) {
        toast.error("Connection failed. Please retry.");
        return;
      }
    }

    // Build the navigation URL
    const searchParams = new URLSearchParams({
      ref: "scanner",
      ...(eventId && { event_id: eventId.toString() }),
      ...(telegramUserId && { telegram_user_id: telegramUserId.toString() }),
    });

    navigate(`/connected-user/${userId}?${searchParams.toString()}`);
  } catch (error) {
    console.error("Failed to create network:", error);
    toast.error("An error occurred. Please try again.");
  }
}
