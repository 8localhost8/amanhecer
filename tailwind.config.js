/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF7F0',
          100: '#F7F3EA', // Fundo principal modo claro
          200: '#EFE9DC',
          300: '#E5DDCB',
          400: '#D5C9B3',
        },
        sand: {
          50: '#FDFBF7',
          100: '#F4EFE6',
          200: '#E8E0D1',
          300: '#D9C7A3', // Areia destaque
          400: '#C7B28B',
          500: '#A89065',
        },
        sage: {
          50: '#F4F7F3',
          100: '#E3E9DE', // Pastel sálvia suave
          200: '#CAD5C4',
          300: '#AFC3A7', // Acento modo escuro
          400: '#98AD90',
          500: '#82917B', // Verde-sálvia base
          600: '#677860',
          700: '#50604B', // Verde para contraste alto com texto branco
          800: '#384836',
          900: '#253525', // Verde floresta editorial dos cards hero
          950: '#1A261A',
        },
        graphite: {
          50: '#F2EFE7',
          100: '#E1DDD4',
          200: '#C2C9BF',
          300: '#9DA399',
          400: '#7A8074',
          500: '#60665B',
          600: '#4B4F47',
          700: '#383B35', // Texto principal modo claro
          800: '#252A26', // Superfície modo escuro
          850: '#1F2420',
          900: '#1C201D',
          950: '#191C1A', // Fundo principal modo escuro
        },
        // Compatibilidade com tokens existentes
        dawn: {
          50: '#F4F7F3',
          100: '#E3E9DE',
          200: '#CAD5C4',
          300: '#AFC3A7',
          400: '#98AD90',
          500: '#82917B',
          600: '#677860',
          700: '#50604B',
          800: '#384836',
          900: '#253525',
          950: '#1A261A',
        },
        gold: {
          50: '#FDFBF7',
          100: '#F4EFE6',
          200: '#E8E0D1',
          300: '#D9C7A3',
          400: '#C7B28B',
          500: '#A89065',
          600: '#8F7850',
          700: '#75603C',
          800: '#5A492C',
          900: '#40331D',
          950: '#281F0E',
        },
        midnight: {
          800: '#252A26',
          850: '#1F2420',
          900: '#1C201D',
          950: '#191C1A',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
