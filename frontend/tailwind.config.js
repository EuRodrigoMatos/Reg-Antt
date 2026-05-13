/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f4f8',
          100: '#d6e4f0',
          300: '#7aa5c8',
          400: '#3a6ea8',
          500: '#23435f',
          600: '#19324d',
          700: '#10253d',
        },

        antt: {
          laranja: '#FF6B00',
          laranjaEscuro: '#CC5500',
        },
      },
      keyframes: {
        'slide-in': {
          '0%':   { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
