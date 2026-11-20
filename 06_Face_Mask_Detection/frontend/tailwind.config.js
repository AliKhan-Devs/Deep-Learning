/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        surface: "#0f172a",
        "surface-light": "#1e293b",
        accent: "#06b6d4",
        "accent-glow": "rgba(6, 182, 212, 0.2)",
        compliant: "#10b981",
        violation: "#ef4444",
      },
    },
  },
  plugins: [],
};
