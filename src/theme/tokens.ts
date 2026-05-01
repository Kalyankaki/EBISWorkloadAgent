export const ax = {
  // surfaces
  bg: "#1b1a19",
  panel: "#252423",
  panel2: "#2d2c2b",
  panelHi: "#323130",
  border: "#3b3a39",
  borderHi: "#605e5c",
  navBg: "#0e0e0e",
  topBg: "#0078d4",

  // text
  text: "#f3f2f1",
  textDim: "#c8c6c4",
  textMute: "#a19f9d",

  // brand
  accent: "#2899f5",
  accentDim: "#0078d4",

  // health / status
  good: "#5db85d",
  warn: "#f0a020",
  bad: "#e35454",
  info: "#2899f5",
} as const;

export const fontFamily =
  '"Segoe UI", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';

export type AxColor = keyof typeof ax;

export const healthColor = (
  status: "healthy" | "warning" | "critical" | "unknown"
): string => {
  switch (status) {
    case "healthy":
      return ax.good;
    case "warning":
      return ax.warn;
    case "critical":
      return ax.bad;
    default:
      return ax.textMute;
  }
};
