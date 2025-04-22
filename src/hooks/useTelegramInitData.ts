"use client";

import { useMemo, useRef } from "react";
import {
  useSignal,
  initData,
  type User as TelegramUser,
  useLaunchParams,
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

const mockInitData: ValidTelegramInitData & { zefeUser: ZefeUser } = {
  authDate: new Date(),
  hash: "mock_hash_123456",
  queryId: "mock_query_789",
  chatType: "private",
  chatInstance: "mock_chat_instance",
  canSendAfter: null,
  startParam: "mock_param",
  user: {
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
  },
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

  const state = useSignal(initData.state);
  const raw = useSignal(initData.raw);

  const rawInitData = useMemo<ValidTelegramInitData | null>(() => {
    if (isLocal) return mockInitData;
    if (!state || !state.user) return null;

    return {
      user: state.user,
      authDate: state.auth_date,
      hash: state.hash || "",
      queryId: state.query_id || "",
      chatType: state.chat_type || "",
      chatInstance: state.chat_instance || "",
      canSendAfter: state.can_send_after ?? null,
      startParam: state.start_param || "",
    };
  }, [state, isLocal]);

  const telegramUser = rawInitData?.user ?? null;

  const {
    data: zefeUser,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [TELEGRAM_INIT_QUERY_KEY, telegramUser?.id],
    queryFn: async () => {
      if (alreadyInitialized.current || !telegramUser) return null;
      alreadyInitialized.current = true;
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
      raw,
    };
  }, [rawInitData, zefeUser, isLoading, isError, error, isLocal, raw]);
}
