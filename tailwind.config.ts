import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ax: {
          bg: "#1b1a19",
          panel: "#252423",
          panel2: "#2d2c2b",
          panelHi: "#323130",
          border: "#3b3a39",
          borderHi: "#605e5c",
          navBg: "#0e0e0e",
          topBg: "#0078d4",
          text: "#f3f2f1",
          textDim: "#c8c6c4",
          textMute: "#a19f9d",
          accent: "#2899f5",
          accentDim: "#0078d4",
          good: "#5db85d",
          warn: "#f0a020",
          bad: "#e35454",
          info: "#2899f5",
        },
      },
      fontFamily: {
        azure: [
          '"Segoe UI"',
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        ax: "2px",
      },
      keyframes: {
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(227, 84, 84, 0.7)" },
          "70%": { boxShadow: "0 0 0 10px rgba(227, 84, 84, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(227, 84, 84, 0)" },
        },
        pulseRingWarn: {
          "0%": { boxShadow: "0 0 0 0 rgba(240, 160, 32, 0.7)" },
          "70%": { boxShadow: "0 0 0 10px rgba(240, 160, 32, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(240, 160, 32, 0)" },
        },
        flow: {
          "0%": { strokeDashoffset: "0" },
          "100%": { strokeDashoffset: "-16" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        pulseRingWarn: "pulseRingWarn 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        flow: "flow 1.2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
