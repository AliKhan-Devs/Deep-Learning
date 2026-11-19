/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        saas: {
          bg: "#090d16",
          card: "#0f172a",
          cardInner: "#1e293b",
          border: "#1e293b",
          primary: "#6366f1",
          primaryHover: "#4f46e5",
          accent: "#38bdf8",
          ontime: "#10b981",
          late: "#f59e0b",
          absent: "#f43f5e",
          departure: "#0284c7",
          text: "#f8fafc",
          muted: "#94a3b8"
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'scanner-laser': 'scanLaser 2.5s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        scanLaser: {
          '0%, 100%': { transform: 'translateY(-90%)', opacity: '0.4' },
          '50%': { transform: 'translateY(90%)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
};
