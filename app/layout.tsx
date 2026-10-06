import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Mono, Inter, Rubik } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["300", "400", "900"], // Light, Regular, Black
});

/* Fonts used by the Figma "Inicio" frame (file 8MLojKHAFEE3rGYwgROC4h) */

// Inter — headings, body copy and UI labels.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Regular, Medium, Semi Bold, Bold
});

// IBM Plex Mono — eyebrow, mono labels and the concept code block.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400"],
});

// Rubik One — the "Balrok Studio" wordmark. It was dropped from the Google
// Fonts catalogue used by next/font, so the OFL file is self-hosted.
const rubikOne = localFont({
  variable: "--font-rubik-one",
  src: "./fonts/rubik-one-latin.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  fallback: ["Rubik", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Balrok Studio",
  description: "Diseño y desarrollo web a medida.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rubik.variable} ${inter.variable} ${plexMono.variable} ${rubikOne.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
