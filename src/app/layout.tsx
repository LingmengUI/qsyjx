import type { Metadata } from "next";
import "./globals.css";
import "../styles/progress.css";
import "../styles/wave-sphere.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "视频解析工具",
  description: "支持抖音、快手、小红书等平台的视频无水印下载",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
