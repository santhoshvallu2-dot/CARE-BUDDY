/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf8f4',
          100: '#f5eee4',
          200: '#ebdcd0',
          300: '#dec4b0',
          400: '#c8a082',
          500: '#a87852',
          600: '#7a4e2d', // Rich Warm Coffee
          700: '#5c381c',
          800: '#3d2310',
          900: '#26160a',
          950: '#180d05',
        },
        warm: {
          50: '#fdfbf7',  // Primary Warm Cream Background
          100: '#f7f3eb', // Light Beige Surface
          200: '#ebe3d5', // Soft Warm Border
          300: '#ded3c1', // Medium Tan Border
          400: '#a89d8f', // Supporting Text
          500: '#756b5f', // Secondary Body Text
          600: '#52493f', // Dark Body Text
          700: '#383027', // Deep Charcoal
          800: '#241e18', // Very Dark Brown/Black
          900: '#17130f', // Primary High-Contrast Heading
          950: '#0d0a08',
        },
        coffee: {
          50: '#f9f6f2',
          100: '#f1ebd8',
          200: '#e2d3bb',
          300: '#cbb391',
          400: '#af8f66',
          500: '#8e6c43',
          600: '#6f4f29',
          700: '#52381a',
          800: '#36230f',
          900: '#201407',
        },
        caramel: {
          50: '#fdf9f3',
          100: '#fbf0de',
          200: '#f6debc',
          300: '#ecc691',
          400: '#dfa661',
          500: '#ca8536',
          600: '#a76423',
          700: '#804818',
        },
        natural: {
          greenBg: '#f2f8f0',
          greenBorder: '#d5e9cf',
          greenText: '#234a21',
          yellowBg: '#fef9ec',
          yellowBorder: '#faeab7',
          yellowText: '#594002',
          redBg: '#fdf2f2',
          redBorder: '#f8d4d4',
          redText: '#661b1e',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(40, 25, 15, 0.04)',
        'xs': '0 1px 3px 0 rgba(40, 25, 15, 0.06), 0 1px 2px -1px rgba(40, 25, 15, 0.04)',
        'warm': '0 4px 16px -2px rgba(60, 40, 25, 0.08)',
        'warm-card': '0 2px 8px 0 rgba(50, 35, 20, 0.05)',
      }
    },
  },
  plugins: [],
}
