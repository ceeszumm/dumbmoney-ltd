import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const pixelFont = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

// Base64 encoded pixel-art dollar icon (16x16 pixel art style)
const pixelDollarIcon = `data:image/svg+xml;base64,${Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  <rect width="16" height="16" fill="#0f172a"/>
  <rect x="2" y="2" width="12" height="12" fill="#22c55e" rx="1"/>
  <rect x="4" y="4" width="8" height="8" fill="#0f172a"/>
  <text x="8" y="11" font-family="Arial" font-size="7" fill="#eab308" text-anchor="bold">$</text>
</svg>
`).toString('base64')}`;

export const metadata: Metadata = {
  title: "DumbMoney.Ltd",
  description: "A fun 8-bit pixel art financial management app",
  keywords: ["DumbMoney", "Finance", "8-bit", "Pixel Art", "Budget"],
  authors: [{ name: "DumbMoney Team" }],
  icons: {
    icon: pixelDollarIcon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${pixelFont.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
