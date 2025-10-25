/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Company Brand Colors
        brand: {
          primary: '#00adef',      // Cyan Blue
          secondary: '#000000',    // Black
          accent: '#e38524',       // Orange
        },
        
        // Semantic Color System
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#e6f7ff',
          100: '#b3e5ff',
          200: '#80d4ff',
          300: '#4dc2ff',
          400: '#1ab1ff',
          500: '#00adef',  // Main brand color
          600: '#0090cc',
          700: '#0073a6',
          800: '#005780',
          900: '#003a59',
        },
        
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#808080',
          500: '#4d4d4d',
          600: '#333333',
          700: '#1a1a1a',
          800: '#0d0d0d',
          900: '#000000',  // Main brand color
        },
        
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: '#fef3e6',
          100: '#fce0b3',
          200: '#facd80',
          300: '#f8ba4d',
          400: '#f6a71a',
          500: '#e38524',  // Main brand color
          600: '#c7711e',
          700: '#a55d19',
          800: '#834914',
          900: '#61350f',
        },
        
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Status Colors (using brand colors)
        success: '#10b981',
        warning: '#e38524',  // Using accent color
        error: '#ef4444',
        info: '#00adef',     // Using primary color
      },
      
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #00adef 0%, #0090cc 100%)',
        'gradient-brand-reverse': 'linear-gradient(135deg, #0090cc 0%, #00adef 100%)',
        'gradient-accent': 'linear-gradient(135deg, #e38524 0%, #f6a71a 100%)',
        'gradient-dark': 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        'gradient-hero': 'linear-gradient(135deg, #00adef 0%, #e38524 100%)',
      },
      
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(0, 173, 239, 0.25)',
        'brand-lg': '0 10px 40px 0 rgba(0, 173, 239, 0.35)',
        'accent': '0 4px 14px 0 rgba(227, 133, 36, 0.25)',
        'accent-lg': '0 10px 40px 0 rgba(227, 133, 36, 0.35)',
      },
      
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'float-delayed 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}
