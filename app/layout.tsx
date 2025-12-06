import "./globals.css";
import type { Metadata } from "next";
import ScrollProvider from "./components/ScrollProvider";
import CustomCursor from "./components/CustomCursor/CustomCursor";
import Header from "./components/Header/Header";

export const metadata: Metadata = {
  title: "Dhruv Krishna — Portfolio",
  description: "Portfolio website of Dhruv Krishna",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="
          min-h-screen 
          bg-[#020617] 
          text-gray-200 
          antialiased
          selection:bg-[#a855f7]/40
        "
      >
        <ScrollProvider>
          <Header />
          <CustomCursor />

          {children}
        </ScrollProvider>

        {/* Noise overlay */}
        <div className="pointer-events-none fixed inset-0 opacity-[0.03] bg-[url('/noise.png')]"></div>
      </body>
    </html>
  );
}
