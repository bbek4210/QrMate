import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axiosInstance from "./axios";
import { User } from "@telegram-apps/sdk-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


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

export function generateTelegramMiniAppLink(payload: TGenerateTelegramLink) {
  const BOT_USERNAME = import.meta.env.NEXT_PUBLIC_BOT_USERNAME;
  const baseUrl = `https://t.me/${BOT_USERNAME}`;
  const queryString = new URLSearchParams(payload).toString();
  console.log({ queryString });
  return `${baseUrl}?startapp=${encodeURIComponent(queryString)}`;
}

export function parseTelegramStartAppData() {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const encodedPayload = searchParams.get("startapp");

    if (!encodedPayload) return null;

    // Decode and parse the query string back into an object
    const payload = Object.fromEntries(
      new URLSearchParams(decodeURIComponent(encodedPayload))
    );
    return payload;
  } catch (err) {
    console.error("Error parsing Telegram payload:", err);
    return null;
  }
}

export function getUserProfiles(data: any, telegramId: string) {
  const event1 = data.user_event1_data;
  const event2 = data.user_event2_data;

  let loggedInUser = null;
  let shownUser = null;

  if (event1.userprofile.telegram_account === telegramId) {
    loggedInUser = event1;
    shownUser = event2;
  } else if (event2.userprofile.telegram_account === telegramId) {
    loggedInUser = event2;
    shownUser = event1;
  }

  return {
    loggedInUser,
    shownUser,
  };
}
