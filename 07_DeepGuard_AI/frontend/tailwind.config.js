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
        cyber: {
          dark: "#0b0f19",
          card: "#111827",
          border: "#1f2937",
          accent: "#38bdf8",
          fake: "#f43f5e",
          real: "#10b981",
          warning: "#f59e0b"
        }
      }
    },
  },
  plugins: [],
};
