"use client";

import { useMemo, useRef } from "react";
import {
  useLaunchParams,
  type User as TelegramUser,
} from "@telegram-apps/sdk-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { setCookie } from "@/lib/cookies";
import { ACCESS_TOKEN_KEY, TELEGRAM_INIT_QUERY_KEY } from "@/lib/constants";

type ZefeUser = {
  id: string;
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
    id: "mock_zefe_id",
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
  };

  const response = await axiosInstance.post("/init/", payload).catch((err) => {
    console.error("Failed to initialize user", err);
    throw new Error("Failed to initialize user");
  });

  const accessToken = response?.data?.data?.access_token;
  if (accessToken) {
    setCookie(ACCESS_TOKEN_KEY, accessToken, {
      expires: 60 * 60 * 24 * 30,
    });
  }

  return response.data;
};

export function useTelegramInitData() {
  const isLocal = import.meta.env.NODE_ENV === "development";
  const alreadyInitialized = useRef(false);
  const launchParams = useLaunchParams();

  // @ts-ignore - we ignore strict type check for mock or incomplete initData
  const rawInitData = useMemo(() => {
    if (isLocal) return mockInitData;
    const webAppData = launchParams?.tgWebAppData
    const user = webAppData?.user;
    if (!user) {
      return null;
    }

    return {
      user,
      authDate: new Date(launchParams.auth_date as any * 1000),
      hash: launchParams.hash || "",
      queryId: launchParams.query_id || "",
      chatType: launchParams.chat_type || "",
      chatInstance: launchParams.chat_instance || "",
      canSendAfter: launchParams.can_send_after ?? null,
      startParam: launchParams.start_param || "",
    };
  }, [launchParams, isLocal]);

  const telegramUser = rawInitData?.user ?? null;

  const {
    data: zefeUser,
    isLoading,
    isError,
    error,
  } = useQuery({
    // @ts-ignore
    queryKey: [TELEGRAM_INIT_QUERY_KEY, telegramUser?.["id"]],
    queryFn: async () => {
      if (alreadyInitialized.current || !telegramUser) return null;
      alreadyInitialized.current = true;
      // @ts-ignore
      return await initializeZefeUser(telegramUser);
    },
    enabled: !!telegramUser,
    staleTime: 1000 * 60 * 5,
  });

  return useMemo(() => {
    if (isLocal) {
      return {
        ...mockInitData,
        user: mockInitData.user,
        telegramUser: mockInitData.user,
        zefeUser: mockInitData.zefeUser,
        isLocal,
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
