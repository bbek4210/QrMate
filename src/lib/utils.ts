import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axiosInstance, { logToDiscord } from "./axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchUserData = async (userData: any) => {
  if (!userData) {
    throw new Error("User data not found.");
  }

  const payload = {
    name: userData.name,
    username: userData.username,
    user_id: userData.id,
  };

  const response = await axiosInstance.post("/init/", payload);
  return response.data;
};

export type TGenerateTelegramLink = {
  eventId: string;
  userId: string;
  telegramUserId: string;
};

export function base64UrlEncode(input: string): string {
  return btoa(input)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, ''); // Remove padding
}

export function base64UrlDecode(input: string): string {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  while (input.length % 4) {
    input += '=';
  }
  return atob(input);
}

export function generateTelegramMiniAppLink(
  payload: TGenerateTelegramLink
): string {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Filter out undefined/null values
  const queryObject = Object.entries(payload)
    .filter(([v]) => v !== undefined && v !== null)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {});

  const queryString = JSON.stringify(queryObject)
  const encodedStartParam = base64UrlEncode(queryString);

  // console.log({ queryString });

  const url = `${APP_URL}/scan?startapp=${encodedStartParam}`;
  logToDiscord(url)
  return url
}


export function parseWebStartAppData() {
  if (typeof window === "undefined") {
    logToDiscord("❌ Window undefined.");
    return null;
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const startParam = urlParams.get("startapp");
    logToDiscord(`ℹ️ Retrieved start_param: ${startParam}`);

    if (!startParam) {
      logToDiscord("⚠️ No start_param found in URL.");
      return null;
    }

    const decodedParam = base64UrlDecode(startParam);
    logToDiscord(`ℹ️ Decoded start_param: ${decodedParam}`);

    const parsedData = JSON.parse(decodedParam);

    const eventId = parsedData.eventId;
    const userId = parsedData.userId;
    const telegramUserId = parsedData.telegramUserId;

    logToDiscord(`ℹ️ Parsed fields: eventId=${eventId}, userId=${userId}, telegramUserId=${telegramUserId}`);

    if (!eventId || !userId) {
      logToDiscord(`❌ Missing required fields. eventId=${eventId}, userId=${userId}`);
      return null;
    }

    const result = {
      eventId,
      userId,
      telegramUserId,
    };

    logToDiscord(`✅ Successfully parsed Web Start App Data: ${JSON.stringify(result)}`);
    return result;

  } catch (error) {
    logToDiscord(`❌ Error parsing Web Start App Data: ${error}`);
    return null;
  }
}
