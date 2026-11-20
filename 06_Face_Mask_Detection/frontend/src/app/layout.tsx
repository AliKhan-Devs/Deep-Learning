import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "FaceMask AI — Real-Time Face Mask Detection",
  description: "Simple, real-time safety compliance and face mask detector powered by YOLOv26s.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
