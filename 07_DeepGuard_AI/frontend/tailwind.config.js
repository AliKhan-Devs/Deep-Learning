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
        hud: {
          bg: "#040811",
          card: "#071220",
          cardInner: "#0a1729",
          border: "#132c4a",
          borderGlow: "#00f0ff33",
          cyan: "#00f0ff",
          cyanDim: "#00b4c8",
          amber: "#ff9900",
          amberDim: "#d97706",
          red: "#ff3366",
          green: "#00ffaa",
          muted: "#47617e",
          text: "#e2ecf5"
        },
        cyber: {
          dark: "#040811",
          card: "#071220",
          border: "#132c4a",
          accent: "#00f0ff",
          fake: "#ff3366",
          real: "#00ffaa",
          warning: "#ff9900"
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'scanline': 'scanline 4s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'radar-sweep': 'radarSweep 3s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
};
