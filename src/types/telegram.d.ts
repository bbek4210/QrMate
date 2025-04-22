export {};

declare global {
  interface TelegramWebAppThemeParams {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  }

  interface TelegramWebApp {
    initData: string;
    initDataUnsafe: any;
    version: string;
    platform: string;
    colorScheme: string;
    themeParams: TelegramWebAppThemeParams;
    isExpanded: boolean;
    isClosingConfirmationEnabled: boolean;

    expand(): void;
    ready(): void;
    close(): void;
    sendData(data: string): void;
    setHeaderColor(colorKey: "bg_color" | "secondary_bg_color" | string): void;
    setBackgroundColor(color: string): void;
    enableClosingConfirmation(): void;
    disableClosingConfirmation(): void;
  }

  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}
