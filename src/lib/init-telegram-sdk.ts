// lib/dev/initTelegramSDK.ts
export async function initTelegramSDK() {
    const { init } = await import("@telegram-apps/sdk-react");
    init();
  }
  