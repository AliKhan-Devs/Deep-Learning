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
        background: "#f8fafc",
        surface: "#ffffff",
        "surface-muted": "#f1f5f9",
        border: "#e2e8f0",
        primary: "#0284c7",
        "primary-hover": "#0369a1",
        compliant: "#059669",
        "compliant-bg": "#ecfdf5",
        violation: "#dc2626",
        "violation-bg": "#fef2f2",
      },
    },
  },
  plugins: [],
};
