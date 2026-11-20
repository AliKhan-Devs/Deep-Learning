import type { Metadata } from 'next';
import '../styles/globals.css';
import Header from '../components/Header';

export const metadata: Metadata = {
  title: 'NeuroScan XAI — Clinical Brain MRI Explainability System',
  description: 'Explainable Deep Learning Framework for Brain MRI Tumor Diagnosis with DenseNet-121, Grad-CAM++, and Shannon Entropy Uncertainty.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-pacs-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-pacs-800 bg-pacs-900/60 py-4 text-center text-xs text-slate-400">
          <p>
            NeuroScan XAI &copy; {new Date().getFullYear()} &mdash; Medical AI Research Framework &bull; DenseNet-121 Trained to 95.56% Test Accuracy
          </p>
        </footer>
      </body>
    </html>
  );
}
