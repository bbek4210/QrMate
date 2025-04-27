import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axiosInstance, { logToDiscord } from "./axios";
import { User } from "@telegram-apps/sdk-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchUserData = async (initData: any) => {
  const user = initData?.user as User;

  if (!user) {
    throw new Error("Telegram user data not found.");
  }

  const payload = {
    name: `${user.first_name} ${user.last_name}`,
    username: user.username,
    telegram_id: user.id,
  };

  const response = await axiosInstance.post("/init/", payload);
  return response.data;
};

export type TGenerateTelegramLink = {
  eventId: string;
  userId: string;
  telegramUserId: string;
  title: string;
};

export function generateTelegramMiniAppLink(
  payload: TGenerateTelegramLink
): string {
  const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME;

  if (!BOT_USERNAME) {
    throw new Error(
      "VITE_BOT_USERNAME is not defined in your environment variables."
    );
  }

  const baseUrl = `https://t.me/${BOT_USERNAME}`;

  // Filter out undefined/null values
  const queryObject = Object.entries(payload)
    .filter(([v]) => v !== undefined && v !== null)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {});

  const queryString = new URLSearchParams(queryObject).toString();

  // console.log({ queryString });

  const url = `${baseUrl}/zefe/?startapp=${encodeURIComponent(queryString)}`;
  logToDiscord(url)
  return url
}


export function parseTelegramStartAppData() {
  if (typeof window === "undefined" || !window.Telegram?.WebApp) {
    logToDiscord("❌ Window undefined or Telegram WebApp not available.");
    return null;
  }

  try {
    const initData = window.Telegram.WebApp.initDataUnsafe;
    logToDiscord(`ℹ️ Retrieved initDataUnsafe: ${JSON.stringify(initData)}`);

    const startParam = initData?.start_param;
    logToDiscord(`ℹ️ Retrieved start_param: ${startParam}`);

    if (!startParam) {
      logToDiscord("⚠️ No start_param found in Telegram initData.");
      return null;
    }

    const decodedParam = decodeURIComponent(startParam);
    logToDiscord(`ℹ️ Decoded start_param: ${decodedParam}`);

    const params = new URLSearchParams(decodedParam);

    const eventId = params.get("eventId");
    const title = params.get("title");
    const userId = params.get("userId");
    const telegramUserId = params.get("telegramUserId") || initData?.user?.id;

    logToDiscord(`ℹ️ Parsed fields: eventId=${eventId}, title=${title}, userId=${userId}, telegramUserId=${telegramUserId}`);

    if (!eventId || !userId) {
      logToDiscord(`❌ Missing required fields. eventId=${eventId}, userId=${userId}`);
      return null;
    }

    const parsedData = {
      eventId,
      title,
      userId,
      telegramUserId,
    };

    logToDiscord(`✅ Successfully parsed Telegram Start App Data: ${JSON.stringify(parsedData)}`);
    return parsedData;

  } catch (error) {
    logToDiscord(`❌ Error parsing Telegram Start App Data: ${error}`);
    return null;
  }
}
