import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito, Caveat } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegisterSW from "@/components/RegisterSW";
import InstallPrompt from "@/components/InstallPrompt";

const baloo = Baloo_2({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kokoro — A Place to Build Habit",
  description:
    "Kokoro Cafe — coffee, mojitos, smoothies, shakes & more. Order online for pickup.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kokoro",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#8f5fc0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${baloo.variable} ${nunito.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScrollProvider>
          <Navbar />
          <main className="flex-1 pt-28 sm:pt-32">{children}</main>
          <Footer />
        </SmoothScrollProvider>
        <RegisterSW />
        <InstallPrompt />
        <Toaster
          position="top-center"
          containerStyle={{ zIndex: 9999, top: 80 }}
          toastOptions={{ style: { borderRadius: "9999px", fontFamily: "var(--font-quicksand)" } }}
        />
      </body>
    </html>
  );
}
