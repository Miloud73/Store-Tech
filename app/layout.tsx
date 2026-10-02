import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";
// import { Toaster } from "react-hot-toast";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500"] });

export const metadata = {
  title: "Store Tech 💻✨",
  description: "E-Commerce with Next.js ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased text-gray-700`}>
        <ClerkProvider>
          {/* <Toaster /> */}
          <AppContextProvider>{children}</AppContextProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
