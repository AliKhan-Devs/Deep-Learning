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
        pacs: {
          950: '#06090e',
          900: '#0a0f18',
          850: '#0f1726',
          800: '#152033',
          700: '#1f2e47',
          600: '#2b3f5e',
          500: '#3d567d',
        },
        cyan: {
          450: '#00c4e6',
          550: '#00a8c7',
        },
        pathology: {
          glioma: '#f43f5e',
          meningioma: '#f59e0b',
          pituitary: '#8b5cf6',
          notumor: '#10b981',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
};
