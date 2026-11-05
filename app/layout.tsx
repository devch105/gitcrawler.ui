import { AuthProvider } from "@/context/AuthContext";
import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitCrawler",
  description: "GitHub repository analysis platform",
 
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <AuthProvider>
        <Providers>
          <body className="min-h-full flex flex-col font-sans">
            {children}
            <Toaster position="top-right" richColors />
          </body>
        </Providers>
      </AuthProvider>
    </html>
  );
}