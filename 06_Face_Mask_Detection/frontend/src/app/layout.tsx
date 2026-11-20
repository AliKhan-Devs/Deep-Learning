import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "FaceMask AI — Real-Time Face Mask Detection System",
  description: "Enterprise Face Mask Detection Workstation powered by YOLOv26s / YOLOv8 fine-tuned models.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 min-h-screen flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
