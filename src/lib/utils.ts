import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axiosInstance from "./axios";
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

  return `${baseUrl}?startapp=${encodeURIComponent(queryString)}`;
}

export function parseTelegramStartAppData(): Record<string, string> | null {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const encodedPayload = searchParams.get("startapp");

    if (!encodedPayload) return null;

    const decoded = decodeURIComponent(encodedPayload);
    const payload = Object.fromEntries(new URLSearchParams(decoded).entries());

    return payload;
  } catch (err) {
    console.error("Error parsing Telegram startapp payload:", err);
    return null;
  }
}
