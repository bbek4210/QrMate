"use client";

import { useEffect } from "react";
import { init } from "@telegram-apps/sdk-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TelegramInitWrapper({ children }: any) {
  const isLocal = import.meta.env.VITE_RUNNING_ENV === "development";

  useEffect(() => {
    if (!isLocal) {
      init(); // Initialize Telegram Web App SDK
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      console.log("Raw initData string:", window.Telegram?.WebApp?.initData);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      console.log(
        "Parsed initData unsafe:",
        window.Telegram?.WebApp?.initDataUnsafe
      );
    }
  }, [isLocal]);

  return <>{children}</>; // No UI needed
}
