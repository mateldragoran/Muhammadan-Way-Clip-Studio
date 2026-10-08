import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Oswald } from "next/font/google";
import { MaintenanceProvider } from "@/components/providers/MaintenanceProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

// NEW: Updated branding
export const metadata: Metadata = {
  title: "Muhammadan Way Clip Studio",
  description: "Create beautiful vertical clips from Muhammadan Way content.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F7F5EF", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} ${oswald.variable}`}>
      <body className="font-sans bg-ivory text-charcoal min-h-screen flex flex-col antialiased">
        <MaintenanceProvider>
          {children}
        </MaintenanceProvider>
      </body>
    </html>
  );
}