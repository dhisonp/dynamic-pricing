import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        secondary: "var(--bg-secondary)",
        tertiary: "var(--bg-tertiary)",
        // Ardent Palette
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#050505',
        },
        emerald: {
          50: '#ECFDF5',
          500: '#10A860',
          600: '#059669', // fallback
          900: '#064E3B',
        },
        goldenrod: {
          50: '#FEFCE8',
          500: '#D4A012',
          700: '#A16207',
        },
        ocean: {
          50: '#F0F9FF',
          500: '#1A7A9C',
          600: '#0284C7', // fallback
        },
        red: {
          50: '#FEF2F2',
          500: '#DC2626',
          600: '#B91C1C',
        },
      },
      fontFamily: {
        sans: ['var(--font-fira-sans)', 'var(--font-inter)', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Charter', 'Palatino', 'Georgia', 'serif'], // Domine is no longer the primary, so just fallback here.
        mono: ['var(--font-ibm-plex-mono)', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      spacing: {
        '1': '0.25rem', // 4px
        '2': '0.5rem',  // 8px
        '3': '0.75rem', // 12px
        '4': '0.875rem', // 14px (Ardent custom scale for space.4)
        '5': '1rem',    // 16px
        '6': '1.25rem', // 20px
        '8': '1.75rem', // 28px
        '12': '2.5rem', // 40px
        '16': '3.5rem', // 56px
      },
      borderColor: {
        DEFAULT: "var(--border-default)",
        default: "var(--border-default)",
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        full: '9999px',
      },
      borderWidth: {
        DEFAULT: '1px',
        hairline: '1px',
        2: '2px',
      },
      boxShadow: {
        none: 'none',
        // Ardent explicitly rejects shadows.
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
      },
    },
  },
  plugins: [],
};
export default config;