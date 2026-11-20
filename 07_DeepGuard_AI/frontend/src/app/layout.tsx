import type { Metadata } from "next";
import "../styles/globals.css";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "DeepGuard AI | Deepfake Detection & Multi-Model Arena",
  description: "Advanced deepfake detection system powered by EfficientNet-B4 Champion, XceptionNet, and EfficientNet-B0 with 3-model live comparison.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 flex flex-col min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
