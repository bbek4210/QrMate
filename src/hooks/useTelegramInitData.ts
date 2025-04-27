"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  useLaunchParams,
  type User as TelegramUser,
} from "@telegram-apps/sdk-react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance, { logToDiscord } from "@/lib/axios";
import { setCookie } from "@/lib/cookies";
import { ACCESS_TOKEN_KEY } from "@/lib/constants";

type ZefeUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type ValidTelegramInitData = {
  user: TelegramUser;
  authDate: Date;
  hash: string;
  queryId: string;
  chatType: string;
  chatInstance: string;
  canSendAfter: number | null;
  startParam: string;
};

const mockTelegramUser: TelegramUser = {
  id: 366361,
  first_name: "Mock",
  last_name: "User",
  username: "tanka1026",
  photo_url: "https://via.placeholder.com/50",
  is_bot: false,
  is_premium: false,
  language_code: "en",
  allows_write_to_pm: true,
  added_to_attachment_menu: false,
};

const mockInitData: ValidTelegramInitData & { zefeUser: ZefeUser } = {
  user: mockTelegramUser,
  authDate: new Date(),
  hash: "mock_hash_123456",
  queryId: "mock_query_789",
  chatType: "private",
  chatInstance: "mock_chat_instance",
  canSendAfter: null,
  startParam: "mock_param",
  zefeUser: {
    id: 1,
    name: "Mock User",
    email: "mock@zefe.com",
    role: "admin",
  },
};

const initializeZefeUser = async (user: TelegramUser) => {
  const payload = {
    name: `${user.first_name} ${user.last_name}`,
    username: user.username,
    telegram_id: user.id,
    photo_url: user?.photo_url,
  };

  const response = await axiosInstance.post("/init/", payload);
  const accessToken = response?.data?.data?.data?.access_token;
  if (accessToken) {
    setCookie(ACCESS_TOKEN_KEY, accessToken, {
      expires: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return response.data;
};

export function useTelegramInitData() {
  const isLocal = import.meta.env.VITE_RUNNING_ENV === "development";
  const alreadyInitialized = useRef(false);
  const launchParams = useLaunchParams();

  const rawInitData = useMemo(() => {
    if (isLocal) return mockInitData;

    try {
      const user = launchParams?.tgWebAppData?.user;
      if (!user) return null;
      logToDiscord(JSON.stringify(launchParams))

      return {
        startParam: launchParams.start_param || "",
        user,
        authDate: new Date(Number(launchParams.auth_date) * 1000),
        hash: launchParams.hash || "",
        queryId: launchParams.query_id || "",
        chatType: launchParams.chat_type || "",
        chatInstance: launchParams.chat_instance || "",
        canSendAfter: launchParams.can_send_after ?? null,
      };
    } catch (err) {
      console.warn("Failed to parse launchParams:", err);
      return null;
    }
  }, [launchParams, isLocal]);

  const telegramUser = rawInitData?.user ?? null;

  if(telegramUser) {
    logToDiscord(JSON.stringify(rawInitData))
  }

  const startParam = rawInitData?.startParam || "";
  if (startParam) {
    logToDiscord("Start params" + JSON.stringify(startParam));
    const decodedParam = decodeURIComponent(startParam as any);
    logToDiscord("Decoded" + JSON.stringify(decodedParam));

  }

  const {
    mutateAsync: fetchZefeUser,
    data: zefeInitializationData,
    isPending: isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: initializeZefeUser,
  });

  const zefeUser = zefeInitializationData?.data?.data;

  useEffect(() => {
    if (!telegramUser || alreadyInitialized.current) return;

    alreadyInitialized.current = true;
    fetchZefeUser(telegramUser);
  }, [telegramUser, fetchZefeUser]);

  return useMemo(() => {
    if (isLocal) {
      return {
        ...mockInitData,
        user: mockInitData.user,
        telegramUser: mockInitData.user,
        zefeUser: mockInitData.zefeUser,
        isLocal,
        isLoading: false,
        isError: false,
        raw: "local",
      };
    }

    if (!rawInitData) return null;

    return {
      ...rawInitData,
      user: rawInitData.user,
      telegramUser: rawInitData.user,
      zefeUser,
      isLoading,
      isError,
      error,
      isLocal,
      raw: launchParams,
    };
  }, [rawInitData, zefeUser, isLoading, isError, error, isLocal, launchParams]);
}
