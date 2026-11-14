
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthProvider } from "@/context/AuthContext";
import { JetBrains_Mono, Outfit } from "next/font/google";

import { Toaster } from "sileo";
import "./globals.css";
import Providers from "./providers";

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

export default function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html
            lang="en"
            className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
        >
            <body className="flex min-h-full flex-col font-sans">
                <AuthProvider>
                    <Providers>
                        {children}
                      <Toaster
                        position="top-center"
                        options={{
                            fill: "#171717",
                            roundness: 16,
                            styles: {
                                title: "!flex-1 !text-center !text-white",
                                description: "!text-white/75",
                                badge: "!bg-white/10",
                                button: "!bg-white/10 hover:!bg-white/15",
                            },
                        }}
/>
                    </Providers>
                </AuthProvider>
            </body>
        </html>
    );
}
