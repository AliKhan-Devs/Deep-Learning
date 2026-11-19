import React from "react";
import "../styles/globals.css";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";

export const metadata = {
  title: "VisionAttend AI — Facial Attendance & Workforce Analytics",
  description:
    "Enterprise-grade biometric facial recognition attendance and workforce analytics system powered by deep metric learning (FaceNet Inception-ResNet-v1).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen flex antialiased">
        {/* Enterprise Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
