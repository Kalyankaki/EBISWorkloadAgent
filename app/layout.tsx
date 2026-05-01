import "./globals.css";
import type { Metadata } from "next";
import { TopBar } from "@/components/shell/TopBar";
import { LeftRail } from "@/components/shell/LeftRail";
import { CopilotPanel } from "@/components/copilot/CopilotPanel";

export const metadata: Metadata = {
  title: "Workload Virtual Index — Microsoft Azure",
  description:
    "Workload Virtual Index: bind business processes, applications, and Azure infrastructure into a single graph.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col h-screen">
          <TopBar />
          <div className="flex flex-1 min-h-0">
            <LeftRail />
            <main className="flex-1 overflow-y-auto bg-ax-bg">{children}</main>
          </div>
        </div>
        <CopilotPanel />
      </body>
    </html>
  );
}
