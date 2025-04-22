"use client";

import { useEffect } from "react";
import { init } from "@telegram-apps/sdk-react";

export default function TelegramInitWrapper({ children }: any) {
  const isLocal = import.meta.env.NODE_ENV === "development";

  useEffect(() => {
    if (!isLocal) {
      init(); // Initialize Telegram Web App SDK
      // @ts-ignore
      console.log("Raw initData string:", window.Telegram?.WebApp?.initData);
      // @ts-ignore
      console.log("Parsed initData unsafe:", window.Telegram?.WebApp?.initDataUnsafe);
    
    }
  }, [isLocal]);

  return <>{children}</>; // No UI needed
}
